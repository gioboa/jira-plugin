"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const no_log_issue_pick_1 = require("../picks/no-log-issue-pick");
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
    issueLogging: new no_log_issue_pick_1.default().pickValue
};
exports.default = state;
exports.canExecuteJiraAPI = () => {
    return state.jira && configuration_1.configIsCorrect();
};
exports.verifyCurrentProject = (project) => {
    return !!project && state.projects.filter((prj) => prj.key === project).length > 0;
};
exports.changeIssuesInState = (filter, jql, issues) => {
    state.currentFilter = filter;
    state.currentJQL = jql;
    state.issues = issues;
    state.jiraExplorer.refresh();
};
exports.changeIssueLogging = (newActiveIssue) => {
    state.issueLogging = newActiveIssue;
    state.statusBar.updateIssueLoggingItem();
};
//# sourceMappingURL=state.js.map