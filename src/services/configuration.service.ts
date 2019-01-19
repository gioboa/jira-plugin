import * as vscode from 'vscode';
import { logger } from '.';
import { IWorkingIssue } from '../http/api.model';
import {
  CONFIG,
  CONFIG_COUNTER,
  CONFIG_NAME,
  CONFIG_WORKING_ISSUE,
  CREDENTIALS_SEPARATOR,
  DEFAULT_WORKING_ISSUE_STATUS
} from '../shared/constants';
import state from '../store/state';
import { IConfiguration } from './configuration.model';

export default class ConfigurationService {
  public isValid(): boolean {
    const [username, password] = this.globalState.split(CREDENTIALS_SEPARATOR);
    const config = this.settings;
    return !!(config && config.baseUrl && username && password);
  }

  // all the plugin settings
  private get settings(): IConfiguration | undefined {
    const config: IConfiguration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
    if (!config) {
      logger.printErrorMessageInOutputAndShowAlert('No settings found. Probably an error in vscode');
    }
    return config;
  }

  // used for get only one setting
  public get(entry: string, fallbackValue?: string): string {
    const config = this.settings;
    let result = config && (<any>config).get(entry);
    // remove / at the end if exist
    switch (entry) {
      case CONFIG.BASE_URL: {
        if (result && result.substring(result.length - 1) === '/') {
          result = result.substring(0, result.length - 1);
        }
        break;
      }
    }
    return (result || fallbackValue || '').toString();
  }

  // used for set only one setting
  public async set(entry: string, value: string | undefined): Promise<any> {
    const config = this.settings;
    return config && config.update(entry, value || '', true);
  }

  // set inside VS Code local storage the settings
  public async setGlobalState(password: string | undefined): Promise<void> {
    const config = this.settings;
    return (
      config &&
      state.context.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`)
    );
  }

  // get inside VS Code local storage the settings
  public get globalState(): any {
    const config = this.settings;
    return config && state.context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`);
  }

  // set inside VS Code local storage the last working issue
  // used for remember last working issue if the user close VS Code without stop the tracking
  public async setGlobalWorkingIssue(workingIssue: IWorkingIssue | undefined): Promise<void> {
    const config = this.settings;
    return (
      config &&
      state.context.globalState.update(
        `${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`,
        !!workingIssue ? JSON.stringify(workingIssue) : undefined
      )
    );
  }

  // get inside VS Code local storage the last working issue
  public getGlobalWorkingIssue(): any {
    const config = this.settings;
    return config && state.context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`);
  }

  public setGlobalCounter(count: number): Thenable<void> {
    return state.context.globalState.update(`${CONFIG_NAME}:${CONFIG_COUNTER}`, count);
  }

  public getGlobalCounter(): any {
    return state.context.globalState.get(`${CONFIG_NAME}:${CONFIG_COUNTER}`);
  }

  public workingIssueStatuses(): string {
    let statusList = (this.get(CONFIG.WORKING_ISSUE_STATUSES) || DEFAULT_WORKING_ISSUE_STATUS)
      .split(',')
      .map((status: string) => status.trim())
      .filter((status: string) => state.statuses.some(stateStatus => stateStatus.name.toLowerCase() === status.toLowerCase()));
    return statusList && statusList.length > 0
      ? statusList.reduce((a: string, b: string) => (a === '' ? a + `'${b}'` : `${a},'${b}'`), '')
      : `'${DEFAULT_WORKING_ISSUE_STATUS}'`;
  }
}
