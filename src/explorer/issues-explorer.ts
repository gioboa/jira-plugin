import * as vscode from 'vscode';
import { configuration, logger } from '../services';
import { IIssue } from '../services/http.model';
import { CONFIG, GROUP_BY_FIELDS, LOADING } from '../shared/constants';
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

  private groupByField = { ...GROUP_BY_FIELDS.STATUS };
  private fallbackGroupByField = { ...GROUP_BY_FIELDS.STATUS };

  constructor() {}

  async refresh(): Promise<void> {
    this._onDidChangeTreeData.fire();
  }

  setGroupByField(field: { label: string; value: string } | undefined): void {
    this.groupByField = field || this.fallbackGroupByField;
  }

  getTreeItem(element: IssueItem): vscode.TreeItem {
    return element;
  }

  descPropertyFromField(field: any, calledBySort?: boolean): string {
    if (!field) {
      return '';
    }
    if (typeof field === 'string') {
      if (this.groupByField.value === GROUP_BY_FIELDS.UPDATED.value) {
        return new Date(field.substring(0, 10)).toLocaleDateString();
      }
      return field;
    }
    if (this.groupByField.value === GROUP_BY_FIELDS.PRIORITY.value) {
      return calledBySort ? field.id.toString() : field.name.toString();
    }
    return field.name || field.value || field.key || field.label || Object.values(field)[0]; // do not change order
  }

  // loop items and insert a separator when field value change
  addSeparators(items: any[], field: { label: string; value: string }) {
    const groupItems: any[] = [];
    items.forEach((item: any, index: number) => {
      if (item.issue) {
        const description = this.descPropertyFromField(item.issue.fields[field.value]);
        if (
          !groupItems.find(
            el => el.item.contextValue === new GroupItem('', '').contextValue && this.getLabel(field.label, description) === el.item.label
          )
        ) {
          groupItems.push({ index, item: new GroupItem(this.getLabel(field.label, description), description) });
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

        if (items.some(item => !item.issue.fields.hasOwnProperty(this.groupByField.value))) {
          logger.printErrorMessageInOutputAndShowAlert(
            `Invalid grouping field: ${this.groupByField.value} - fallback is ${this.fallbackGroupByField.label}`
          );
          // fallback to status if field is not present
          this.groupByField = this.fallbackGroupByField;
        }
        items.sort((itemA: IssueItem, itemB: IssueItem) => {
          const descA = this.descPropertyFromField((<any>itemA.issue.fields)[this.groupByField.value], true);
          const descB = this.descPropertyFromField((<any>itemB.issue.fields)[this.groupByField.value], true);
          if (this.groupByField.value === GROUP_BY_FIELDS.UPDATED.value) {
            return descA < descB ? 1 : descA > descB ? -1 : 0;
          }
          return descA < descB ? -1 : descA > descB ? 1 : 0;
        });
        // add in the firt possition 'filter-info-item' and then the 'divider-item'
        items.unshift(new FilterInfoItem(project, state.currentFilter, issues.length), new DividerItem('------'));
        // loop items and insert a separator when field value change
        this.addSeparators(items, this.groupByField);
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
