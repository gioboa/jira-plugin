"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
const vscode = require("vscode");
const change_issue_assignee_1 = require("./commands/change-issue-assignee");
const change_issue_status_1 = require("./commands/change-issue-status");
const issue_add_comment_1 = require("./commands/issue-add-comment");
const issue_by_id_1 = require("./commands/issue-by-id");
const issues_by_status_assignee_1 = require("./commands/issues-by-status-assignee");
const issues_by_summary_1 = require("./commands/issues-by-summary");
const my_issues_by_status_1 = require("./commands/my-issues-by-status");
const set_working_project_1 = require("./commands/set-working-project");
const setup_credentials_1 = require("./commands/setup-credentials");
const constants_1 = require("./shared/constants");
const document_link_provider_1 = require("./shared/document-link-provider");
const status_bar_1 = require("./shared/status-bar");
const utilities_1 = require("./shared/utilities");
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
    utilities_1.executeConnectionToJira();
    const commands = [
        new setup_credentials_1.SetupCredentialsCommand(),
        new set_working_project_1.SetWorkingProjectCommand(),
        new my_issues_by_status_1.MyIssuesByStatusCommand(),
        new issues_by_status_assignee_1.IssuesByStatusAssigneeCommand(),
        new issue_by_id_1.IssueByIdCommand(),
        new change_issue_status_1.ChangeIssueStatusCommand(),
        new change_issue_assignee_1.ChangeIssueAssigneeCommand(),
        new issue_add_comment_1.IssueAddCommentCommand(),
        new issues_by_summary_1.IssuesBySummaryCommand()
    ];
    context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
    context.subscriptions.push(statusBar);
};
//# sourceMappingURL=extension.js.map