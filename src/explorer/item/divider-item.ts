import * as vscode from 'vscode';
import { DIVIDER } from '../../shared/constants';
import { getIconsPath } from '../../shared/utilities';

export class DividerItem extends vscode.TreeItem {
  constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState) {

    super(label , vscode.TreeItemCollapsibleState.None);
    
  }
  

  get tooltip(): string {
    return '';
  }

  iconPath = {
    light: getIconsPath(`light/${DIVIDER.file}`),
    dark: getIconsPath(`dark/${DIVIDER.file}`)
  };

  contextValue = 'DividerItem';
}
