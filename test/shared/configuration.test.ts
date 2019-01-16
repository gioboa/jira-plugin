import * as assert from 'assert';
import { configuration } from '../../src/services';
import { CONFIG, CREDENTIALS_SEPARATOR } from '../../src/shared/constants';
import './services';

suite('Configuration Tests', () => {
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
    }
  ];

  tests.forEach(entry => {
    test(`Test ${entry.title} config`, () => {
      return configuration.setConfigurationByKey(entry.config, entry.value).then(() => {
        const actual = configuration.getConfigurationByKey(entry.config);
        if (entry.equal) {
          assert.equal(entry.expected, actual);
        } else {
          assert.notEqual(entry.expected, actual);
        }
      });
    });
  });

  test(`Test password config`, () => {
    const password = 'my_password';
    configuration.setGlobalStateConfiguration(password);
    const result = configuration.getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR)[1];
    assert.equal(password, result);
  });
});
