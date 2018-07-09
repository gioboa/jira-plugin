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
const backPick_1 = require("../picks/backPick");
const unassignedAssigneePick_1 = require("../picks/unassignedAssigneePick");
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
exports.selectProject = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const picks = state_1.default.projects.map(project => ({
            label: project.key,
            description: project.name
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Set working project`, matchOnDescription: true });
        return selected ? selected.label : '';
    }
    return '';
});
exports.selectStatus = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const picks = state_1.default.statuses.map(status => ({
            label: exports.addStatusIcon(status.name),
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
const selectSummary = () => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA Summary' });
});
const createJQL = (mode, project) => __awaiter(this, void 0, void 0, function* () {
    switch (mode) {
        case constants_1.SEARCH_MODE.ID: {
            const id = yield selectID();
            if (!!id) {
                return `id = '${project}-${id}' ORDER BY updated DESC`;
            }
            return undefined;
        }
        case constants_1.SEARCH_MODE.STATUS: {
            const status = yield exports.selectStatus();
            if (!!status) {
                return `project in (${project}) AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`;
            }
            return undefined;
        }
        case constants_1.SEARCH_MODE.STATUS_ASSIGNEE: {
            const { status, assignee } = yield exports.selectStatusAndAssignee();
            if (!!status && !!assignee) {
                return `project in (${project}) AND status = '${status}' AND assignee = ${assignee !== constants_1.UNASSIGNED ? `'${assignee}'` : `null`} ORDER BY updated DESC`;
            }
            return undefined;
        }
        case constants_1.SEARCH_MODE.SUMMARY: {
            const summary = yield selectSummary();
            if (!!summary) {
                return `project in (${project}) AND summary ~ '${summary}' ORDER BY updated DESC`;
            }
            return undefined;
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
const createLabel = (issue, mode) => {
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
exports.selectIssue = (mode) => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT);
        if (verifyCurrentProject(project)) {
            const jql = yield createJQL(mode, project || '');
            if (!!jql) {
                const issues = yield state_1.default.jira.search({ jql });
                const picks = (issues.issues || []).map((issue) => {
                    return {
                        issue,
                        label: createLabel(issue, mode),
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
                    vscode.window.showInformationMessage(`No issues found for ${project} project`);
                }
            }
            else {
                throw new Error(`Wrong parameter. No issues found for ${project} project.`);
            }
        }
        else {
            throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
        }
    }
    return undefined;
});
exports.selectAssignee = (back) => __awaiter(this, void 0, void 0, function* () {
    const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT) || '';
    if (verifyCurrentProject(project)) {
        const assignees = yield state_1.default.jira.getAssignees(`search?project=${project}`);
        const picks = (assignees || []).filter((assignee) => assignee.active === true).map((assignee) => {
            return {
                label: assignee.key,
                description: assignee.displayName
            };
        });
        picks.unshift(new backPick_1.default());
        picks.push(new unassignedAssigneePick_1.default());
        const selected = yield vscode.window.showQuickPick(picks, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select an issue'
        });
        return selected ? selected.label : '';
    }
    else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
});
exports.selectStatusAndAssignee = () => __awaiter(this, void 0, void 0, function* () {
    const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT) || '';
    if (verifyCurrentProject(project)) {
        let ok = false;
        let assignee = '';
        let status = '';
        while (ok === false) {
            status = yield exports.selectStatus();
            if (!!status) {
                assignee = yield exports.selectAssignee(true);
            }
            if (!status || assignee !== constants_1.BACK_PICK_LABEL) {
                ok = true;
            }
        }
        return { status, assignee };
    }
    else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
});
//# sourceMappingURL=select-utils.js.map