import * as vscode from 'vscode';
import { INotification } from '../../http/api.model';
import { logger } from '../../services';

export class NotificationItem extends vscode.TreeItem {
  constructor(public readonly notification: INotification, public readonly command?: vscode.Command) {
    super('', vscode.TreeItemCollapsibleState.None);
    this.label = this.parseTemplate(notification);
  }

  private parseTemplate(notification: INotification): string {
    const words = [];
    for (let word of (notification.template || '').split(' ')) {
      if (new RegExp(/{.*}/).test(word)) {
        word = word.replace(/[{}]/g, '');
        if (!!notification.metadata && !!(<any>notification.metadata)[word]) {
          if (!!(<any>notification.metadata)[word].name) {
            word = (<any>notification.metadata)[word].name;
          } else {
            logger.printErrorMessageInOutput(`Notification metadata -> ${word} ${JSON.stringify((<any>notification.metadata)[word])}`);
            word = 'error';
          }
        }
      }
      words.push(word);
    }
    return words.join(' ');
  }

  get tooltip(): string {
    return `${this.label}`;
  }

  contextValue = 'NotificationItem';
}
