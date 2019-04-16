import * as vscode from 'vscode';
import { store } from '.';
import {
  CONFIG,
  CONFIG_COUNTER,
  CONFIG_NAME,
  CONFIG_WORKING_ISSUE,
  CREDENTIALS_SEPARATOR,
  DEFAULT_WORKING_ISSUE_ASSIGNEE,
  DEFAULT_WORKING_ISSUE_STATUS
} from '../shared/constants';
import { IConfiguration } from './configuration.model';
import { IStatus, IWorkingIssue } from './http.model';

export default class ConfigurationService {
  // all the plugin settings
  private settings: IConfiguration = { ...vscode.workspace.getConfiguration(CONFIG_NAME) };

  public isValid(): boolean {
    if (!this.settings) {
      return false;
    }
    const { baseUrl } = this.settings;
    const { username } = this.settings;
    const { password } = this.credentials;

    return !!(baseUrl && username && password);
  }

  public get credentials(): { username: string; password: string } {
    const config = this.settings;
    const credentials: string = (config && this.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`)) || '';
    let jsonCredentials = undefined;
    try {
      jsonCredentials = JSON.parse(credentials);
    } catch (e) {
      //
    }
    if (!!jsonCredentials) {
      return jsonCredentials;
    }
    return this.OLD_credentials;
  }

  // DEPRECATED
  public get OLD_credentials(): { username: string; password: string } {
    const config = this.settings;
    const credentials: string = (config && this.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`)) || '';
    const [username = '', password = ''] = credentials.split(CREDENTIALS_SEPARATOR);
    return { username, password };
  }

  // used for get only one setting
  public get(entry: string, fallbackValue?: any): any {
    if (!this.settings) {
      return fallbackValue;
    }
    return this.settings.hasOwnProperty(entry) && this.settings[entry] !== undefined ? this.settings[entry] : fallbackValue;
  }

  // used for set only one setting
  public async set(entry: string, value: any): Promise<any> {
    // remove / at the end if exist
    if (entry === CONFIG.BASE_URL && typeof value === 'string') {
      value = value.replace(/\/$/, '');
    }
    // update settings object - Fix issue #97
    (<any>this.settings)[entry] = value;
    // update VsCode settings
    // save inside workspace folder if exist - Close #98
    const globalConfigurationTarget = entry !== CONFIG.WORKING_PROJECT || !vscode.workspace.workspaceFolders;
    return this.settings && this.settings.update(entry, value, globalConfigurationTarget);
  }

  // set inside VS Code local storage the settings
  public async setPassword(password: string | undefined): Promise<void> {
    const config = this.settings;
    return (
      config &&
      this.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, JSON.stringify({ username: config.username, password: password || '' }))
    );
  }

  // DEPRECATED
  public async OLD_setPassword(password: string | undefined): Promise<void> {
    const config = this.settings;
    return (
      config && this.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`)
    );
  }

  // get inside VS Code local storage the settings
  public get globalState(): vscode.Memento {
    return store.state.context.globalState;
  }

  // set inside VS Code local storage the last working issue
  // used for remember last working issue if the user close VS Code without stop the tracking
  public async setGlobalWorkingIssue(workingIssue: IWorkingIssue | undefined): Promise<void> {
    const config = this.settings;
    return (
      config &&
      this.globalState.update(
        `${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`,
        !!workingIssue ? JSON.stringify(workingIssue) : undefined
      )
    );
  }

  // get inside VS Code local storage the last working issue
  public getGlobalWorkingIssue(): any {
    const config = this.settings;
    return config && this.globalState.get(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`);
  }

  public setGlobalCounter(count: number): Thenable<void> {
    return this.globalState.update(`${CONFIG_NAME}:${CONFIG_COUNTER}`, count);
  }

  public getGlobalCounter(): any {
    return this.globalState.get(`${CONFIG_NAME}:${CONFIG_COUNTER}`);
  }

  public workingIssueStatuses(statuses?: IStatus[]): string {
    let statusList = (this.get(CONFIG.WORKING_ISSUE_STATUSES) || DEFAULT_WORKING_ISSUE_STATUS)
      .split(',')
      .map((status: string) => status.trim())
      .filter((status: string) =>
        (statuses || store.state.statuses).some(stateStatus => stateStatus.name.toLowerCase() === status.toLowerCase())
      );
    return statusList && statusList.length > 0
      ? statusList.reduce((a: string, b: string) => (a === '' ? a + `'${b}'` : `${a},'${b}'`), '')
      : `'${DEFAULT_WORKING_ISSUE_STATUS}'`;
  }

  public workingIssueAssignees(): string {
    let assignees = (this.get(CONFIG.WORKING_ISSUE_ASSIGNEES).toString() || DEFAULT_WORKING_ISSUE_ASSIGNEE)
      .split(',')
      .map((status: string) => status.replace(/CURRENT_USER/g, 'currentUser()').trim());
    return assignees && assignees.length > 0
      ? assignees
          .reduce((a: string, b: string) => (a === '' ? a + `'${b}'` : `${a},'${b}'`), '')
          .replace(`'currentUser()'`, `currentUser()`)
      : DEFAULT_WORKING_ISSUE_ASSIGNEE;
  }
}
