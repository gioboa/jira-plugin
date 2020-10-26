import * as vscode from 'vscode';
import { LOADING } from '../../shared/constants';
import { utilities } from '../../services';

export class LoadingItem extends vscode.TreeItem {
  constructor() {
    super('LOADING...', vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: utilities.getIconsPath(`light/${LOADING.file}`),
    dark: utilities.getIconsPath(`dark/${LOADING.file}`),
  };

  contextValue = 'LoadingItem';
}
