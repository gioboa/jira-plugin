"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("./constants");
exports.configIsCorrect = (context) => {
    if (!context) {
        return false;
    }
    const [username, password] = exports.getGlobalStateConfiguration(context).split(constants_1.CREDENTIALS_SEPARATOR);
    const config = exports.getConfiguration();
    return config.baseUrl && username && password;
};
exports.getConfiguration = () => {
    const config = vscode.workspace.getConfiguration('jira');
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    return config;
};
exports.getConfigurationByKey = (entry) => {
    const config = vscode.workspace.getConfiguration('jira');
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    return config.get(entry);
};
exports.setConfigurationByKey = (entry, value) => {
    const config = vscode.workspace.getConfiguration('jira');
    if (!config) {
        throw new Error('No configuration found. Probably an error in vscode');
    }
    if (entry === constants_1.CONFIG.BASE_URL && value && value.substring(value.length - 1) === '/') {
        value = value.substring(0, value.length - 1);
    }
    return config.update(entry, value || '', true);
};
exports.setGlobalStateConfiguration = (context, password) => {
    const config = exports.getConfiguration();
    return context.globalState.update(`jira-plugin:${config.baseUrl}`, `${config.username}${constants_1.CREDENTIALS_SEPARATOR}${password || ''}`);
};
exports.getGlobalStateConfiguration = (context) => {
    const config = exports.getConfiguration();
    return context.globalState.get(`jira-plugin:${config.baseUrl}`);
};
//# sourceMappingURL=configuration.js.map