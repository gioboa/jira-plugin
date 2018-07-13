import * as vscode from 'vscode';
import { LOADING } from '../../shared/constants';
import { getIconsPath } from '../../shared/utilities';

export class LoadingItem extends vscode.TreeItem {
  constructor() {
    super('LOADING...', vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: getIconsPath(`light/${LOADING.file}`),
    dark: getIconsPath(`dark/${LOADING.file}`)
  };

  contextValue = 'LoadingItem';
}
