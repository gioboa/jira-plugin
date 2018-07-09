"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const api_1 = require("../http/api");
const state_1 = require("../state/state");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
exports.executeConnectionToJira = () => {
    if (configuration_1.getConfigurationByKey(constants_1.CONFIG.BASE_URL)) {
        const connect = () => __awaiter(this, void 0, void 0, function* () {
            state_1.default.jira = (yield exports.connectToJira());
            state_1.default.statusBar.updateStatusBar('');
            state_1.default.statuses = yield state_1.default.jira.getStatuses();
            state_1.default.projects = yield state_1.default.jira.getProjects();
        });
        connect().catch(() => {
            vscode.window.showErrorMessage('Failed to connect to jira');
        });
    }
};
exports.connectToJira = () => __awaiter(this, void 0, void 0, function* () {
    const baseUrl = configuration_1.getConfigurationByKey(constants_1.CONFIG.BASE_URL) || '';
    const [username, password] = configuration_1.getGlobalStateConfiguration().split(constants_1.CREDENTIALS_SEPARATOR);
    if (!!baseUrl && !!username && !!password) {
        try {
            const client = api_1.createClient(baseUrl, username, password);
            const serverInfo = yield client.serverInfo();
            if (serverInfo.versionNumbers[0] < 5) {
                vscode.window.showInformationMessage(`Unsupported JIRA version '${serverInfo.version}'. Must be at least 5.0.0`);
                return;
            }
            state_1.default.channel.appendLine(`Connected to JIRA server at '${baseUrl}'`);
            return client;
        }
        catch (e) {
            state_1.default.channel.appendLine(`Failed to contact JIRA server using '${baseUrl}'. Please check url and credentials`);
            state_1.default.channel.appendLine(e.message);
        }
    }
    return undefined;
});
exports.addStatusIcon = (status) => {
    let icon = constants_1.STATUS_ICONS.DEFAULT.icon;
    if (!!status) {
        if (status.toUpperCase().indexOf(constants_1.STATUS_ICONS.OPEN.text.toUpperCase()) !== -1) {
            icon = constants_1.STATUS_ICONS.OPEN.icon;
        }
        else {
            if (status.toUpperCase().indexOf(constants_1.STATUS_ICONS.PROGRESS.text.toUpperCase()) !== -1) {
                icon = constants_1.STATUS_ICONS.PROGRESS.icon;
            }
        }
    }
    return `${icon} ${status}`;
};
exports.createLabel = (issue, mode) => {
    switch (mode) {
        case constants_1.SEARCH_MODE.ID:
        case constants_1.SEARCH_MODE.SUMMARY:
            return `${exports.addStatusIcon(issue.fields.status.name)} ${issue.key} (${issue.fields.status ? issue.fields.status.name : ''})`;
        case constants_1.SEARCH_MODE.STATUS:
        case constants_1.SEARCH_MODE.STATUS_ASSIGNEE:
            return `${exports.addStatusIcon(issue.fields.status.name)} ${issue.key}`;
        default:
            return '';
    }
};
//# sourceMappingURL=utilities.js.map