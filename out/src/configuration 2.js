"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
exports.CONFIG = {
    BASE_URL: 'baseUrl',
    USERNAME: 'username',
    ACTIVE_PROJECT: 'activeProject'
};
exports.CREDENTIALS_SEPARATOR = '##';
function getConfiguration() {
    const config = vscode.workspace.getConfiguration('jira');
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    return config;
}
exports.getConfiguration = getConfiguration;
function getConfigurationByKey(entry) {
    const config = vscode.workspace.getConfiguration('jira');
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    return config.get(entry);
}
exports.getConfigurationByKey = getConfigurationByKey;
function setConfigurationByKey(entry, value) {
    const config = vscode.workspace.getConfiguration('jira');
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    if (entry === exports.CONFIG.BASE_URL && value && value.substring(value.length - 1) === '/') {
        value = value.substring(0, value.length - 1);
    }
    return config.update(entry, value || '', true);
}
exports.setConfigurationByKey = setConfigurationByKey;
function setGlobalStateConfiguration(context, password) {
    const config = getConfiguration();
    return context.globalState.update(`jira-plugin:${config.baseUrl}`, `${config.username}${exports.CREDENTIALS_SEPARATOR}${password || ''}`);
}
exports.setGlobalStateConfiguration = setGlobalStateConfiguration;
function getGlobalStateConfiguration(context) {
    const config = getConfiguration();
    return context.globalState.get(`jira-plugin:${config.baseUrl}`);
}
exports.getGlobalStateConfiguration = getGlobalStateConfiguration;
//# sourceMappingURL=configuration 2.js.map