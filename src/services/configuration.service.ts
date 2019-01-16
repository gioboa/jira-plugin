import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import { CONFIG, CONFIG_COUNTER, CONFIG_NAME, CONFIG_WORKING_ISSUE, CREDENTIALS_SEPARATOR } from '../shared/constants';
import state from '../store/state';
import { IConfiguration } from './configuration.model';
import { logger } from '.';

export default class ConfigurationService {
  public configIsCorrect(): boolean {
    const [username, password] = this.getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
    const config = this.getConfiguration();
    return !!(config && config.baseUrl && username && password);
  }

  // all the plugin configuration
  private getConfiguration(): IConfiguration | undefined {
    const config: IConfiguration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
    if (!config) {
      logger.printErrorMessageInOutputAndShowAlert('No configuration found. Probably an error in vscode');
    }
    return config;
  }

  // used for get only one setting
  public getConfigurationByKey(entry: string): string | undefined {
    const config = this.getConfiguration();
    let result = config && (<any>config).get(entry);
    // remove / at the end if exist
    if (entry === CONFIG.BASE_URL && result && result.substring(result.length - 1) === '/') {
      result = result.substring(0, result.length - 1);
    }
    return result;
  }

  // used for set only one setting
  public async setConfigurationByKey(entry: string, value: string | undefined): Promise<any> {
    const config = this.getConfiguration();
    return config && config.update(entry, value || '', true);
  }

  // set inside VS Code local storage the configuration
  public async setGlobalStateConfiguration(password: string | undefined): Promise<void> {
    const config = this.getConfiguration();
    return (
      config &&
      state.context.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`)
    );
  }

  // get inside VS Code local storage the configuration
  public getGlobalStateConfiguration(): any {
    const config = this.getConfiguration();
    return config && state.context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`);
  }

  // set inside VS Code local storage the last working issue
  // used for remember last working issue if the user close VS Code without stop the tracking
  public async setGlobalWorkingIssue(context: vscode.ExtensionContext, workingIssue: IWorkingIssue | undefined): Promise<void> {
    const config = this.getConfiguration();
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
    const config = this.getConfiguration();
    return config && context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`);
  }

  public setGlobalCounter(context: vscode.ExtensionContext, count: number): Thenable<void> {
    return context.globalState.update(`${CONFIG_NAME}:${CONFIG_COUNTER}`, count);
  }

  public getGlobalCounter(context: vscode.ExtensionContext): any {
    return context.globalState.get(`${CONFIG_NAME}:${CONFIG_COUNTER}`);
  }
}
