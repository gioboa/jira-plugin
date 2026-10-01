import * as vscode from 'vscode';

export class DividerItem extends vscode.TreeItem {
  constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = '';
  }

  contextValue = 'DividerItem';
}
