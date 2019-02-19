import * as vscode from 'vscode';
import { IIssue } from '../../services/http.model';

export class IssueItem extends vscode.TreeItem {
  constructor(public readonly issue: IIssue, public readonly command?: vscode.Command) {
    super(`${issue.key} - ${issue.fields.summary}`, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return `(${this.issue.fields.status.name}) ${this.label}`;
  }

  contextValue = 'IssueItem';
}
