import * as vscode from 'vscode';
import { LOADING } from '../../shared/constants';
import services from '../../services';

export class LoadingItem extends vscode.TreeItem {
  constructor() {
    super('LOADING...', vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: services.utilities.getIconsPath(`light/${LOADING.file}`),
    dark: services.utilities.getIconsPath(`dark/${LOADING.file}`)
  };

  contextValue = 'LoadingItem';
}
