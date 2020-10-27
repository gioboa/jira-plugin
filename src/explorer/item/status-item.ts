import * as vscode from 'vscode';
import { utilities } from '../../services';
import { STATUS_ICONS } from '../../shared/constants';

export class GroupItem extends vscode.TreeItem {
  constructor(label: string, public fileName: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  private icon(status: string): string {
    let icon = STATUS_ICONS.DEFAULT.file;
    if (!!status) {
      Object.values(STATUS_ICONS).forEach((value) => {
        if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
          icon = value.file;
        }
      });
    }
    return icon;
  }

  iconPath = {
    light: utilities.getIconsPath(`light/${this.icon(this.fileName)}`),
    dark: utilities.getIconsPath(`dark/${this.icon(this.fileName)}`),
  };

  contextValue = 'GroupItem';
}
