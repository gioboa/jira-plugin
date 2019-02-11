import state from '../store/state';

export default class NotificationService {
  private notifications = [];

  public async startNotificationsWatcher(): Promise<void> {
    try {
      const response = await state.jira.getNotifications();
      console.log('ALL notifications', response.data.length);
      setTimeout(() => this.startNotificationsWatcher(), 1000 * 10);
    } catch (err) {
      if (!!err && JSON.parse(err).statusCode === '404') {
        // not available
      }
    }
  }
}
