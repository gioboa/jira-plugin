import * as vscode from 'vscode';
import { Jira, Project, Status } from '../http/api.model';
import { configIsCorrect } from '../shared/configuration';

export interface State {
  context: vscode.ExtensionContext;
  channel: vscode.OutputChannel;
  jira: Jira;
  statuses: Status[];
  projects: Project[];
}

const state: State = {
  jira: undefined as any,
  context: undefined as any,
  channel: undefined as any,
  statuses: [],
  projects: []
};

export default state;

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configIsCorrect();
};
