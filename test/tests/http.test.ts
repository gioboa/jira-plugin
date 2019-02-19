import * as assert from 'assert';
import NoWorkingIssuePick from '../../src/picks/no-working-issue-pick';
import ConfigurationService from '../../src/services/configuration.service';
import { IIssue } from '../../src/services/http.model';
import { Jira } from '../../src/services/http.service';
import { LOADING } from '../../src/shared/constants';
import { IState } from '../../src/store/state';
import { settings } from '../utils/settings';
import { backupSettings, restoreSettings } from '../utils/utils';

suite('Jira API', () => {
  const configurationService = new ConfigurationService();
  const state: IState = {
    jira: undefined as any,
    context: undefined as any,
    channel: undefined as any,
    documentLinkDisposable: undefined as any,
    statuses: [],
    projects: [],
    issues: [],
    currentFilter: LOADING.text,
    currentJQL: '',
    workingIssue: {
      issue: new NoWorkingIssuePick().pickValue,
      trackingTime: 0,
      awayTime: 0
    }
  };
  interface ITest {
    name: string;
    type: 'none' | 'project' | 'issueKey' | 'jql';
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
    { name: 'getIssueByKey', type: 'issueKey' },
    { name: 'getAssignees', type: 'project' },
    { name: 'getTransitions', type: 'issueKey' },
    { name: 'getAllIssueTypesWithFields', type: 'project' },
    { name: 'getCreateIssueEpics', type: 'project' },
    { name: 'getCreateIssueLabels', type: 'none' },
    { name: 'getAvailableLinkIssuesType', type: 'none' },
    { name: 'getNotifications', type: 'none' }
  ];
  // setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void>;
  // setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void>;
  // addNewComment(params: { issueKey: string; comment: IAddComment }): Promise<IAddCommentResponse>;
  // addWorkLog(params: { issueKey: string; worklog: IAddWorkLog }): Promise<void>;
  // createIssue(params: ICreateIssue): Promise<any>;
  // markNotificationsAsReadUnread(payload: IMarkNotificationAsReadUnread): Promise<any>;
  let project = '';
  let issue: IIssue;
  let settingsBkp = <any>{};

  test(`Backup Settings`, async () => {
    await backupSettings(configurationService, settingsBkp);
    assert.strictEqual(1, 1);
  });

  test(`Setup Test Settings`, async () => {
    await restoreSettings(configurationService, settings);
    state.jira = new Jira();
    assert.strictEqual(1, 1);
  });

  const preparePaylod = (test: ITest): any => {
    let payload;
    if (test.type === 'jql') {
      payload = { jql: `project = '${project}' ORDER BY status ASC, updated DESC`, maxResults: 20 };
    }
    if (test.type === 'issueKey') {
      payload = issue.key;
    }
    if (test.type === 'project') {
      payload = project;
    }
    return payload;
  };
  tests.forEach(t => {
    test(t.name, async () => {
      const response = await (<any>state.jira)[t.name](preparePaylod(t));
      if (t.name === 'getProjects') {
        project = response[0].key;
      }
      if (t.name === 'search') {
        issue = response.issues[0];
      }
      // console.log(JSON.stringify(response));
      assert.strictEqual(!!response, true);
    });
  });

  test(`Restore Settings Backup`, async () => {
    await restoreSettings(configurationService, settingsBkp);
    assert.strictEqual(1, 1);
  });
});
