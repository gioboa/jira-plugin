import * as vscode from 'vscode';
import { STATUS_ICONS } from '../../shared/constants';
import services from '../../services';

export class StatusItem extends vscode.TreeItem {
  constructor(label: string, public statusName: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return '';
  }

  private icon(status: string): string {
    let icon = STATUS_ICONS.DEFAULT.file;
    if (!!status) {
      Object.values(STATUS_ICONS).forEach(value => {
        if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
          icon = value.file;
        }
      });
    }
    return icon;
  }

  iconPath = {
    light: services.utilities.getIconsPath(`light/${this.icon(this.statusName)}`),
    dark: services.utilities.getIconsPath(`dark/${this.icon(this.statusName)}`)
  };

  contextValue = 'StatusItem';
}
