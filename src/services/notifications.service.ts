import * as vscode from 'vscode';
import { logger } from '.';
import openIssueCommand from '../commands/open-issue';
import { INotification, INotifications } from '../http/api.model';
import { ACTIONS, CONFIG } from '../shared/constants';
import state from '../store/state';
import ConfigurationService from './configuration.service';

export default class NotificationService {
  private notifications: INotification[] = [];
  private showedIds: string[] = [];

  get isEnabled(): boolean {
    return !!this.configuration.get(CONFIG.CHECK_FOR_NOTIFICATIONS_ENABLE);
  }

  constructor(private configuration: ConfigurationService) {}

  public async startNotificationsWatcher(): Promise<void> {
    if (this.isEnabled) {
      try {
        let goOn = true;
        let lastId = '';
        while (goOn) {
          const response: INotifications = await state.jira.getNotifications(lastId);
          // check if it's enmpty
          if (!!response.data && !!response.data.length) {
            for (let notification of response.data) {
              // when I found the same notification id I assume that all notifications are already saved
              const storedNotification = this.notifications.find(n => n.id === notification.id);
              if (!storedNotification) {
                this.notifications.push(notification);
              } else {
                storedNotification.readState = notification.readState;
              }
            }
            lastId = goOn && !!response.pageInfo && !!response.pageInfo.lastId ? response.pageInfo.lastId : '';
          } else {
            goOn = false;
          }
        }
        this.showUnReadNotifications(this.notifications.reverse());
        const ms = 1000 * 60 * 2;
        setTimeout(() => this.startNotificationsWatcher(), ms);
      } catch (err) {
        if (!!err && JSON.parse(err).statusCode === '404') {
          // not available
        }
      }
    }
  }

  private parseTemplate(notification: INotification): string {
    const templateWords = (notification.template || '').split(' ');
    const words: string[] = [];
    templateWords.forEach(word => {
      if (new RegExp(/{.*}/).test(word)) {
        word = word.replace(/[{}]/g, '');
        if (!!notification.metadata && !!(<any>notification.metadata)[word].name) {
          word = (<any>notification.metadata)[word].name;
        } else {
          logger.printErrorMessageInOutput(`Error Notification metadata ${word} -> ${JSON.stringify((<any>notification.metadata)[word])}`);
          word = `error_${word}`;
        }
        words.push(word);
      } else {
        words.push(word);
      }
    });
    return words.join(' ');
  }

  private showUnReadNotifications(notifications: INotification[]): void {
    notifications
      .filter(notification => notification.readState.toUpperCase() === 'UNREAD')
      .forEach(notification => {
        if (!!notification.template) {
          if (!this.showedIds.some(id => id === notification.id)) {
            const message = `${this.parseTemplate(notification)} - ${notification.title || ''}`;
            const issueKey =
              !!(<any>notification.metadata)['issue'] && !!(<any>notification.metadata)['issue'].issueKey
                ? (<any>notification.metadata)['issue'].issueKey
                : undefined;
            if (!!issueKey) {
              setTimeout(async () => {
                const action = await vscode.window.showInformationMessage(
                  `${message}`,
                  ACTIONS.MARK_AS_READ,
                  ACTIONS.OPEN_ISSUE,
                  ACTIONS.CLOSE
                );
                switch (action) {
                  case ACTIONS.OPEN_ISSUE:
                    openIssueCommand(issueKey);
                    break;
                  case ACTIONS.MARK_AS_READ:
                    const response = await state.jira.markNotificationsAsReadUnread({
                      ids: [notification.id],
                      toState: 'READ'
                    });
                    if (response === '') {
                      notification.readState = 'read';
                      this.showedIds = this.showedIds.filter(id => id !== notification.id);
                    }
                    break;
                }
              }, 200);
            } else {
              vscode.window.showInformationMessage(`${message}`);
            }
            this.showedIds.push(notification.id);
          }
        }
      });
  }
}
