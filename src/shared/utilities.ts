import * as path from 'path';
import * as vscode from 'vscode';
import { createClient } from '../http/api';
import { Jira } from '../http/api.model';
import state from '../state/state';
import { getConfigurationByKey, getGlobalStateConfiguration } from './configuration';
import { CONFIG, CREDENTIALS_SEPARATOR, STATUS_ICONS } from './constants';

export const executeConnectionToJira = (): void => {
  if (getConfigurationByKey(CONFIG.BASE_URL)) {
    const connect = async () => {
      state.jira = (await connectToJira())!;
      state.statuses = await state.jira.getStatuses();
      state.projects = await state.jira.getProjects();
      state.statusBar.updateWorkingProjectItem('');
      await vscode.commands.executeCommand('jira-plugin.allIssuesCommand');
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

export const secondsToHHMMSS = (sec: number): string => {
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - hours * 3600) / 60);
  let seconds = sec - hours * 3600 - minutes * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
