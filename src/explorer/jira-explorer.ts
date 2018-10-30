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
      items.sort(function(a,b) {
        if (a.issue.fields.status.id < b.issue.fields.status.id)
            return -1;
        if (a.issue.fields.status.id > b.issue.fields.status.id)
            return 1;
        return 0;
      });
      // add in the firt possition 'filter-info-item' and then the 'divider-item'
      items.unshift(new FilterInfoItem(project || '', state.currentFilter, issues.length), new DividerItem('------'));

      let idx = null;
      let status = [];
      let titulos = [];
      let i = 0;
      for(idx in items){
          if(items.hasOwnProperty(idx)){
              let item = items[idx];
              if(item.issue){
                  if(status.indexOf(item.issue.fields.status.name) == -1){
                      status.push(item.issue.fields.status.name);
                      titulos.push({
                          pos : i,
                          item : item.issue.fields.status.name
                      });
                  }
              }
          }
          i++;
      }
      i = 0;
      for(idx in titulos){
          if(titulos.hasOwnProperty(idx)){
              let titulo = titulos[idx];
              items.splice(titulo.pos + i++, 0, new DividerItem(titulo.item));
          }
      }

      // Jira block search result at 50 rows (it's a user settings)
      if (issues.length === 50) {
        items.push(new DividerItem('------'), new LimitInfoItem());
      }
      return items;
    } else {
      // used for show loading item in the explorer
      if (state.currentFilter === LOADING.text) {
        return [new LoadingItem()];
      }
      // no result
      return [new FilterInfoItem(project || '', state.currentFilter, issues.length), new DividerItem('------'), new NoResultItem(project || '')];
    }
  }
}
