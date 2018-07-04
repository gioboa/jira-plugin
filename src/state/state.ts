import * as vscode from 'vscode';
import { configIsCorrect } from '../shared/configuration';
import { Jira, Status, Project } from '../http/api.model';

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
