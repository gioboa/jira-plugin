import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { ChangeIssueAssigneeCommand } from './commands/change-issue-assignee';
import { ChangeIssueStatusCommand } from './commands/change-issue-status';
import { IssueAddCommentCommand } from './commands/issue-add-comment';
import { IssueByIdCommand } from './commands/issue-by-id';
import { IssuesByStatusAssigneeCommand } from './commands/issues-by-status-assignee';
import { IssuesBySummaryCommand } from './commands/issues-by-summary';
import { MyIssuesByStatusCommand } from './commands/my-issues-by-status';
import { SetWorkingProjectCommand } from './commands/set-working-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { CONFIG_NAME } from './shared/constants';
import { IssueLinkProvider } from './shared/document-link-provider';
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

  const commands = [
    new SetupCredentialsCommand(),
    new SetWorkingProjectCommand(),
    new MyIssuesByStatusCommand(),
    new IssuesByStatusAssigneeCommand(),
    new IssueByIdCommand(),
    new ChangeIssueStatusCommand(),
    new ChangeIssueAssigneeCommand(),
    new IssueAddCommentCommand(),
    new IssuesBySummaryCommand()
  ];
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(statusBar);
};
