import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import state from '../state/state';
import { Configuration } from './configuration.model';
import { CONFIG_COUNTER, CONFIG_NAME, CONFIG_WORKING_ISSUE, CREDENTIALS_SEPARATOR } from './constants';
import { printErrorMessageInOutputAndShowAlert } from './log-utilities';

export const configIsCorrect = (): boolean => {
  const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
  const config = getConfiguration();
  return !!(config && config.baseUrl && username && password);
};

// all the plugin configuration
const getConfiguration = (): Configuration | undefined => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
  if (!config) {
    printErrorMessageInOutputAndShowAlert('No configuration found. Probably an error in vscode');
  }
  return config;
};

// used for get only one setting
export const getConfigurationByKey = (entry: string): string | undefined => {
  const config = getConfiguration();
  return config && (<any>config).get(entry);
};

// used for set only one setting
export const setConfigurationByKey = async (entry: string, value: string | undefined): Promise<any> => {
  const config = getConfiguration();
  return config && config.update(entry, value || '', true);
};

// set inside VS Code local storage the configuration
export const setGlobalStateConfiguration = async (password: string | undefined): Promise<void> => {
  const config = getConfiguration();
  return (
    config &&
    state.context.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`)
  );
};

// get inside VS Code local storage the configuration
export const getGlobalStateConfiguration = (): any => {
  const config = getConfiguration();
  return config && state.context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`);
};

// set inside VS Code local storage the last working issue
// used for remember last working issue if the user close VS Code without stop the tracking
export const setGlobalWorkingIssue = async (context: vscode.ExtensionContext, workingIssue: IWorkingIssue | undefined): Promise<void> => {
  const config = getConfiguration();
  return (
    config &&
    context.globalState.update(
      `${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`,
      !!workingIssue ? JSON.stringify(workingIssue) : undefined
    )
  );
};

// get inside VS Code local storage the last working issue
export const getGlobalWorkingIssue = (context: vscode.ExtensionContext): any => {
  const config = getConfiguration();
  return config && context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`);
};

export const setGlobalCounter = (context: vscode.ExtensionContext, count: number): Thenable<void> => {
  return context.globalState.update(`${CONFIG_NAME}:${CONFIG_COUNTER}`, count);
};

export const getGlobalCounter = (context: vscode.ExtensionContext): any => {
  return context.globalState.get(`${CONFIG_NAME}:${CONFIG_COUNTER}`);
};
