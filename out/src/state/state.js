"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../shared/configuration");
const state = {
    jira: undefined,
    context: undefined,
    channel: undefined,
    statusBar: undefined,
    jiraExplorer: undefined,
    statuses: [],
    projects: [],
    issues: [],
    currentFilter: '',
    currentJQL: ''
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
//# sourceMappingURL=state.js.map