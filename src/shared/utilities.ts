import * as vscode from 'vscode';
import { createClient } from '../http/api';
import { Issue, Jira } from '../http/api.model';
import state from '../state/state';
import { getConfigurationByKey, getGlobalStateConfiguration } from './configuration';
import { CONFIG, CREDENTIALS_SEPARATOR, SEARCH_MODE, STATUS_ICONS } from './constants';

export const executeConnectionToJira = (): void => {
  if (getConfigurationByKey(CONFIG.BASE_URL)) {
    const connect = async () => {
      state.jira = (await connectToJira())!;
      state.statusBar.updateStatusBar('');
      state.statuses = await state.jira.getStatuses();
      state.projects = await state.jira.getProjects();
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
    if (status.toUpperCase().indexOf(STATUS_ICONS.OPEN.text.toUpperCase()) !== -1) {
      icon = STATUS_ICONS.OPEN.icon;
    } else {
      if (status.toUpperCase().indexOf(STATUS_ICONS.PROGRESS.text.toUpperCase()) !== -1) {
        icon = STATUS_ICONS.PROGRESS.icon;
      }
    }
  }
  return `${icon}` + (withDescription ? `  ${status} ` : ``);
};

export const createLabel = (issue: Issue, mode: string): string => {
  switch (mode) {
    case SEARCH_MODE.ID:
    case SEARCH_MODE.SUMMARY:
      return `${addStatusIcon(issue.fields.status.name, true)} ${issue.key}`;
    case SEARCH_MODE.STATUS:
    case SEARCH_MODE.STATUS_ASSIGNEE:
      return `${addStatusIcon(issue.fields.status.name, false)} ${issue.key}`;
    default:
      return '';
  }
};
