import * as vscode from 'vscode';
import { INotification } from '../http/api.model';
import { IssueItem } from './item/issue-item';
import { NotificationItem } from './item/notification-item';

export default class NotificationsExplorer implements vscode.TreeDataProvider<IssueItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<IssueItem | undefined> = new vscode.EventEmitter<IssueItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<IssueItem | undefined> = this._onDidChangeTreeData.event;

  private notifications: INotification[] = [];

  constructor() {}

  async refresh(notifications: INotification[]): Promise<void> {
    this.notifications = notifications;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: IssueItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: IssueItem): Promise<any[]> {
    return this.notifications.map(n => new NotificationItem(n));
  }
}
