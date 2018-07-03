import * as vscode from 'vscode';
import { Jira } from './api.model';
import { configIsCorrect } from './configuration';

export interface State {
  jira: Jira;
  context?: vscode.ExtensionContext;
}

const state: State = {
  jira: undefined as any,
  context: undefined
};

export default state;

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configIsCorrect(state.context);
};
