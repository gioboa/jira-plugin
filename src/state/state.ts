import * as vscode from 'vscode';
import { Jira, Project, Status } from '../http/api.model';
import { configIsCorrect } from '../shared/configuration';
import { StatusBarManager } from '../shared/status-bar';

export interface State {
  context: vscode.ExtensionContext;
  channel: vscode.OutputChannel;
  statusBar: StatusBarManager;
  jira: Jira;
  statuses: Status[];
  projects: Project[];
}

const state: State = {
  jira: undefined as any,
  context: undefined as any,
  channel: undefined as any,
  statusBar: undefined as any,
  statuses: [],
  projects: []
};

export default state;

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configIsCorrect();
};
