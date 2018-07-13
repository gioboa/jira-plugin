import * as path from 'path';
import * as vscode from 'vscode';

export class IssueItem extends vscode.TreeItem {
  constructor(public readonly label: string, private version: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly command?: vscode.Command) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.version}`;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', '..', 'images', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', '..', '..', 'images', 'dark', 'dependency.svg')
  };

  contextValue = 'dependency';
}
