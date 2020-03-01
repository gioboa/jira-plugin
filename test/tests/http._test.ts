import * as assert from 'assert';
import NoWorkingIssuePick from '../../src/picks/no-working-issue-pick';
import ConfigurationService from '../../src/services/configuration.service';
import { IAssignee, IIssue, INotification, ISetTransition } from '../../src/services/http.model';
import { Jira } from '../../src/services/http.service';
import StoreService from '../../src/services/store.service';
import { LOADING } from '../../src/shared/constants';
import { settings } from '../utils/settings';
import { backupSettings, restoreSettings } from '../utils/utils';

suite('Jira API', () => {
  const configurationService = new ConfigurationService();
  const store = new StoreService();
  store.state = {
    jira: undefined as any,
    context: undefined as any,
    channel: undefined as any,
    documentLinkDisposable: undefined as any,
    statuses: [],
    projects: [],
    issues: [],
    currentSearch: { filter: LOADING.text, jql: '' },
    workingIssue: {
      issue: new NoWorkingIssuePick().pickValue,
      trackingTime: 0,
      awayTime: 0,
      stopped: false
    }
  };
  interface ITest {
    name: string;
    type:
      | 'none'
      | 'project'
      | 'issueKey'
      | 'jql'
      | 'createIssue'
      | 'setTransition'
      | 'setAssignIssue'
      | 'addNewComment'
      | 'addWorkLog'
      | 'markNotificationsAsReadUnread';
  }
  const tests: ITest[] = [
    { name: 'getCloudSession', type: 'none' },
    { name: 'getStatuses', type: 'none' },
    { name: 'getProjects', type: 'none' },
    { name: 'getAllIssueTypes', type: 'none' },
    { name: 'getAllPriorities', type: 'none' },
    { name: 'getFavoriteFilters', type: 'none' },
    { name: 'getSprints', type: 'none' },
    { name: 'search', type: 'jql' },
    { name: 'getAllIssueTypesWithFields', type: 'project' },
    { name: 'getCreateIssueEpics', type: 'project' },
    { name: 'getCreateIssueLabels', type: 'none' },
    { name: 'getAvailableLinkIssuesType', type: 'none' },
    { name: 'createIssue', type: 'createIssue' },
    { name: 'getAssignees', type: 'project' },
    { name: 'getTransitions', type: 'issueKey' },
    { name: 'setAssignIssue', type: 'setAssignIssue' },
    { name: 'setTransition', type: 'setTransition' },
    { name: 'getIssueByKey', type: 'issueKey' },
    { name: 'addNewComment', type: 'addNewComment' },
    { name: 'addWorkLog', type: 'addWorkLog' },
    { name: 'getNotifications', type: 'none' },
    { name: 'markNotificationsAsReadUnread', type: 'markNotificationsAsReadUnread' }
  ];

  let project = '';
  let issueKey: IIssue;
  let transitionId: ISetTransition;
  let notification: INotification;
  let assigneeKey: IAssignee;
  let settingsBkp = <any>{};

  test(`Backup Settings`, async () => {
    await backupSettings(configurationService, settingsBkp);
    assert.strictEqual(1, 1);
  });

  test(`Setup Test Settings`, async () => {
    await restoreSettings(configurationService, settings);
    project = settings.workingProject;
    store.state.jira = new Jira();
    assert.strictEqual(1, 1);
  });

  const preparePaylod = (test: ITest): any => {
    let payload;
    switch (test.type) {
      case 'jql':
        return { jql: `project = '${project}' ORDER BY status ASC, updated DESC`, maxResults: 20 };
      case 'issueKey':
        return issueKey;
      case 'project':
        return project;
      case 'createIssue':
        return {
          fields: {
            project: {
              key: project
            },
            issuetype: {
              id: '10004'
            },
            summary: 'VsCode npm test',
            description: 'created by VsCode npm test'
          }
        };
      case 'setTransition':
        return { issueKey, transition: { transition: { id: transitionId } } };
      case 'setAssignIssue': {
        return { issueKey, assignee: assigneeKey };
      }
      case 'addNewComment':
        return { issueKey, comment: { body: 'New comment created by VsCode' } };
      case 'addWorkLog':
        return { issueKey, worklog: { timeSpentSeconds: 180, comment: 'New worklog created by VsCode' } };
      case 'markNotificationsAsReadUnread':
        return { ids: [notification.id], toState: notification.readState.toUpperCase() === 'READ' ? 'UNREAD' : 'READ' };
      default:
        return payload;
    }
  };

  const storeResponse = (name: string, response: any): void => {
    switch (name) {
      case 'createIssue': {
        issueKey = response.key;
        break;
      }
      case 'getTransitions': {
        transitionId = response.transitions[1].id;
        break;
      }
      case 'getAssignees': {
        assigneeKey = response[0].key;
        break;
      }
      case 'getNotifications': {
        notification = response.data[0];
        break;
      }
    }
  };

  tests.forEach(t => {
    test(t.name, async () => {
      if (t.name !== 'markNotificationsAsReadUnread' || !!notification) {
        const response = await (<any>store.state.jira)[t.name](preparePaylod(t));
        storeResponse(t.name, response);
        if (t.name === 'getIssueByKey') {
          if (response.key !== issueKey || response.fields.assignee.key !== assigneeKey) {
            throw new Error('getIssueByKey -> issue not correct');
          }
        }
        // console.log(JSON.stringify(response));
        assert.strictEqual(1, 1);
      } else {
        assert.strictEqual(1, 1);
      }
    });
  });

  test(`Restore Settings Backup`, async () => {
    await restoreSettings(configurationService, settingsBkp);
    assert.strictEqual(1, 1);
  });
});
