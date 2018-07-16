import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { ChangeIssueLoggingCommand } from './commands/change-logging-issue';
import { ChangeIssueAssigneeCommand } from './commands/change-issue-assignee';
import { ChangeIssueStatusCommand } from './commands/change-issue-status';
import { IssueAddCommentCommand } from './commands/issue-add-comment';
import { OpenIssueCommand } from './commands/open-issue';
import { SetWorkingProjectCommand } from './commands/set-working-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { JiraExplorer } from './explorer/jira-explorer';
import { CONFIG_NAME, SEARCH_MODE } from './shared/constants';
import { IssueLinkProvider } from './shared/document-link-provider';
import { selectIssue } from './shared/select-utilities';
import { StatusBarManager } from './shared/status-bar';
import { executeConnectionToJira } from './shared/utilities';
import state from './state/state';

let channel: vscode.OutputChannel;

export const activate = (context: vscode.ExtensionContext): void => {
  channel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  context.subscriptions.push(channel);

  const jiraLinkProvider = new IssueLinkProvider();
  vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);

  const statusBar = new StatusBarManager();
  state.context = context;
  state.channel = channel;
  state.statusBar = statusBar;
  executeConnectionToJira();

  const jiraExplorer = new JiraExplorer();
  vscode.window.registerTreeDataProvider('jiraExplorer', jiraExplorer);

  state.jiraExplorer = jiraExplorer;

  const commands = [
    new SetupCredentialsCommand(),
    new SetWorkingProjectCommand(),
    new ChangeIssueStatusCommand(),
    new ChangeIssueAssigneeCommand(),
    new IssueAddCommentCommand(),
    new OpenIssueCommand(),
    new ChangeIssueLoggingCommand()
  ];

  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.refresh', () => selectIssue(SEARCH_MODE.REFRESH)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.allIssuesCommand', () => selectIssue(SEARCH_MODE.ALL)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.myIssuesByStatusCommand', () => selectIssue(SEARCH_MODE.STATUS)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issuesByStatusAssigneeCommand', () => selectIssue(SEARCH_MODE.STATUS_ASSIGNEE)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issueByIdCommand', () => selectIssue(SEARCH_MODE.ID)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issuesBySummaryCommand', () => selectIssue(SEARCH_MODE.SUMMARY)));
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(statusBar);
};
