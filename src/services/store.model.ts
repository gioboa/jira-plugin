import * as vscode from 'vscode';
import { IIssue, IJira, IProject, IStatus, IWorkingIssue } from './http.model';

export interface IState {
  jira: IJira;
  context: vscode.ExtensionContext;
  channel: vscode.OutputChannel;
  documentLinkDisposable: vscode.Disposable;
  statuses: IStatus[];
  projects: IProject[];
  issues: IIssue[];
  currentSearch: { filter: string; jql: string };
  workingIssue: IWorkingIssue;
}
