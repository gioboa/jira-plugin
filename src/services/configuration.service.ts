import * as vscode from 'vscode';
import { logger } from '.';
import { IWorkingIssue } from '../http/api.model';
import { CONFIG, CONFIG_COUNTER, CONFIG_NAME, CONFIG_WORKING_ISSUE, CREDENTIALS_SEPARATOR } from '../shared/constants';
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
  public get(entry: string): string | undefined {
    const config = this.settings;
    let result = config && (<any>config).get(entry);
    // remove / at the end if exist
    if (entry === CONFIG.BASE_URL && result && result.substring(result.length - 1) === '/') {
      result = result.substring(0, result.length - 1);
    }
    return result;
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
  public async setGlobalWorkingIssue(context: vscode.ExtensionContext, workingIssue: IWorkingIssue | undefined): Promise<void> {
    const config = this.settings;
    return (
      config &&
      context.globalState.update(
        `${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`,
        !!workingIssue ? JSON.stringify(workingIssue) : undefined
      )
    );
  }

  // get inside VS Code local storage the last working issue
  public getGlobalWorkingIssue(context: vscode.ExtensionContext): any {
    const config = this.settings;
    return config && context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`);
  }

  public setGlobalCounter(context: vscode.ExtensionContext, count: number): Thenable<void> {
    return context.globalState.update(`${CONFIG_NAME}:${CONFIG_COUNTER}`, count);
  }

  public getGlobalCounter(context: vscode.ExtensionContext): any {
    return context.globalState.get(`${CONFIG_NAME}:${CONFIG_COUNTER}`);
  }
}
