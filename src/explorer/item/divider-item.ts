import * as vscode from 'vscode';
import { DIVIDER } from '../../shared/constants';
import services from '../../services';

export class DividerItem extends vscode.TreeItem {
  constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: services.utilities.getIconsPath(`light/${DIVIDER.file}`),
    dark: services.utilities.getIconsPath(`dark/${DIVIDER.file}`)
  };

  contextValue = 'DividerItem';
}
