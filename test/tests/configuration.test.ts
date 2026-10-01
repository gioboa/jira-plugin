import * as assert from 'node:assert';
import { describe, it } from 'vitest';
import ConfigurationService from '../../src/services/configuration.service';
import { IWorkingIssue } from '../../src/services/http.model';
import StoreService from '../../src/services/store.service';
import { CONFIG, DEFAULT_WORKING_ISSUE_STATUS } from '../../src/shared/constants';
import { backupSettings, restoreSettings } from '../utils/utils';

describe('Configuration', () => {
  const configurationService = new ConfigurationService();
  const store = new StoreService();
  const tests = [
    {
      title: `${CONFIG.BASE_URL} 1`,
      config: CONFIG.BASE_URL,
      value: `${CONFIG.BASE_URL}_test_value`,
      expected: `${CONFIG.BASE_URL}_test_value`,
      equal: true,
    },
    {
      title: `${CONFIG.BASE_URL} 2`,
      config: CONFIG.BASE_URL,
      value: `${CONFIG.BASE_URL}_test2_value/`,
      expected: `${CONFIG.BASE_URL}_test2_value/`,
      equal: false,
    },
    {
      title: `${CONFIG.USERNAME} 1`,
      config: CONFIG.USERNAME,
      value: `${CONFIG.USERNAME}_test_value`,
      expected: `${CONFIG.USERNAME}_test_value`,
      equal: true,
    },
    {
      title: `${CONFIG.WORKING_PROJECT} 1`,
      config: CONFIG.WORKING_PROJECT,
      value: `${CONFIG.WORKING_PROJECT}_test_value`,
      expected: `${CONFIG.WORKING_PROJECT}_test_value`,
      equal: true,
    },
    {
      title: `${CONFIG.ENABLE_WORKING_ISSUE} 1`,
      config: CONFIG.ENABLE_WORKING_ISSUE,
      value: `${CONFIG.ENABLE_WORKING_ISSUE}_test_value`,
      expected: `${CONFIG.ENABLE_WORKING_ISSUE}_test_value`,
      equal: true,
    },
    {
      title: `${CONFIG.WORKING_ISSUE_STATUSES}`,
      config: CONFIG.WORKING_ISSUE_STATUSES,
      value: `In Progess, Closed`,
      expected: `In Progess, Closed`,
      equal: true,
    },
  ];
  let settingsBkp = <any>{};

  it(`Backup Settings`, async () => {
    await backupSettings(configurationService, settingsBkp);
    assert.strictEqual(1, 1);
  });

  tests.forEach((entry) => {
    it(`${entry.title} config`, async () => {
      await configurationService.set(entry.config, entry.value);
      const actual = await configurationService.get(entry.config);
      if (entry.equal) {
        assert.strictEqual(entry.expected, actual);
      } else {
        assert.notStrictEqual(entry.expected, actual);
      }
    });
  });

  it(`Password config`, async () => {
    const password = 'my_password';
    await configurationService.setPassword(password);
    const { password: result } = configurationService.credentials;
    assert.strictEqual(password, result);
  });

  it(`Valid config`, async () => {
    await configurationService.set(CONFIG.BASE_URL, 'baseUrl');
    await configurationService.set(CONFIG.USERNAME, 'my_username');
    await configurationService.setPassword('my_password');
    assert.strictEqual(configurationService.isValid(), true);
  });

  it(`NOT valid config`, async () => {
    await configurationService.set(CONFIG.BASE_URL, 'baseUrl');
    await configurationService.set(CONFIG.USERNAME, undefined);
    await configurationService.setPassword('my_password');
    assert.strictEqual(configurationService.isValid(), false);
  });

  it(`Global counter config`, async () => {
    await configurationService.setGlobalCounter(0);
    await configurationService.setGlobalCounter(1);
    assert.strictEqual(configurationService.getGlobalCounter(), 1);
  });

  it(`Global working issue`, async () => {
    const workingIssue: IWorkingIssue = {
      issue: {
        id: '',
        key: 'TEST',
        fields: {
          summary: '',
          status: {
            name: '',
          },
          project: {
            id: '',
            key: '',
            name: '',
          },
        },
      },
      trackingTime: 0,
      awayTime: 0,
      stopped: false,
    };
    await configurationService.setGlobalWorkingIssue(workingIssue);
    const storedWOrkingIssue = await configurationService.getGlobalWorkingIssue();
    assert.strictEqual(storedWOrkingIssue, JSON.stringify(workingIssue));
  });

  it(`WorkingIssueStatuses in statuses list`, async () => {
    await configurationService.set(CONFIG.WORKING_ISSUE_STATUSES, 'In Progress, Closed');
    const statuses = configurationService.workingIssueStatuses([
      { description: 'In Progress', name: 'In Progress' },
      { description: 'Closed', name: 'Closed' },
    ]);
    assert.strictEqual(statuses, `'In Progress','Closed'`);
  });

  it(`WorkingIssueStatuses only one in statuses list`, async () => {
    await configurationService.set(CONFIG.WORKING_ISSUE_STATUSES, 'In Progress, Abc');
    const statuses = configurationService.workingIssueStatuses([
      { description: 'In Progress', name: 'In Progress' },
      { description: 'Closed', name: 'Closed' },
    ]);
    assert.strictEqual(statuses, `'In Progress'`);
  });

  it(`WorkingIssueStatuses not in statuses list`, async () => {
    await configurationService.set(CONFIG.WORKING_ISSUE_STATUSES, 'Abc');
    const statuses = configurationService.workingIssueStatuses([
      { description: 'In Progress', name: 'In Progress' },
      { description: 'Closed', name: 'Closed' },
    ]);
    assert.strictEqual(statuses, `'${DEFAULT_WORKING_ISSUE_STATUS}'`);
  });

  it(`Restore Settings Backup`, async () => {
    await restoreSettings(configurationService, settingsBkp);
    assert.strictEqual(1, 1);
  });
});
