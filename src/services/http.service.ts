import * as https from 'https';
import { Version2Client } from 'jira.js';
import { configuration, logger } from '.';
import {
  ASSIGNEES_MAX_RESULTS,
  CONFIG,
  ERROR_WRONG_CONFIGURATION,
  UNASSIGNED,
} from '../shared/constants';
import {
  IAddComment,
  IAddCommentResponse,
  IAddWorkLog,
  IAssignee,
  IAvailableLinkIssuesType,
  ICreateIssue,
  ICreateIssueEpic,
  IFavouriteFilter,
  IIssue,
  IIssueType,
  IJira,
  ILabel,
  IMarkNotificationAsReadUnread,
  INotifications,
  IPriority,
  IProject,
  ISearch,
  ISetTransition,
  ISprint,
  IStatus,
  ITransitions,
} from './http.model';

// max page size accepted by /rest/api/2/search/jql
const ENHANCED_SEARCH_PAGE_SIZE = 100;
// Jira Cloud account ids look like "712020:uuid" or 24 hex chars; Jira Server uses usernames
const ACCOUNT_ID_REGEXP = /^([0-9a-f]{24}|[0-9a-z]+:[0-9a-f-]{36})$/i;

const errorStatus = (err: any): number | undefined =>
  !!err && typeof err === 'object' ? err.status || err.statusCode : undefined;

const errorText = (err: any): string => {
  if (!err) {
    return '';
  }
  if (typeof err === 'string') {
    return err;
  }
  try {
    return JSON.stringify(err.response || err.message || err);
  } catch (e) {
    return `${err}`;
  }
};

// Jira Cloud removed POST /rest/api/2/search (CHANGE-2046) -> use /rest/api/2/search/jql
// https://developer.atlassian.com/changelog/#CHANGE-2046
const isSearchApiRemoved = (err: any): boolean =>
  errorStatus(err) === 410 || errorText(err).indexOf('search/jql') !== -1;

export class Jira implements IJira {
  client: Version2Client;
  baseUrl: string;
  private cloudSession: { name: string; value: string } | undefined;
  private useEnhancedSearch = false;

  constructor() {
    if (!configuration.isValid()) {
      if (
        !!configuration.get(CONFIG.BASE_URL) &&
        !!configuration.credentials.username &&
        !!configuration.credentials.password
      ) {
        logger.printErrorMessageInOutputAndShowAlert('Check Jira Plugin settings in VSCode.');
      }
      this.baseUrl = '';
      throw new Error(ERROR_WRONG_CONFIGURATION);
    }

    this.baseUrl = configuration.get(CONFIG.BASE_URL);
    // Jira Cloud has already removed the legacy search API, skip the useless first call
    this.useEnhancedSearch = /\.atlassian\.net$/i.test(this.baseUrl);

    const strictSSL = configuration.get(CONFIG.STRICT_SSL);
    const { username, password } = configuration.credentials;

    this.client = new Version2Client({
      host: this.baseUrl,
      authentication: { basic: { email: username, apiToken: password } },
      baseRequestConfig: {
        timeout: configuration.get(CONFIG.REQUESTS_TIMEOUT) * 1000 * 60,
        httpsAgent:
          strictSSL === 'false' ? new https.Agent({ rejectUnauthorized: false }) : undefined,
      },
    });
  }

  async getCloudSession(): Promise<{ name: string; value: string }> {
    if (!this.cloudSession) {
      const response = await this.customRequest(
        'POST',
        this.baseUrl + '/rest/auth/1/session',
        { Origin: this.baseUrl },
        configuration.credentials
      );
      this.cloudSession = response.session;
    }
    return this.cloudSession as { name: string; value: string };
  }

  async search(params: { jql: string; maxResults: number }): Promise<ISearch> {
    if (!this.useEnhancedSearch) {
      try {
        return (await this.client.issueSearch.searchForIssuesUsingJqlPost(params)) as ISearch;
      } catch (err) {
        if (!isSearchApiRemoved(err)) {
          throw err;
        }
        this.useEnhancedSearch = true;
      }
    }
    return this.enhancedSearch(params);
  }

