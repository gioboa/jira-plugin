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
const backPick_1 = require("../picks/backPick");
const unassignedAssigneePick_1 = require("../picks/unassignedAssigneePick");
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
            label: utilities_1.addStatusIcon(status.name),
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
            const status = yield selectStatus();
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
exports.selectIssue = (mode) => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT);
        if (state_1.verifyCurrentProject(project)) {
            const jql = yield createJQL(mode, project || '');
            if (!!jql) {
                const issues = yield state_1.default.jira.search({ jql });
                const picks = (issues.issues || []).map((issue) => {
                    return {
                        pickValue: issue.key,
                        label: utilities_1.createLabel(issue, mode),
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
                    return selected ? selected.pickValue : undefined;
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
    if (state_1.verifyCurrentProject(project)) {
        const assignees = yield state_1.default.jira.getAssignees(`search?project=${project}`);
        const picks = (assignees || []).filter((assignee) => assignee.active === true).map((assignee) => {
            return {
                pickValue: assignee.key,
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
        firstChoise = yield selectStatus();
        if (!!firstChoise) {
            secondChoise = yield exports.selectAssignee(true);
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
        const { firstChoise, secondChoise } = yield doubleSelection(selectStatus, exports.selectAssignee);
        return { status: firstChoise, assignee: secondChoise };
    }
    else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
});
exports.selectIssueAndAssignee = () => __awaiter(this, void 0, void 0, function* () {
    const project = configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT) || '';
    if (state_1.verifyCurrentProject(project)) {
        const { firstChoise, secondChoise } = yield doubleSelection(selectStatus, exports.selectAssignee);
        return { issueKey: firstChoise, assignee: secondChoise };
    }
    else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
});
//# sourceMappingURL=select-utilities.js.map