"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const state_1 = require("../state/state");
const constants_1 = require("./constants");
exports.configIsCorrect = () => {
    const [username, password] = exports.getGlobalStateConfiguration().split(constants_1.CREDENTIALS_SEPARATOR);
    const config = exports.getConfiguration();
    return config.baseUrl && username && password;
};
exports.getConfiguration = () => {
    const config = vscode.workspace.getConfiguration(constants_1.CONFIG_NAME);
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    return config;
};
exports.getConfigurationByKey = (entry) => {
    const config = vscode.workspace.getConfiguration(constants_1.CONFIG_NAME);
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    return config.get(entry);
};
exports.setConfigurationByKey = (entry, value) => {
    const config = vscode.workspace.getConfiguration(constants_1.CONFIG_NAME);
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    if (entry === constants_1.CONFIG.BASE_URL && value && value.substring(value.length - 1) === '/') {
        value = value.substring(0, value.length - 1);
    }
    return config.update(entry, value || '', true);
};
exports.setGlobalStateConfiguration = (password) => {
    const config = exports.getConfiguration();
    return state_1.default.context.globalState.update(`${constants_1.CONFIG_NAME}:${config.baseUrl}`, `${config.username}${constants_1.CREDENTIALS_SEPARATOR}${password || ''}`);
};
exports.getGlobalStateConfiguration = () => {
    const config = exports.getConfiguration();
    return state_1.default.context.globalState.get(`${constants_1.CONFIG_NAME}:${config.baseUrl}`);
};
exports.setGlobalWorkingIssue = (context, workingIssue) => {
    const config = exports.getConfiguration();
    return context.globalState.update(`${constants_1.CONFIG_NAME}:${config.baseUrl}:${constants_1.CONFIG_WORKING_ISSUE}:${config.workingProject}`, !!workingIssue ? JSON.stringify(workingIssue) : undefined);
};
exports.getGlobalWorkingIssue = (context) => {
    const config = exports.getConfiguration();
    return context.globalState.get(`${constants_1.CONFIG_NAME}:${config.baseUrl}:${constants_1.CONFIG_WORKING_ISSUE}:${config.workingProject}`);
};
//# sourceMappingURL=configuration.js.map