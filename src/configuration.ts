import * as vscode from 'vscode';
import { WorkspaceConfiguration } from 'vscode';
import { CREDENTIALS_SEPARATOR } from './constants';

export const CONFIG = {
  BASE_URL: 'baseUrl',
  USERNAME: 'username',
  CURRENT_PROJECT: 'currentProject'
};

export interface Configuration extends WorkspaceConfiguration {
  baseUrl?: string;
  username?: string;
  currentProject?: string;
}

export function getConfiguration(): Configuration {
  const config: Configuration | undefined = vscode.workspace.getConfiguration('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config;
}

export function getConfigurationByKey(entry: string): string | undefined {
  const config: Configuration | undefined = vscode.workspace.getConfiguration('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config.get(entry);
}

export function setConfigurationByKey(entry: string, value: string | undefined): Thenable<void> {
  const config: Configuration | undefined = vscode.workspace.getConfiguration('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  if (entry === CONFIG.BASE_URL && value && value.substring(value.length - 1) === '/') {
    value = value.substring(0, value.length - 1);
  }
  return config.update(entry, value || '', true);
}

export function setGlobalStateConfiguration(context: vscode.ExtensionContext, password: string | undefined): Thenable<void> {
  const config = getConfiguration();
  return context.globalState.update(`jira-plugin:${config.baseUrl}`, `${config.username}${CREDENTIALS_SEPARATOR}${password || ''}`);
}

export function getGlobalStateConfiguration(context: vscode.ExtensionContext): any {
  const config = getConfiguration();
  return context.globalState.get(`jira-plugin:${config.baseUrl}`);
}
