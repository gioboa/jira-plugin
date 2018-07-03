import * as vscode from 'vscode';
import { Jira, Project, Status } from './api.model';
import { configIsCorrect } from './configuration';

export interface State {
  jira: Jira;
  context?: vscode.ExtensionContext;
  statuses: Status[];
  projects: Project[];
}

const state: State = {
  jira: undefined as any,
  context: undefined,
  statuses: [],
  projects: []
};

export default state;

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configIsCorrect(state.context);
};
