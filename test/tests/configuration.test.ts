import * as assert from 'assert';
import ConfigurationService from '../../src/services/configuration.service';
import { CONFIG, CREDENTIALS_SEPARATOR, DEFAULT_WORKING_ISSUE_STATUS } from '../../src/shared/constants';
import state from '../../src/store/state';

suite('Configuration', () => {
  const tests = [
    {
      title: `${CONFIG.BASE_URL} 1`,
      config: CONFIG.BASE_URL,
      value: `${CONFIG.BASE_URL}_test_value`,
      expected: `${CONFIG.BASE_URL}_test_value`,
      equal: true
    },
    {
      title: `${CONFIG.BASE_URL} 2`,
      config: CONFIG.BASE_URL,
      value: `${CONFIG.BASE_URL}_test2_value/`,
      expected: `${CONFIG.BASE_URL}_test2_value/`,
      equal: false
    },
    {
      title: `${CONFIG.USERNAME} 1`,
      config: CONFIG.USERNAME,
      value: `${CONFIG.USERNAME}_test_value`,
      expected: `${CONFIG.USERNAME}_test_value`,
      equal: true
    },
    {
      title: `${CONFIG.WORKING_PROJECT} 1`,
      config: CONFIG.WORKING_PROJECT,
      value: `${CONFIG.WORKING_PROJECT}_test_value`,
      expected: `${CONFIG.WORKING_PROJECT}_test_value`,
      equal: true
    },
    {
      title: `${CONFIG.ENABLE_WORKING_ISSUE} 1`,
      config: CONFIG.ENABLE_WORKING_ISSUE,
      value: `${CONFIG.ENABLE_WORKING_ISSUE}_test_value`,
      expected: `${CONFIG.ENABLE_WORKING_ISSUE}_test_value`,
      equal: true
    },
    {
      title: `${CONFIG.WORKING_ISSUE_STATUSES}`,
      config: CONFIG.WORKING_ISSUE_STATUSES,
      value: `In Progess, Closed`,
      expected: `In Progess, Closed`,
      equal: true
    }
  ];
  const configuration = new ConfigurationService();

  tests.forEach(entry => {
    test(`${entry.title} config`, async () => {
      await configuration.set(entry.config, entry.value);
      const actual = await configuration.get(entry.config);
      if (entry.equal) {
        assert.equal(entry.expected, actual);
      } else {
        assert.notEqual(entry.expected, actual);
      }
    });
  });

  test(`Password config`, async () => {
    const password = 'my_password';
    await configuration.setGlobalState(password);
    const result = configuration.globalState.split(CREDENTIALS_SEPARATOR)[1];
    assert.equal(password, result);
  });

  test(`Valid config`, async () => {
    await configuration.set(CONFIG.BASE_URL, 'baseUrl');
    await configuration.set(CONFIG.USERNAME, 'my_username');
    await configuration.setGlobalState('my_password');
    assert.equal(configuration.isValid(), true);
  });

  test(`NOT valid config`, async () => {
    await configuration.set(CONFIG.BASE_URL, 'baseUrl');
    await configuration.set(CONFIG.USERNAME, undefined);
    await configuration.setGlobalState('my_password');
    assert.equal(configuration.isValid(), false);
  });

  test(`Global counter config`, async () => {
    await configuration.setGlobalCounter(0);
    await configuration.setGlobalCounter(1);
    assert.equal(configuration.getGlobalCounter(), 1);
  });

  test(`Global working issue`, async () => {
    const workingIssue = {
      issue: {
        id: '',
        key: 'TEST',
        fields: {
          summary: '',
          status: {
            name: ''
          },
          project: {
            id: '',
            key: '',
            name: ''
          }
        }
      },
      trackingTime: 0,
      awayTime: 0
    };
    await configuration.setGlobalWorkingIssue(workingIssue);
    const storedWOrkingIssue = await configuration.getGlobalWorkingIssue();
    assert.equal(storedWOrkingIssue, JSON.stringify(workingIssue));
  });

  test(`WorkingIssueStatuses in statuses list`, async () => {
    state.statuses = [
      {
        description: 'In Progress',
        name: 'In Progress'
      },
      {
        description: 'Closed',
        name: 'Closed'
      }
    ];
    await configuration.set(CONFIG.WORKING_ISSUE_STATUSES, 'In Progress, Closed');
    const statuses = configuration.workingIssueStatuses();
    assert.equal(statuses, `'In Progress','Closed'`);
  });

  test(`WorkingIssueStatuses only one in statuses list`, async () => {
    state.statuses = [
      {
        description: 'In Progress',
        name: 'In Progress'
      },
      {
        description: 'Closed',
        name: 'Closed'
      }
    ];
    await configuration.set(CONFIG.WORKING_ISSUE_STATUSES, 'In Progress, Abc');
    const statuses = configuration.workingIssueStatuses();
    assert.equal(statuses, `'In Progress'`);
  });

  test(`WorkingIssueStatuses not in statuses list`, async () => {
    state.statuses = [
      {
        description: 'In Progress',
        name: 'In Progress'
      },
      {
        description: 'Closed',
        name: 'Closed'
      }
    ];
    await configuration.set(CONFIG.WORKING_ISSUE_STATUSES, 'Abc');
    const statuses = configuration.workingIssueStatuses();
    assert.equal(statuses, `'${DEFAULT_WORKING_ISSUE_STATUS}'`);
  });
});
