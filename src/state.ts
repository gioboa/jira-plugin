import * as vscode from 'vscode';
import { Jira, Issue } from './api';

export interface State {
  jira: Jira;
  workspaceState?: vscode.Memento;
  subscriber: (() => void)[];
  update(): void;
}

export interface ActiveIssue {
  key: string;
}

const state: State = {
  jira: undefined as any,
  subscriber: [],
  update(): void {
    this.subscriber.forEach(subscriber => subscriber());
  }
};

export default state;

export function getActiveIssue(): ActiveIssue | undefined {
  if (state.workspaceState) {
    return state.workspaceState.get('vscode-jira:active-issue');
  }
  return undefined;
}

export function setActiveIssue(issue: Issue | null): void {
  if (state.workspaceState) {
    state.workspaceState.update('vscode-jira:active-issue', issue
      ? {
          key: issue.key
        }
      : undefined
    );
    state.update();
  }
}
