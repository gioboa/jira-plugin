import * as vscode from 'vscode';
import { IssueItem } from './item/issue-item';

export default class NotificationsExplorer implements vscode.TreeDataProvider<IssueItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<IssueItem | undefined> = new vscode.EventEmitter<IssueItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<IssueItem | undefined> = this._onDidChangeTreeData.event;

  constructor() {}

  async refresh(): Promise<void> {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: IssueItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: IssueItem): Promise<any[]> {
    return [];
  }
}