  private async enhancedSearch(params: { jql: string; maxResults: number }): Promise<ISearch> {
    const maxResults = params.maxResults || 50;
    const issues: IIssue[] = [];
    let nextPageToken: string | undefined;
    do {
      const response = await this.client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql: params.jql,
        maxResults: Math.min(maxResults - issues.length, ENHANCED_SEARCH_PAGE_SIZE),
        fields: ['*navigable'],
        nextPageToken,
      });
      issues.push(...((response.issues || []) as any[]));
      nextPageToken = response.nextPageToken;
    } while (!!nextPageToken && issues.length < maxResults);
    return { issues, maxResults, startAt: 0, total: issues.length };
  }

  async getStatuses(): Promise<IStatus[]> {
    return (await this.client.workflowStatuses.getStatuses()) as IStatus[];
  }

  async getProjects(): Promise<IProject[]> {
    // Jira Cloud: paginated endpoint
    try {
      const projects: IProject[] = [];
      let startAt = 0;
      let isLast = false;
      while (!isLast) {
        const page = await this.client.projects.searchProjects({ startAt, maxResults: 100 });
        projects.push(...((page.values || []) as any[]));
        startAt += (page.values || []).length;
        isLast = page.isLast !== false || (page.values || []).length === 0;
      }
      return projects;
    } catch (err) {
      // Jira Server / Data Center: /project/search doesn't exist
      if (errorStatus(err) !== 404) {
        throw err;
      }
    }
    return this.client.sendRequest<IProject[]>(
      { url: '/rest/api/2/project', method: 'GET' },
      undefined as never
    );
  }

  async getIssueByKey(issueKey: string): Promise<IIssue> {
    return (await this.client.issues.getIssue({ issueIdOrKey: issueKey })) as any;
  }

  async getAssignees(project: string): Promise<IAssignee[]> {
    const maxResults = ASSIGNEES_MAX_RESULTS;
    const assignees: IAssignee[] = [];
    let startAt = 0;
    let goOn = true;
    while (goOn) {
      const response = (await this.client.userSearch.findAssignableUsers({
        project,
        maxResults,
        startAt,
      })) as any[];
      assignees.push(...response);
      if ((response || []).length < maxResults) {
        goOn = false;
      } else {
        startAt += maxResults;
      }
    }
    return assignees;
  }

  async getTransitions(issueKey: string): Promise<ITransitions> {
    return (await this.client.issues.getTransitions({ issueIdOrKey: issueKey })) as ITransitions;
  }

  async setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void> {
    return this.client.issues.doTransition({
      issueIdOrKey: params.issueKey,
      transition: params.transition.transition,
    });
  }

  async setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void> {
    const assignee = params.assignee;
    let data: any;
    if (assignee === UNASSIGNED) {
      data = { name: null, accountId: null };
    } else if (ACCOUNT_ID_REGEXP.test(assignee)) {
      data = { accountId: assignee }; // Jira Cloud
    } else {
      data = { name: assignee }; // Jira Server / Data Center
    }
    return this.client.sendRequest<void>(
      { url: `/rest/api/2/issue/${params.issueKey}/assignee`, method: 'PUT', data },
      undefined as never
    );
  }

  async addNewComment(params: {
    issueKey: string;
    comment: IAddComment;
  }): Promise<IAddCommentResponse> {
    return (await this.client.issueComments.addComment({
      issueIdOrKey: params.issueKey,
      comment: params.comment.body,
      properties: params.comment.properties,
    })) as IAddCommentResponse;
  }

  async addWorkLog(params: IAddWorkLog): Promise<void> {
    await this.client.issueWorklogs.addWorklog({
      issueIdOrKey: params.issueKey,
      timeSpentSeconds: params.timeSpentSeconds,
      comment: params.comment,
      started: params.started,
    });
  }

  async getAllIssueTypes(): Promise<IIssueType[]> {
    return (await this.client.issueTypes.getIssueAllTypes()) as any;
  }

  async createIssue(params: ICreateIssue): Promise<any> {
    return this.client.issues.createIssue(params as any);
  }

  async getAllPriorities(): Promise<IPriority[]> {
    return (await this.client.issuePriorities.getPriorities()) as IPriority[];
  }

  async getAllIssueTypesWithFields(project: string): Promise<IIssueType[]> {
    // legacy endpoint: one call with the fields expanded (Jira Server and old Jira Cloud)
    try {
      const response = await this.client.issues.getCreateIssueMeta({
        projectKeys: [project],
        expand: 'projects.issuetypes.fields',
      });
      const issueTypes: any[] =
        (!!response.projects && response.projects.length > 0 && response.projects[0].issuetypes) ||
        [];
      if (issueTypes.length > 0 && issueTypes.every((type) => !!type.fields)) {
        return issueTypes;
      }
    } catch (err) {
      if (errorStatus(err) !== 404 && errorStatus(err) !== 410) {
        throw err;
      }
    }
    // Jira Cloud: expand has been removed, fields must be fetched per issue type
    const page = await this.client.issues.getCreateIssueMetaIssueTypes({
      projectIdOrKey: project,
      maxResults: 200,
    });
    const issueTypes: IIssueType[] = [];
    for (const type of page.issueTypes || []) {
      const fieldsPage = await this.client.issues.getCreateIssueMetaIssueTypeId({
        projectIdOrKey: project,
        issueTypeId: `${type.id}`,
        maxResults: 200,
      });
      const fields: { [key: string]: any } = {};
      (fieldsPage.fields || []).forEach((field: any) => {
        fields[field.fieldId || field.key] = { ...field, key: field.fieldId || field.key };
      });
      issueTypes.push({ ...(type as any), fields });
    }
    return issueTypes;
  }

  async customRequest(method: 'GET' | 'POST', uri: string, headers?: {}, body?: {}): Promise<any> {
    const requestHeaders: { [key: string]: any } = { ...(headers || {}) };
    if (!!requestHeaders.deleteAuth) {
      // use the cookie session instead of basic auth
      delete requestHeaders.deleteAuth;
      requestHeaders.Authorization = undefined;
    }
    return this.client.sendRequest<any>(
      {
        url: uri,
        method,
        headers: requestHeaders,
        data: !!body && Object.keys(body).length > 0 ? body : undefined,
      },
      undefined as never
    );
  }

  async getFavoriteFilters(): Promise<IFavouriteFilter[]> {
    return (await this.client.filters.getFavouriteFilters()) as IFavouriteFilter[];
  }

  async getCreateIssueEpics(projectKey: string, maxResults: number): Promise<ICreateIssueEpic> {
    return await this.customRequest(
      'GET',
      `${this.baseUrl}/rest/greenhopper/1.0/epics?searchQuery=&projectKey=${projectKey}&maxResults=${maxResults || 25}&hideDone=false`
    );
  }

  async getCreateIssueLabels(): Promise<{ suggestions: ILabel[] }> {
    return await this.customRequest('GET', this.baseUrl + '/rest/api/1.0/labels/suggest?query=');
  }

  async getAvailableLinkIssuesType(): Promise<{ issueLinkTypes: IAvailableLinkIssuesType[] }> {
    // TODO - need to manage also opposed types. e.g blocks <-> is blocked by
    return (await this.client.issueLinkTypes.getIssueLinkTypes()) as any;
  }

  async getNotifications(lastId: string): Promise<INotifications> {
    const cloudSession = await this.getCloudSession();
    return this.customRequest(
      'GET',
      this.baseUrl +
        `/gateway/api/notification-log/api/2/notifications?direct=true&includeContent=false${!!lastId ? '&after=' + lastId : ''}`,
      {
        cookie: `${cloudSession.name}=${cloudSession.value}`,
        deleteAuth: 'TRUE',
      },
      {}
    );
  }

  async markNotificationsAsReadUnread(payload: IMarkNotificationAsReadUnread): Promise<any> {
    const cloudSession = await this.getCloudSession();
    return this.customRequest(
      'POST',
      this.baseUrl + `/gateway/api/notification-log/api/2/notifications/mark/bulk`,
      {
        cookie: `${cloudSession.name}=${cloudSession.value}`,
        deleteAuth: 'TRUE',
        Origin: this.baseUrl,
      },
      payload
    );
  }

  async getSprints(): Promise<{ allMatches: any[]; suggestions: ISprint[] }> {
    return await this.customRequest('GET', this.baseUrl + '/rest/greenhopper/1.0/sprint/picker');
  }
}
