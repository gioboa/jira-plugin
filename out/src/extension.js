"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
const vscode = require("vscode");
const change_issue_assignee_1 = require("./commands/change-issue-assignee");
const change_issue_status_1 = require("./commands/change-issue-status");
const issue_by_id_1 = require("./commands/issue-by-id");
const issues_by_status_assignee_1 = require("./commands/issues-by-status-assignee");
const my_issues_by_status_1 = require("./commands/my-issues-by-status");
const set_working_project_1 = require("./commands/set-working-project");
const setup_credentials_1 = require("./commands/setup-credentials");
const constants_1 = require("./shared/constants");
const document_link_provider_1 = require("./shared/document-link-provider");
const status_bar_1 = require("./shared/status-bar");
const utils_1 = require("./shared/utils");
const state_1 = require("./state/state");
let channel;
exports.activate = (context) => {
    channel = vscode.window.createOutputChannel(constants_1.CONFIG_NAME.toUpperCase());
    context.subscriptions.push(channel);
    const jiraLinkProvider = new document_link_provider_1.IssueLinkProvider();
    vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);
    const statusBar = new status_bar_1.StatusBarManager();
    state_1.default.context = context;
    state_1.default.channel = channel;
    state_1.default.statusBar = statusBar;
    utils_1.executeConnectionToJira();
    const commands = [
        new setup_credentials_1.SetupCredentialsCommand(),
        new set_working_project_1.SetWorkingProjectCommand(),
        new my_issues_by_status_1.MyIssuesByStatusCommand(),
        new issues_by_status_assignee_1.IssuesByStatusAssigneeCommand(),
        new issue_by_id_1.IssueByIdCommand(),
        new change_issue_status_1.ChangeIssueStatusCommand(),
        new change_issue_assignee_1.ChangeIssueAssigneeCommand()
    ];
    context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
    context.subscriptions.push(statusBar);
};
//# sourceMappingURL=extension.js.map