import { getConfigurationByKey, getGlobalStateConfiguration } from '../shared/configuration';
import { ASSIGNEES_MAX_RESULTS, CONFIG, CREDENTIALS_SEPARATOR } from '../shared/constants';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
import {
  IAddComment,
  IAddCommentResponse,
  IAddWorkLog,
  IAssignee,
  IAvailableLinkIssuesType,
  ICreateIssue,
  ICreateIssueEpic,
  ICreateMetadata,
  IFavouriteFilter,
  IIssue,
  IIssueType,
  IJira,
  ILabel,
  IPriority,
  IProject,
  ISearch,
  ISetTransition,
  IStatus,
  ITransitions
} from './api.model';

const jiraClient = require('jira-connector');

export class Jira implements IJira {
  jiraInstance: any;
  baseUrl: string;

  constructor() {
    this.baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';

    if (this.baseUrl && getGlobalStateConfiguration()) {
      // prepare config for jira-connector
      let host = this.baseUrl;
      const protocol = host.indexOf('https://') >= 0 ? 'https' : 'http';
      host = host.replace('https://', '').replace('http://', '');
      const portPosition = host.indexOf(':');
      const port = portPosition !== -1 ? host.substring(portPosition + 1) : undefined;
      if (portPosition !== -1) {
        host = host.substring(0, portPosition);
      }
      const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
      this.jiraInstance = new jiraClient({ host, port, protocol, basic_auth: { username, password } });

      // custom event
      // solve this issue -> https://github.com/floralvikings/jira-connector/issues/115
      const customGetAllProjects = (opts: any, callback: any) => {
        const options = this.jiraInstance.project.buildRequestOptions(opts, '', 'GET');
        if (Object.keys(options.body).length === 0) {
          delete options.body;
        }
        if (Object.keys(options.qs).length === 0) {
          delete options.qs;
        }
        return this.jiraInstance.makeRequest(options, callback);
      };
      this.jiraInstance.project.getAllProjects = customGetAllProjects;

      const customApiCall = (uri: string, callback: any) => {
        const options = this.jiraInstance.project.buildRequestOptions({}, '', 'GET');
        if (Object.keys(options.body).length === 0) {
          delete options.body;
        }
        if (Object.keys(options.qs).length === 0) {
          delete options.qs;
        }
        options.uri = uri;
        return this.jiraInstance.makeRequest(options, callback);
      };
      this.jiraInstance.project.customApiCall = customApiCall;
    } else {
      printErrorMessageInOutputAndShowAlert('Error: Check Jira Plugin settings in VSCode.');
    }
  }

  async search(params: { jql: string; maxResults: number }): Promise<ISearch> {
    // from jira-connector docs
    // The maximum number of issues to return (defaults to 50). The maximum allowable
    // value is dictated by the Jira property 'jira.search.views.default.max'. If you specify a value that is
    // higher than this number, your search results will be truncated.
    return await this.jiraInstance.search.search(params);
  }

  async getStatuses(): Promise<IStatus[]> {
    return await this.jiraInstance.status.getAllStatuses();
  }

  async getProjects(): Promise<IProject[]> {
    return await this.jiraInstance.project.getAllProjects();
  }

  async getIssueByKey(issueKey: string): Promise<IIssue> {
    return await this.jiraInstance.issue.getIssue({ issueKey });
  }

  async getAssignees(project: string): Promise<IAssignee[]> {
    // from jira-connector docs
    // The maximum number of users to return (defaults to 50). The maximum allowed
    // value is 1000. If you specify a value that is higher than this number, your search results will be
    // truncated.
    const maxResults = ASSIGNEES_MAX_RESULTS;
    const assignees = [];
    let startAt = 0;
    let goOn = true;
    while (goOn) {
      const response: IAssignee[] = await this.jiraInstance.user.searchAssignable({ project, maxResults, startAt });
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
    return await this.jiraInstance.issue.getTransitions({ issueKey });
  }

  async setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void> {
    return await this.jiraInstance.issue.transitionIssue(params);
  }

  async setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void> {
    return await this.jiraInstance.issue.assignIssue(params);
  }

  async addNewComment(params: { issueKey: string; comment: IAddComment }): Promise<IAddCommentResponse> {
    return await this.jiraInstance.issue.addComment(params);
  }

  async addWorkLog(params: { issueKey: string; worklog: IAddWorkLog }): Promise<void> {
    return await this.jiraInstance.issue.addWorkLog(params);
  }

  async getAllIssueTypes(): Promise<IIssueType[]> {
    return await this.jiraInstance.issueType.getAllIssueTypes();
  }

  async createIssue(params: ICreateIssue): Promise<any> {
    return await this.jiraInstance.issue.createIssue(params);
  }

  async getAllPriorities(): Promise<IPriority[]> {
    return await this.jiraInstance.priority.getAllPriorities();
  }

  async getAllIssueTypesWithFields(project: string): Promise<IIssueType[]> {
    const response = await this.jiraInstance.issue.getCreateMetadata({
      projectKeys: project,
      expand: 'projects.issuetypes.fields'
    } as ICreateMetadata);
    if (!!response.projects && response.projects.length > 0) {
      return response.projects[0].issuetypes;
    }
    return [];
  }

  async customApiCall(uri: string): Promise<any> {
    return await this.jiraInstance.project.customApiCall(uri);
  }

  async getFavoriteFilters(): Promise<IFavouriteFilter[]> {
    return await this.jiraInstance.filter.getFavoriteFilters();
  }

  async getCreateIssueEpics(projectKey: string, maxResults: number): Promise<ICreateIssueEpic> {
    return await this.customApiCall(
      `${this.baseUrl}/rest/greenhopper/1.0/epics?searchQuery=&projectKey=${projectKey}&maxResults=${maxResults}&hideDone=false`
    );
  }

  async getCreateIssueLabels(): Promise<{ suggestions: ILabel[] }> {
    return await this.customApiCall(this.baseUrl + '/rest/api/1.0/labels/suggest?query=');
  }

  async getAvailableLinkIssuesType(): Promise<{ issueLinkTypes: IAvailableLinkIssuesType[] }> {
    // TODO - need to manage also opposed types. e.g blocks <-> is blocked by
    return await this.jiraInstance.issueLinkType.getAvailableTypes();
  }
}
