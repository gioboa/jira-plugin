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
const no_working_issue_pick_1 = require("../picks/no-working-issue-pick");
const configuration_1 = require("../shared/configuration");
const constants_1 = require("../shared/constants");
const state = {
    jira: undefined,
    context: undefined,
    channel: undefined,
    statusBar: undefined,
    jiraExplorer: undefined,
    statuses: [],
    projects: [],
    issues: [],
    currentFilter: constants_1.LOADING.text,
    currentJQL: '',
    workingIssue: {
        issue: new no_working_issue_pick_1.default().pickValue,
        timePerSecond: 0
    }
};
exports.default = state;
exports.canExecuteJiraAPI = () => {
    return state.jira && configuration_1.configIsCorrect();
};
exports.verifyCurrentProject = (project) => {
    return !!project && state.projects.filter((prj) => prj.key === project).length > 0;
};
exports.changeStateIssues = (filter, jql, issues) => {
    state.currentFilter = filter;
    state.currentJQL = jql;
    state.issues = issues;
    state.jiraExplorer.refresh();
};
exports.changeStateWorkingIssue = (issue, timePerSecond) => __awaiter(this, void 0, void 0, function* () {
    state.workingIssue = { issue, timePerSecond };
    state.statusBar.updateWorkingIssueItem(false);
});
exports.incrementStateWorkingIssueTimePerSecond = () => {
    state.workingIssue.timePerSecond += 1;
    // prevent writing to much on storage
    if (state.workingIssue.timePerSecond % 60 === 0) {
        if (state.workingIssue.issue.key !== constants_1.NO_WORKING_ISSUE.key) {
            configuration_1.setGlobalWorkingIssue(state.context, state.workingIssue);
        }
    }
};
exports.isWorkingIssue = (issueKey) => {
    if (issueKey === state.workingIssue.issue.key) {
        vscode.window.showErrorMessage(`Issue ${issueKey} has pending worklog. Resolve the conflict and retry the action.`);
    }
    return issueKey === state.workingIssue.issue.key;
};
//# sourceMappingURL=state.js.map