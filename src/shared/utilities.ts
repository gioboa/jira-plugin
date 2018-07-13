import * as path from 'path';
import * as vscode from 'vscode';
import { createClient } from '../http/api';
import { Jira } from '../http/api.model';
import state from '../state/state';
import { getConfigurationByKey, getGlobalStateConfiguration } from './configuration';
import { CONFIG, CREDENTIALS_SEPARATOR, SEARCH_MODE, STATUS_ICONS } from './constants';
import { selectIssue } from './select-utilities';

export const executeConnectionToJira = (): void => {
  if (getConfigurationByKey(CONFIG.BASE_URL)) {
    const connect = async () => {
      state.jira = (await connectToJira())!;
      state.statusBar.updateStatusBar('');
      state.statuses = await state.jira.getStatuses();
      state.projects = await state.jira.getProjects();
      selectIssue(SEARCH_MODE.ALL);
    };
    connect().catch(() => {
      vscode.window.showErrorMessage('Failed to connect to jira');
    });
  }
};

export const connectToJira = async (): Promise<Jira | undefined> => {
  const baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';
  const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
  if (!!baseUrl && !!username && !!password) {
    try {
      const client = createClient(baseUrl, username, password);
      const serverInfo = await client.serverInfo();
      if (serverInfo.versionNumbers[0] < 5) {
        vscode.window.showInformationMessage(`Unsupported JIRA version '${serverInfo.version}'. Must be at least 5.0.0`);
        return;
      }
      state.channel.appendLine(`Connected to JIRA server at '${baseUrl}'`);
      return client;
    } catch (e) {
      state.channel.appendLine(`Failed to contact JIRA server using '${baseUrl}'. Please check url and credentials`);
      state.channel.appendLine(e.message);
    }
  }
  return undefined;
};

export const addStatusIcon = (status: string, withDescription: boolean): string => {
  let icon = STATUS_ICONS.DEFAULT.icon;
  if (!!status) {
    Object.values(STATUS_ICONS).forEach(value => {
      if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
        icon = value.icon;
      }
    });
  }
  return `${icon}` + (withDescription ? `  ${status} ` : ``);
};

export const getIconsPath = (fileName: string): string => {
  return path.join(__filename, '..', '..', '..', '..', 'images', 'icons', fileName);
};
