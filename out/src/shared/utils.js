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
exports.SEARCH_MODE = {
    ID: 'ID',
    STATUS: 'STATUS',
    STATUS_ASSIGNEE: 'STATUS_ASSIGNEE'
};
exports.UNASSIGNED = 'Unassigned';
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
exports.selectProject = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const picks = state_1.default.projects.map(project => ({
            label: project.key,
            description: project.name
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
        return selected ? selected.label : '';
    }
    return '';
});
exports.selectStatus = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const picks = state_1.default.statuses.map(status => ({
            label: status.name,
            description: status.description
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
        return selected ? selected.label : '';
    }
    return '';
});
const verifyCurrentProject = (project) => {
    return !!project && state_1.default.projects.filter((prj) => prj.key === project).length > 0;
};
const selectID = () => __awaiter(this, void 0, void 0, function* () {
    const id = yield vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA ID (only the number)' });
    return id && !isNaN(parseInt(id)) ? parseInt(id).toString() : undefined;
});
const createJQL = (mode, project) => __awaiter(this, void 0, void 0, function* () {
    switch (mode) {
        case exports.SEARCH_MODE.ID: {
            const id = yield selectID();
            if (!!id) {
                return `id = '${project}-${id}' ORDER BY updated DESC`;
            }
            return undefined;
        }
        case exports.SEARCH_MODE.STATUS: {
            const status = yield exports.selectStatus();
            if (!!status) {
                return `project in (${project}) AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`;
            }
            return undefined;
        }
        case exports.SEARCH_MODE.STATUS_ASSIGNEE: {
            const status = yield exports.selectStatus();
            const assignee = yield exports.selectAssignee();
            if (!!status && !!assignee) {
                return `project in (${project}) AND status = '${status}' AND assignee = ${assignee !== exports.UNASSIGNED ? `'${assignee}'` : `null`} ORDER BY updated DESC`;
            }
            return undefined;
        }
    }
    return undefined;
});
exports.selectIssue = (mode) => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.CURRENT_PROJECT);
        if (verifyCurrentProject(project)) {
            const jql = yield createJQL(mode, project || '');
            if (!!jql) {
                const issues = yield state_1.default.jira.search({ jql });
                const picks = (issues.issues || []).map((issue) => {
                    return {
                        issue,
                        label: issue.key,
                        description: issue.fields.summary,
                        detail: issue.fields.description
                    };
                });
                if (picks.length > 0) {
                    const selected = yield vscode.window.showQuickPick(picks, {
                        matchOnDescription: true,
                        matchOnDetail: true,
                        placeHolder: 'Select an issue'
                    });
                    return selected ? selected.label : undefined;
                }
                else {
                    vscode.window.showInformationMessage(`No issues found in this project: ${project}`);
                }
            }
            else {
                vscode.window.showInformationMessage(`No issues found. Wrong parameter`);
            }
        }
        else {
            vscode.window.showInformationMessage(`Current project not correct, please select one valid project`);
        }
    }
    return undefined;
});
exports.selectAssignee = () => __awaiter(this, void 0, void 0, function* () {
    const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.CURRENT_PROJECT) || '';
    if (verifyCurrentProject(project)) {
        const assignees = yield state_1.default.jira.getAssignees(`search?project=${project}`);
        const picks = (assignees || []).filter((assignee) => assignee.active === true).map((assignee) => {
            return {
                label: assignee.key,
                description: assignee.displayName,
                detail: ''
            };
        });
        picks.push({
            label: exports.UNASSIGNED,
            description: exports.UNASSIGNED,
            detail: ''
        });
        const selected = yield vscode.window.showQuickPick(picks, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select an issue'
        });
        return selected ? selected.label : '';
    }
    else {
        vscode.window.showInformationMessage(`Current project not correct, please select one valid project`);
    }
    return '';
});
//# sourceMappingURL=utils.js.map