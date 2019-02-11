import { notificationsExplorer } from '.';
import state from '../store/state';

export default class NotificationService {
  private notifications = [];

  public async startNotificationsWatcher(): Promise<void> {
    try {
      const response = await state.jira.getNotifications();
      const templates = response.data.map(n => n.template);
      if (!!response.data) {
        notificationsExplorer.refresh(response.data);
      }
      setTimeout(() => this.startNotificationsWatcher(), 1000 * 10);
    } catch (err) {
      if (!!err && JSON.parse(err).statusCode === '404') {
        // not available
      }
    }
  }
}
