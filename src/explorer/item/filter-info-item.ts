import * as vscode from 'vscode';
import { STATUS_ICONS } from '../../shared/constants';
import { getIconsPath } from '../../shared/utilities';

export class FilterInfoItem extends vscode.TreeItem {
  constructor(project: string, filter: string, issueCounter: number) {
    super(`${project} - ${filter} - COUNT: ${issueCounter}`, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: getIconsPath(`light/${STATUS_ICONS.DEFAULT.file}`),
    dark: getIconsPath(`dark/${STATUS_ICONS.DEFAULT.file}`)
  };

  contextValue = 'FilterInfoItem';
}
