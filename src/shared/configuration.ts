import * as vscode from 'vscode';
import state from '../state/state';
import { Configuration } from './configuration.model';
import { CONFIG, CONFIG_NAME, CREDENTIALS_SEPARATOR } from './constants';

export const configIsCorrect = (): boolean => {
  const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
  const config = getConfiguration();
  return config.baseUrl && username && password;
};

export const getConfiguration = (): Configuration => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config;
};

export const getConfigurationByKey = (entry: string): string | undefined => {
  const config: Configuration | undefined = vscode.workspace.getConfiguration(CONFIG_NAME);
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config.get(entry);
};

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

export const setGlobalStateConfiguration = (password: string | undefined): Thenable<void> => {
  const config = getConfiguration();
  return state.context.globalState.update(`${CONFIG_NAME}:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`);
};

export const getGlobalStateConfiguration = (): any => {
  const config = getConfiguration();
  return state.context.globalState.get(`${CONFIG_NAME}:${config.baseUrl}`);
};
