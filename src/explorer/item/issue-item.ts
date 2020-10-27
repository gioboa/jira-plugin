import * as vscode from 'vscode';
import { configuration } from '../../services';
import { IIssue } from '../../services/http.model';
import { CONFIG } from '../../shared/constants';

export class IssueItem extends vscode.TreeItem {
  private isCollapsible = (issue: IIssue): boolean => (!!issue.fields.subtasks && !!issue.fields.subtasks.length ? true : false);

  constructor(public readonly issue: IIssue, public readonly command?: vscode.Command) {
    super(`${issue.key} - ${issue.fields.summary}`, vscode.TreeItemCollapsibleState.None);
    if (configuration.get(CONFIG.GROUP_TASK_AND_SUBTASKS) && this.isCollapsible(issue)) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      this.label += ' - subtasks: ' + (issue.fields.subtasks || []).map((issue) => issue.key).join(', ');
    }
  }

  get tooltip(): string {
    return `(${this.issue.fields.status.name}) ${this.label}`;
  }

  contextValue = 'IssueItem';
}
