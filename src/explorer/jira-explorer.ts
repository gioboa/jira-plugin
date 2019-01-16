import * as vscode from 'vscode';
import { CONFIG, LIST_MAX_RESULTS, LOADING } from '../shared/constants';
import state from '../store/state';
import { DividerItem } from './item/divider-item';
import { FilterInfoItem } from './item/filter-info-item';
import { IssueItem } from './item/issue-item';
import { LimitInfoItem } from './item/limit-info';
import { LoadingItem } from './item/loading-item';
import { NoResultItem } from './item/no-result-item';
import { StatusItem } from './item/status-item';
import { configuration } from '../services';

export default class JiraExplorer implements vscode.TreeDataProvider<IssueItem> {
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
    let project = await configuration.getConfigurationByKey(CONFIG.WORKING_PROJECT);
    const issues = state.issues;
    // generate all the item from issues saved in global state
    if (issues.length > 0) {
      const items: any[] = issues.map(
        issue =>
          new IssueItem(issue, {
            command: 'jira-plugin.openIssueCommand',
            title: 'Open issue in the browser',
            arguments: [`${issue.key}`]
          })
      );
      // add in the firt possition 'filter-info-item' and then the 'divider-item'
      items.unshift(new FilterInfoItem(project || '', state.currentFilter, issues.length), new DividerItem('------'));

      // loop items and insert for every status a separator
      const getLabel = (status: string) => `Status: ${status}`;
      items.map((item: any, index: number) => {
        if (item.issue) {
          if (
            !items.find(
              el => el.contextValue === new StatusItem('', '').contextValue && getLabel(item.issue.fields.status.name) === el.label
            )
          ) {
            items.splice(index, 0, new StatusItem(getLabel(item.issue.fields.status.name), item.issue.fields.status.name));
          }
        }
      });

      if (issues.length === LIST_MAX_RESULTS) {
        items.push(new DividerItem('------'), new LimitInfoItem());
      }
      return items;
    } else {
      // used for show loading item in the explorer
      if (state.currentFilter === LOADING.text) {
        return [new LoadingItem()];
      }
      // no result
      return [
        new FilterInfoItem(project || '', state.currentFilter, issues.length),
        new DividerItem('------'),
        new NoResultItem(project || '')
      ];
    }
  }
}
