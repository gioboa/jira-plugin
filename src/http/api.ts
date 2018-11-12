const jiraClient = require('jira-connector');
import { getConfigurationByKey, getGlobalStateConfiguration } from '../shared/configuration';
import { CONFIG, CREDENTIALS_SEPARATOR } from '../shared/constants';
import { printErrorMessageInOutput } from '../state/state';
import { IAddComment, IAddCommentResponse, IAddWorkLog, IAssignee, IIssues, IJira, IProject, ISetTransition, IStatus, ITransitions, IIssueType, ICreateIssue } from './api.model';

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
        var options = this.jiraInstance.project.buildRequestOptions(opts, '', 'GET');
        if (Object.keys(options.body).length === 0) {
          delete options.body;
        }
        if (Object.keys(options.qs).length === 0) {
          delete options.qs;
        }
        return this.jiraInstance.makeRequest(options, callback);
      };
      this.jiraInstance.project.getAllProjects = customGetAllProjects;

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
      printErrorMessageInOutput('Error: Check Jira Plugin settings in VSCode.');
    }
  }

  async search(params: { jql: string; maxResults?: number }): Promise<IIssues> {
    return await this.jiraInstance.search.search(params);
  }

  async getStatuses(): Promise<IStatus[]> {
    return await this.jiraInstance.status.getAllStatuses();
  }

  async getProjects(): Promise<IProject[]> {
    return await this.jiraInstance.project.getAllProjects();
  }

  async getAssignees(params: { project: string; maxResults?: number }): Promise<IAssignee[]> {
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
    return await this.jiraInstance.issue.assignIssue(params);
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
}
