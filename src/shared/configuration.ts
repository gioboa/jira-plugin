import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import state from '../state/state';
import { Configuration } from './configuration.model';
import { CONFIG, CONFIG_NAME, CONFIG_WORKING_ISSUE, CREDENTIALS_SEPARATOR } from './constants';

export const configIsCorrect = (): boolean => {
  const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
  const config = getConfiguration();
  return config.baseUrl && username && password;
};

// all the plugin configuration
export const getConfiguration = (): Configuration => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config;
};

// used for get only one setting
export const getConfigurationByKey = (entry: string): string | undefined => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config.get(entry);
};

// used for set only one setting
export const setConfigurationByKey = (entry: string, value: string | undefined): Thenable<void> => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  if (entry === CONFIG.BASE_URL && value && value.substring(value.length - 1) === '/') {
    value = value.substring(0, value.length - 1);
  }
  return config.update(entry, value || '', true);
};

// set inside VS Code local storage the configuration
export const setGlobalStateConfiguration = (password: string | undefined): Thenable<void> => {
  const config = getConfiguration();
  return state.context.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`);
};

// get inside VS Code local storage the configuration
export const getGlobalStateConfiguration = (): any => {
  const config = getConfiguration();
  return state.context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`);
};

// set inside VS Code local storage the last working issue
// used for remember last working issue if the user close VS Code without stop the tracking
export const setGlobalWorkingIssue = (context: vscode.ExtensionContext, workingIssue: IWorkingIssue | undefined): Thenable<void> => {
  const config = getConfiguration();
  return context.globalState.update(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`, !!workingIssue ? JSON.stringify(workingIssue) : undefined);
};

// get inside VS Code local storage the last working issue
export const getGlobalWorkingIssue = (context: vscode.ExtensionContext): any => {
  const config = getConfiguration();
  return context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}:${CONFIG_WORKING_ISSUE}:${config.workingProject}`);
};
