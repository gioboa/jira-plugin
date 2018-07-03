import * as vscode from 'vscode';
import { WorkspaceConfiguration } from 'vscode';

export const CONFIG = {
  BASE_URL: 'baseUrl',
  USERNAME: 'username',
  ACTIVE_PROJECT: 'activeProject'
};

export const CREDENTIALS_SEPARATOR = '##';

export interface Configuration extends WorkspaceConfiguration {
  baseUrl?: string;
  username?: string;
  activeProject?: string;
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
