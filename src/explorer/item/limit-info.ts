import * as vscode from 'vscode';
import { STATUS_ICONS } from '../../shared/constants';
import services from '../../services';

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
    light: services.utilities.getIconsPath(`light/${STATUS_ICONS.DEFAULT.file}`),
    dark: services.utilities.getIconsPath(`dark/${STATUS_ICONS.DEFAULT.file}`)
  };

  contextValue = 'LimitInfoItem';
}
