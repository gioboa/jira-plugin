import * as vscode from 'vscode';

export interface Configuration {
  baseUrl: string;
  projectNames: string;
}

export function getConfiguration(): Configuration {
  const config = vscode.workspace.getConfiguration().get<Configuration>('jira');
  if (!config) {
    throw new Error('No configuration found. Probably an error in vscode');
  }
  return config;
}
