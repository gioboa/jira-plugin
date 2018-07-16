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
const back_pick_1 = require("../picks/back-pick");
const no_working_issue_pick_1 = require("../picks/no-working-issue-pick");
const unassigned_assignee_pick_1 = require("../picks/unassigned-assignee-pick");
const state_1 = require("../state/state");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
const utilities_1 = require("./utilities");
exports.selectProject = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const picks = state_1.default.projects.map(project => ({
            pickValue: project.key,
            label: project.key,
            description: project.name
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Set working project`, matchOnDescription: true });
        return selected ? selected.pickValue : '';
    }
    return '';
});
const selectStatus = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const picks = state_1.default.statuses.map(status => ({
            pickValue: status.name,
            label: utilities_1.addStatusIcon(status.name, true),
            description: status.description
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
        return selected ? selected.pickValue : '';
    }
    return '';
});
const selectID = () => __awaiter(this, void 0, void 0, function* () {
    const id = yield vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA ID (only the number)' });
    return id && !isNaN(parseInt(id)) ? parseInt(id).toString() : undefined;
});
const selectSummary = () => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA Summary' });
});
const getFilterAndJQL = (mode, project) => __awaiter(this, void 0, void 0, function* () {
    switch (mode) {
        case constants_1.SEARCH_MODE.ALL: {
            return [`ALL ISSUES`, `project = ${project} ORDER BY updated DESC`];
        }
        case constants_1.SEARCH_MODE.ID: {
            const id = yield selectID();
            if (!!id) {
                return [`ID: ${id}`, `id = '${project}-${id}' ORDER BY updated DESC`];
            }
            break;
        }
        case constants_1.SEARCH_MODE.STATUS: {
            const status = yield selectStatus();
            if (!!status) {
                return [`STATUS: ${status}`, `project = ${project} AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`];
            }
            break;
        }
        case constants_1.SEARCH_MODE.STATUS_ASSIGNEE: {
            const { status, assignee } = yield exports.selectStatusAndAssignee();
            if (!!status && !!assignee) {
                return [`STATUS: ${status} ASSIGNEE ${assignee}`, `project = ${project} AND status = '${status}' AND assignee = ${assignee !== constants_1.UNASSIGNED ? `'${assignee}'` : `null`} ORDER BY updated DESC`];
            }
            break;
        }
        case constants_1.SEARCH_MODE.SUMMARY: {
            const summary = yield selectSummary();
            if (!!summary) {
                return [`SUMMARY: ${summary}`, `project in (${project}) AND summary ~ '${summary}' ORDER BY updated DESC`];
            }
            break;
        }
        case constants_1.SEARCH_MODE.REFRESH: {
            return [state_1.default.currentFilter, state_1.default.currentJQL];
        }
        case constants_1.SEARCH_MODE.MY_IN_PROGRESS_ISSUES: {
            return [`STATUS: In progress`, `project = ${project} AND status = 'In progress' AND assignee in (currentUser()) ORDER BY updated DESC`];
        }
    }
    return ['', ''];
});
exports.selectIssue = (mode) => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT);
        if (state_1.verifyCurrentProject(project)) {
            const [filter, jql] = yield getFilterAndJQL(mode, project || '');
            state_1.changeIssuesInState(constants_1.LOADING.text, '', []);
            if (!!jql) {
                const issues = yield state_1.default.jira.search({ jql });
                if (!!issues && !!issues.issues && issues.issues.length > 0) {
                    state_1.changeIssuesInState(filter, jql, issues.issues);
                }
                else {
                    state_1.changeIssuesInState(filter, jql, []);
                    vscode.window.showInformationMessage(`No issues found for ${project} project`);
                }
            }
            else {
                state_1.changeIssuesInState('', '', []);
                throw new Error(`Wrong parameter. No issues found for ${project} project.`);
            }
        }
        else {
            state_1.changeIssuesInState('', '', []);
            throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
        }
    }
    else {
        state_1.changeIssuesInState('', '', []);
    }
});
exports.selectChangeWorkingIssue = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT);
        if (state_1.verifyCurrentProject(project)) {
            const [filter, jql] = yield getFilterAndJQL(constants_1.SEARCH_MODE.MY_IN_PROGRESS_ISSUES, project || '');
            if (!!jql) {
                const issues = yield state_1.default.jira.search({ jql });
                if (issues.issues && issues.issues.length > 0) {
                    const picks = issues.issues.map(issue => ({
                        pickValue: issue,
                        label: utilities_1.addStatusIcon(issue.fields.status.name, false) + ` ${issue.fields.summary}`,
                        description: ''
                    }));
                    picks.unshift(new no_working_issue_pick_1.default());
                    const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Select Issue`, matchOnDescription: true });
                    return selected ? selected.pickValue : undefined;
                }
                else {
                    vscode.window.showInformationMessage(`No 'In Progress' issues found for your user in ${project} project`);
                }
            }
        }
    }
    return undefined;
});
exports.selectAssignee = (unassigned, back) => __awaiter(this, void 0, void 0, function* () {
    const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT) || '';
    if (state_1.verifyCurrentProject(project)) {
        const assignees = yield state_1.default.jira.getAssignees(`search?project=${project}`);
        const picks = (assignees || []).filter((assignee) => assignee.active === true).map((assignee) => {
            return {
                pickValue: assignee.key,
                label: assignee.key,
                description: assignee.displayName
            };
        });
        if (back) {
            picks.unshift(new back_pick_1.default());
        }
        if (unassigned) {
            picks.push(new unassigned_assignee_pick_1.default());
        }
        const selected = yield vscode.window.showQuickPick(picks, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select an issue'
        });
        return selected ? selected.pickValue : '';
    }
    else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
});
exports.selectTransition = (issueKey) => __awaiter(this, void 0, void 0, function* () {
    const transitions = yield state_1.default.jira.getTransitions(issueKey);
    const picks = transitions.transitions.map(transition => ({
        pickValue: transition.id,
        label: transition.name,
        description: '',
        transition
    }));
    const selected = yield vscode.window.showQuickPick(picks, {
        placeHolder: `Select transition to execute for ${issueKey}`,
        matchOnDescription: true
    });
    return selected ? selected.pickValue : undefined;
});
const doubleSelection = (firstSelection, secondSelection) => __awaiter(this, void 0, void 0, function* () {
    let ok = false;
    let firstChoise = '';
    let secondChoise = '';
    while (ok === false) {
        firstChoise = yield firstSelection();
        if (!!firstChoise) {
            secondChoise = yield secondSelection(true);
        }
        if (!firstChoise || secondChoise !== constants_1.BACK_PICK_LABEL) {
            ok = true;
        }
    }
    return { firstChoise, secondChoise };
});
exports.selectStatusAndAssignee = () => __awaiter(this, void 0, void 0, function* () {
    const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT) || '';
    if (state_1.verifyCurrentProject(project)) {
        const { firstChoise, secondChoise } = yield doubleSelection(selectStatus, () => __awaiter(this, void 0, void 0, function* () { return yield exports.selectAssignee(true, true); }));
        return { status: firstChoise, assignee: secondChoise };
    }
    else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
});
//# sourceMappingURL=select-utilities.js.map