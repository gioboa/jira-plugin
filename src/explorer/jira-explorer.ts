import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG, LOADING } from '../shared/constants';
import state from '../state/state';
import { DividerItem } from './item/divider-item';
import { FilterInfoItem } from './item/filter-info-item';
import { IssueItem } from './item/issue-item';
import { LimitInfoItem } from './item/limit-info';
import { LoadingItem } from './item/loading-item';
import { NoResultItem } from './item/no-result-item';

export class JiraExplorer implements vscode.TreeDataProvider<IssueItem> {
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
    let project = await getConfigurationByKey(CONFIG.WORKING_PROJECT);
    if (state.issues.length > 0) {
      const items: any[] = state.issues.map(
        issue =>
          new IssueItem(issue, {
            command: 'jira-plugin.openIssueCommand',
            title: 'Open issue in the browser',
            arguments: [`${issue.key}`]
          })
      );
      items.unshift(new DividerItem());
      items.unshift(new FilterInfoItem(project || '', state.currentFilter, state.issues.length));
      if (state.issues.length === 50) {
        items.push(new DividerItem());
        items.push(new LimitInfoItem());
      }
      return items;
    } else {
      if (state.currentFilter === LOADING.text) {
        return [new LoadingItem()];
      }
      return [new NoResultItem(project || '')];
    }
  }
}
