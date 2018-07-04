import * as vscode from 'vscode';
import { Configuration } from './configuration.model';
import { CREDENTIALS_SEPARATOR, CONFIG } from './constants';

export const configIsCorrect = (context: vscode.ExtensionContext | undefined): boolean => {
  if (!context) {
    return false;
  }
  const [username, password] = getGlobalStateConfiguration(context).split(CREDENTIALS_SEPARATOR);
  const config = getConfiguration();
  return config.baseUrl && username && password;
};

export const getConfiguration = (): Configuration => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config;
};

export const getConfigurationByKey = (entry: string): string | undefined => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config.get(entry);
};

export const setConfigurationByKey = (entry: string, value: string | undefined): Thenable<void> => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  if (entry === CONFIG.BASE_URL && value && value.substring(value.length - 1) === '/') {
    value = value.substring(0, value.length - 1);
  }
  return config.update(entry, value || '', true);
};

export const setGlobalStateConfiguration = (context: vscode.ExtensionContext, password: string | undefined): Thenable<void> => {
  const config = getConfiguration();
  return context.globalState.update(`jira-plugin:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`);
};

export const getGlobalStateConfiguration = (context: vscode.ExtensionContext): any => {
  const config = getConfiguration();
  return context.globalState.get(`jira-plugin:${config.baseUrl}`);
};
