const jiraClient = require('jira-connector');
import { getConfigurationByKey, getGlobalStateConfiguration } from '../shared/configuration';
import { CONFIG, CREDENTIALS_SEPARATOR } from '../shared/constants';
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
  IIssueType,
  IJira,
  ILabel,
  IPriority,
  IProject,
  IIssue,
  ISearch,
  ISetTransition,
  IStatus,
  ITransitions
} from './api.model';

export class Jira implements IJira {
  jiraInstance: any;

  constructor() {
    let baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';
    if (baseUrl && getGlobalStateConfiguration()) {
      // prepare config for jira-connector
      const protocol = baseUrl.indexOf('https://') >= 0 ? 'https' : 'http';
      baseUrl = baseUrl.replace('https://', '').replace('http://', '');
      const portPosition = baseUrl.indexOf(':');
      const port = portPosition !== -1 ? baseUrl.substring(portPosition + 1) : undefined;
      if (portPosition !== -1) {
        baseUrl = baseUrl.substring(0, portPosition);
      }

      const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
      this.jiraInstance = new jiraClient({
        host: baseUrl,
        port,
        protocol,
        basic_auth: { username, password }
      });

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

      /* code for oauth copy from -> https://www.npmjs.com/package/jira-connector
      this.jiraInstance = new jiraClient({
        host: 'jenjinstudios.atlassian.net',
        oauth: {
          consumer_key: 'your-consumer-key',
          private_key: '-----BEGIN RSA PRIVATE KEY-----\n' + 'SomePrivateKey\n' + '-----END RSA PRIVATE KEY-----',
          token: 'your-access-token',
          token_secret: 'your-token-secret'
        }
      });
      */
    } else {
      printErrorMessageInOutputAndShowAlert('Error: Check Jira Plugin settings in VSCode.');
    }
  }

  async search(params: { jql: string; maxResults: number }): Promise<ISearch> {
    // from jira-connector docs
    // The maximum number of issues to return (defaults to 50). The maximum allowable
    // value is dictated by the JIRA property 'jira.search.views.default.max'. If you specify a value that is
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

  async getAssignees(params: { project: string; maxResults: number }): Promise<IAssignee[]> {
    // from jira-connector docs
    // The maximum number of users to return (defaults to 50). The maximum allowed
    // value is 1000. If you specify a value that is higher than this number, your search results will be
    // truncated.
    return await this.jiraInstance.user.searchAssignable(params);
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

  async getCreateIssueEpics(baseUrl: string, projectKey: string, maxResults: number): Promise<ICreateIssueEpic> {
    return await this.customApiCall(
      `${baseUrl}/rest/greenhopper/1.0/epics?searchQuery=&projectKey=${projectKey}&maxResults=${maxResults}&hideDone=false`
    );
  }

  async getCreateIssueLabels(baseUrl: string): Promise<{ suggestions: ILabel[] }> {
    return await this.customApiCall(baseUrl + '/rest/api/1.0/labels/suggest?query=');
  }

  async getAvailableLinkIssuesType(): Promise<{ issueLinkTypes: IAvailableLinkIssuesType[] }> {
    return await this.jiraInstance.issueLinkType.getAvailableTypes();
  }
}
