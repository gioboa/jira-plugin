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
  const tests = [
    'getCloudSession',
    'getStatuses',
    'getProjects',
    'getAllIssueTypes',
    'getAllPriorities',
    'getFavoriteFilters',
    'getSprints',
    'search',
    'getIssueByKey'
  ];
  // getIssueByKey(issueKey: string): Promise<IIssue>;
  // getAssignees(project: string): Promise<IAssignee[]>;
  // getTransitions(issueKey: string): Promise<ITransitions>;
  // setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void>;
  // setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void>;
  // addNewComment(params: { issueKey: string; comment: IAddComment }): Promise<IAddCommentResponse>;
  // addWorkLog(params: { issueKey: string; worklog: IAddWorkLog }): Promise<void>;
  // createIssue(params: ICreateIssue): Promise<any>;
  // getAllIssueTypesWithFields(project: string): Promise<IIssueType[]>;
  // getCreateIssueEpics(project: string, maxResults: number): Promise<ICreateIssueEpic>;
  // getCreateIssueLabels(): Promise<{ suggestions: ILabel[] }>;
  // getAvailableLinkIssuesType(): Promise<{ issueLinkTypes: IAvailableLinkIssuesType[] }>;
  // getNotifications(lastId: string): Promise<INotifications>;
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

  const preparePaylod = (funcName: string): any => {
    let payload;
    if (funcName === 'search') {
      payload = { jql: `project = '${project}' ORDER BY status ASC, updated DESC`, maxResults: 20 };
    }
    if (funcName === 'getIssueByKey') {
      payload = issue.key;
    }
    return payload;
  };
  tests.forEach(name => {
    test(name, async () => {
      const response = await (<any>state.jira)[name](preparePaylod(name));
      if (name === 'getProjects') {
        project = response[0].key;
      }
      if (name === 'search') {
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
