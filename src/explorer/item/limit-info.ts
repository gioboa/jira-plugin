import * as vscode from 'vscode';
import { STATUS_ICONS } from '../../shared/constants';
import { getIconsPath } from '../../shared/utilities';

export class LimitInfoItem extends vscode.TreeItem {
  constructor() {
    super(`Viewable rows maximum has been reached. Modify filters to narrow search`, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    return this.label || '';
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
    light: getIconsPath(`light/${STATUS_ICONS.DEFAULT.file}`),
    dark: getIconsPath(`dark/${STATUS_ICONS.DEFAULT.file}`)
  };

  contextValue = 'LimitInfoItem';
}
