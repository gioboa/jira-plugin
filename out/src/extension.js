"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
const vscode = require("vscode");
const change_issue_assignee_1 = require("./commands/change-issue-assignee");
const change_issue_status_1 = require("./commands/change-issue-status");
const issue_add_comment_1 = require("./commands/issue-add-comment");
const open_issue_1 = require("./commands/open-issue");
const set_working_project_1 = require("./commands/set-working-project");
const setup_credentials_1 = require("./commands/setup-credentials");
const jira_explorer_1 = require("./explorer/jira-explorer");
const constants_1 = require("./shared/constants");
const document_link_provider_1 = require("./shared/document-link-provider");
const select_utilities_1 = require("./shared/select-utilities");
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
    const jiraExplorer = new jira_explorer_1.JiraExplorer();
    vscode.window.registerTreeDataProvider('jiraExplorer', jiraExplorer);
    state_1.default.jiraExplorer = jiraExplorer;
    const commands = [
        new setup_credentials_1.SetupCredentialsCommand(),
        new set_working_project_1.SetWorkingProjectCommand(),
        new change_issue_status_1.ChangeIssueStatusCommand(),
        new change_issue_assignee_1.ChangeIssueAssigneeCommand(),
        new issue_add_comment_1.IssueAddCommentCommand(),
        new open_issue_1.OpenIssueCommand()
    ];
    context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.refresh', () => jiraExplorer.refresh()));
    context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.allIssuesCommand', () => select_utilities_1.selectIssue(constants_1.SEARCH_MODE.ALL)));
    context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.myIssuesByStatusCommand', () => select_utilities_1.selectIssue(constants_1.SEARCH_MODE.STATUS)));
    context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issuesByStatusAssigneeCommand', () => select_utilities_1.selectIssue(constants_1.SEARCH_MODE.STATUS_ASSIGNEE)));
    context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issueByIdCommand', () => select_utilities_1.selectIssue(constants_1.SEARCH_MODE.ID)));
    context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issuesBySummaryCommand', () => select_utilities_1.selectIssue(constants_1.SEARCH_MODE.SUMMARY)));
    context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
    context.subscriptions.push(statusBar);
};
//# sourceMappingURL=extension.js.map