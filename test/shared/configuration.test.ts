import * as assert from 'assert';
import * as config from '../../src/shared/configuration';
import { CONFIG, CREDENTIALS_SEPARATOR } from '../../src/shared/constants';

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
      value: `${CONFIG.BASE_URL}_test_value/`,
      expected: `${CONFIG.BASE_URL}_test_value/`,
      equal: false
    },
    {
      title: `${CONFIG.BASE_URL} 3`,
      config: CONFIG.BASE_URL,
      value: `${CONFIG.BASE_URL}_test_value/`,
      expected: `${CONFIG.BASE_URL}_test_value`,
      equal: true
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
      config.setConfigurationByKey(entry.config, entry.value);
      if (entry.equal) {
        assert.equal(entry.expected, config.getConfigurationByKey(entry.config));
      } else {
        assert.notEqual(entry.expected, config.getConfigurationByKey(entry.config));
      }
    });
  });

  test(`Test password config`, () => {
    const password = 'my_password';
    config.setGlobalStateConfiguration(password);
    const result = config.getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR)[1];
    assert.equal(password, result);
  });
});
