"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const config = require("../../src/shared/configuration");
const constants_1 = require("../../src/shared/constants");
suite('Configuration Tests', () => {
    const tests = [
        {
            title: `${constants_1.CONFIG.BASE_URL} 1`,
            config: constants_1.CONFIG.BASE_URL,
            value: `${constants_1.CONFIG.BASE_URL}_test_value`,
            expected: `${constants_1.CONFIG.BASE_URL}_test_value`,
            equal: true
        },
        {
            title: `${constants_1.CONFIG.BASE_URL} 2`,
            config: constants_1.CONFIG.BASE_URL,
            value: `${constants_1.CONFIG.BASE_URL}_test_value/`,
            expected: `${constants_1.CONFIG.BASE_URL}_test_value/`,
            equal: false
        },
        {
            title: `${constants_1.CONFIG.BASE_URL} 3`,
            config: constants_1.CONFIG.BASE_URL,
            value: `${constants_1.CONFIG.BASE_URL}_test_value/`,
            expected: `${constants_1.CONFIG.BASE_URL}_test_value`,
            equal: true
        },
        {
            title: `${constants_1.CONFIG.USERNAME} 1`,
            config: constants_1.CONFIG.USERNAME,
            value: `${constants_1.CONFIG.USERNAME}_test_value`,
            expected: `${constants_1.CONFIG.USERNAME}_test_value`,
            equal: true
        },
        {
            title: `${constants_1.CONFIG.WORKING_PROJECT} 1`,
            config: constants_1.CONFIG.WORKING_PROJECT,
            value: `${constants_1.CONFIG.WORKING_PROJECT}_test_value`,
            expected: `${constants_1.CONFIG.WORKING_PROJECT}_test_value`,
            equal: true
        },
        {
            title: `${constants_1.CONFIG.ENABLE_WORKING_ISSUE} 1`,
            config: constants_1.CONFIG.ENABLE_WORKING_ISSUE,
            value: `${constants_1.CONFIG.ENABLE_WORKING_ISSUE}_test_value`,
            expected: `${constants_1.CONFIG.ENABLE_WORKING_ISSUE}_test_value`,
            equal: true
        }
    ];
    tests.forEach(entry => {
        test(`Test ${entry.title} config`, () => {
            config.setConfigurationByKey(entry.config, entry.value);
            if (entry.equal) {
                assert.equal(entry.expected, config.getConfigurationByKey(entry.config));
            }
            else {
                assert.notEqual(entry.expected, config.getConfigurationByKey(entry.config));
            }
        });
    });
    test(`Test password config`, () => {
        const password = 'my_password';
        config.setGlobalStateConfiguration(password);
        const result = config.getGlobalStateConfiguration().split(constants_1.CREDENTIALS_SEPARATOR)[1];
        assert.equal(password, result);
    });
});
//# sourceMappingURL=configuration.test.js.map