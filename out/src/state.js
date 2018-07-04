"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./shared/configuration");
const state = {
    jira: undefined,
    context: undefined,
    statuses: [],
    projects: []
};
exports.default = state;
exports.canExecuteJiraAPI = () => {
    return state.jira && configuration_1.configIsCorrect(state.context);
};
//# sourceMappingURL=state.js.map