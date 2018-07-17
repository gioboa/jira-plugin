import * as vscode from 'vscode';
import { IIssue } from '../../http/api.model';
import { STATUS_ICONS } from '../../shared/constants';
import { getIconsPath } from '../../shared/utilities';

export class IssueItem extends vscode.TreeItem {
  constructor(public readonly issue: IIssue, public readonly command?: vscode.Command) {
    super(`${issue.key} - ${issue.fields.summary}`, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return `(${this.issue.fields.status.name}) ${this.label}`;
  }

  private icon(status: string): string {
    let icon = STATUS_ICONS.DEFAULT.file;
    if (!!status) {
      Object.values(STATUS_ICONS).forEach(value => {
        if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
          icon = value.file;
        }
      });
    }
    return icon;
  }

  iconPath = {
    light: getIconsPath(`light/${this.icon(this.issue.fields.status.name)}`),
    dark: getIconsPath(`dark/${this.icon(this.issue.fields.status.name)}`)
  };

  contextValue = 'IssueItem';
}
