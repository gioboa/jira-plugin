import * as vscode from 'vscode';
import { STATUS_ICONS } from '../../shared/constants';
import services from '../../services';

export class NoResultItem extends vscode.TreeItem {
  constructor(project: string) {
    super(`${project} - NO ISSUES`, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: services.utilities.getIconsPath(`light/${STATUS_ICONS.DEFAULT.file}`),
    dark: services.utilities.getIconsPath(`dark/${STATUS_ICONS.DEFAULT.file}`)
  };

  contextValue = 'NoResultItem';
}
