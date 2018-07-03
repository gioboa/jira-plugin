"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
const state = {
    jira: undefined,
    context: undefined
};
exports.default = state;
exports.canExecuteJiraAPI = () => {
    return state.jira && configuration_1.configIsCorrect(state.context);
};
//# sourceMappingURL=state.js.map