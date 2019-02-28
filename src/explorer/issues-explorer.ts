import * as vscode from 'vscode';
import { configuration, logger } from '../services';
import { IIssue } from '../services/http.model';
import { CONFIG, LOADING } from '../shared/constants';
import state from '../store/state';
import { DividerItem } from './item/divider-item';
import { FilterInfoItem } from './item/filter-info-item';
import { IssueItem } from './item/issue-item';
import { LimitInfoItem } from './item/limit-info';
import { LoadingItem } from './item/loading-item';
import { NoResultItem } from './item/no-result-item';
import { GroupItem } from './item/status-item';

export default class IssuesExplorer implements vscode.TreeDataProvider<IssueItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<IssueItem | undefined> = new vscode.EventEmitter<IssueItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<IssueItem | undefined> = this._onDidChangeTreeData.event;

  constructor() {}

  async refresh(): Promise<void> {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: IssueItem): vscode.TreeItem {
    return element;
  }

  descPropertyFromField(field: any): string {
    if (!field) {
      return '';
    }
    if (typeof field === 'string') {
      return field;
    }
    return field.inward || field.name || field.value || field.key || field.label || Object.values(field)[0]; // do not change order
  }

  // loop items and insert a separator when field value change
  addSeparators(items: any[], field: string) {
    const groupItems: any[] = [];
    items.forEach((item: any, index: number) => {
      if (item.issue) {
        const description = this.descPropertyFromField(item.issue.fields[field]);
        if (
          !groupItems.find(
            el => el.item.contextValue === new GroupItem('', '').contextValue && this.getLabel(field, description) === el.item.label
          )
        ) {
          groupItems.push({ index, item: new GroupItem(this.getLabel(field, description), description) });
        }
      }
    });
    let pushed = 0;
    groupItems.forEach(groupItem => {
      items.splice(groupItem.index + pushed, 0, groupItem.item);
      pushed += 1;
    });
  }

  getLabel(field: string, label: string): string {
    return `${field}: ${label}`;
  }

  async getChildren(element?: IssueItem): Promise<any[]> {
    // issue
    if (!element) {
      let project = await configuration.get(CONFIG.WORKING_PROJECT);
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

        let field = 'status';
        const fallbackField = 'status';
        if (items.some(item => !item.issue.fields.hasOwnProperty(field))) {
          logger.printErrorMessageInOutputAndShowAlert(`Invalid grouping field: ${field} - fallback is ${fallbackField}`);
          // fallback to status if field is not present
          field = fallbackField;
        }
        items.sort((itemA: IssueItem, itemB: IssueItem) => {
          const descA = this.descPropertyFromField((<any>itemA.issue.fields)[field]);
          const descB = this.descPropertyFromField((<any>itemB.issue.fields)[field]);
          return descA < descB ? -1 : descA > descB ? 1 : 0;
        });
        // add in the firt possition 'filter-info-item' and then the 'divider-item'
        items.unshift(new FilterInfoItem(project, state.currentFilter, issues.length), new DividerItem('------'));
        // loop items and insert a separator when field value change
        this.addSeparators(items, field);
        if (issues.length === configuration.get(CONFIG.NUMBER_ISSUES_IN_LIST)) {
          items.push(new DividerItem('------'), new LimitInfoItem());
        }

        return items;
      } else {
        // used for show loading item in the explorer
        if (state.currentFilter === LOADING.text) {
          return [new LoadingItem()];
        }
        // no result
        return [new FilterInfoItem(project, state.currentFilter, issues.length), new DividerItem('------'), new NoResultItem(project)];
      }
    } else {
      // subtasks
      return (element.issue.fields.subtasks || []).map(
        (subtask: IIssue) =>
          new IssueItem(subtask, {
            command: 'jira-plugin.openIssueCommand',
            title: 'Open issue in the browser',
            arguments: [`${subtask.key}`]
          })
      );
    }
  }
}
