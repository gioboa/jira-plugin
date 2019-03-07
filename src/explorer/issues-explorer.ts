import * as vscode from 'vscode';
import { configuration, logger, store } from '../services';
import { IIssue } from '../services/http.model';
import { CONFIG, GROUP_BY_FIELDS, LOADING } from '../shared/constants';
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

  // exclude subtask issues are allready inside parent issue
  groupTaskAndSubtasks(issues: IIssue[]): IIssue[] {
    const issueKeyToRemove: string[] = [];
    issues.forEach((issue: any) => {
      if (!!issue.fields.subtasks && !!issue.fields.subtasks.length) {
        const subtasksKeysToRemove: string[] = [];
        // check if subtasks has same field group value
        for (let subtask of issue.fields.subtasks) {
          const issuesElement = issues.find(issue => issue.key === subtask.key);
          // if isn't in issue list in not filter compliant
          if (!issuesElement) {
            subtasksKeysToRemove.push(subtask.key);
          } else {
            subtask = issuesElement;
            if (
              this.descPropertyFromField(issue.fields[this.groupByField.value]) ===
              this.descPropertyFromField(subtask.fields[this.groupByField.value])
            ) {
              issueKeyToRemove.push(subtask.key);
            } else {
              subtasksKeysToRemove.push(subtask.key);
            }
          }
        }
        // if subtask has different group field value I will delete from subtasks list and I will change issue label
        issue.fields.subtasks = issue.fields.subtasks.filter((subtask: IIssue) => !subtasksKeysToRemove.includes(subtask.key));
        for (let subtaskKey of subtasksKeysToRemove) {
          const element = issues.find(issue => issue.key === subtaskKey);
          if (element) {
            element.fields.summary += ` - Parent Task: ${issue.key}`;
          }
        }
      }
    });
    return issues.filter((issue: any) => !issueKeyToRemove.includes(issue.key));
  }

  async getChildren(element?: IssueItem): Promise<any[]> {
    // issue
    if (!element) {
      let project = await configuration.get(CONFIG.WORKING_PROJECT);
      let issues = store.state.issues;
      // generate all the item from issues saved in global state
      if (issues.length > 0) {
        if (issues.some(issue => !issue.fields.hasOwnProperty(this.groupByField.value))) {
          logger.printErrorMessageInOutputAndShowAlert(
            `Invalid grouping field: ${this.groupByField.value} - fallback is ${this.fallbackGroupByField.label}`
          );
          // fallback to status if field is not present
          this.groupByField = this.fallbackGroupByField;
        }
        if (configuration.get(CONFIG.GROUP_TASK_AND_SUBTASKS)) {
          // exclude subtask issues are allready inside parent issue
          issues = this.groupTaskAndSubtasks(issues);
        }

        const items: IssueItem[] = issues
          .map(
            issue =>
              new IssueItem(issue, {
                command: 'jira-plugin.openIssueCommand',
                title: 'Open issue in the browser',
                arguments: [`${issue.key}`]
              })
          )
          .sort((itemA: IssueItem, itemB: IssueItem) => {
            const descA = this.descPropertyFromField((<any>itemA.issue.fields)[this.groupByField.value], true);
            const descB = this.descPropertyFromField((<any>itemB.issue.fields)[this.groupByField.value], true);
            if (this.groupByField.value === GROUP_BY_FIELDS.UPDATED.value) {
              return descA < descB ? 1 : descA > descB ? -1 : 0;
            }
            return descA < descB ? -1 : descA > descB ? 1 : 0;
          });
        // add in the firt possition 'filter-info-item' and then the 'divider-item'
        items.unshift(<any>new FilterInfoItem(project, store.state.currentSearch.filter, issues.length), <any>new DividerItem('------'));
        // loop items and insert a separator when field value change
        this.addSeparators(items, this.groupByField);
        if (issues.length === configuration.get(CONFIG.NUMBER_ISSUES_IN_LIST)) {
          items.push(<any>new DividerItem('------'), <any>new LimitInfoItem());
        }

        return items;
      } else {
        // used for show loading item in the explorer
        if (store.state.currentSearch.filter === LOADING.text) {
          return [!!project ? new LoadingItem() : []];
        }
        // no result
        return [
          new FilterInfoItem(project, store.state.currentSearch.filter, issues.length),
          new DividerItem('------'),
          new NoResultItem(project)
        ];
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
