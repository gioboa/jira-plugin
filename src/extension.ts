import * as vscode from 'vscode';
import { ChangeIssueAssigneeCommand } from './commands/change-issue-assignee';
import { ChangeIssueStatusCommand } from './commands/change-issue-status';
import { CreateIssueCommand } from './commands/create-issue';
import { FavouritesFiltersCommand } from './commands/favourites-filters';
import { IssueAddCommentCommand } from './commands/issue-add-comment';
import { IssueAddWorklogCommand } from './commands/issue-add-worklog';
import { OpenGitHubRepoCommand } from './commands/open-github-repo';
import { OpenIssueCommand } from './commands/open-issue';
import { SetWorkingIssueCommand } from './commands/set-working-issue';
import { SetWorkingProjectCommand } from './commands/set-working-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { JiraExplorer } from './explorer/jira-explorer';
import { CONFIG_NAME, SEARCH_MODE } from './shared/constants';
import { IssueLinkProvider } from './shared/document-link-provider';
import { selectIssue } from './shared/select-utilities';
import { StatusBarManager } from './shared/status-bar';
import { GitIntegration } from './shared/git-integration';
import { copyToClipboard, insertWorkingIssueComment } from './shared/utilities';
import state, { connectToJira } from './state/state';

let channel: vscode.OutputChannel;

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  channel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  context.subscriptions.push(channel);

  const statusBar = new StatusBarManager();
  const gitIntegration = new GitIntegration();
  const jiraExplorer = new JiraExplorer();
  vscode.window.registerTreeDataProvider('jiraExplorer', jiraExplorer);

  // instances in the state
  state.context = context;
  state.channel = channel;
  state.statusBar = statusBar;
  state.gitIntegration = gitIntegration;
  state.jiraExplorer = jiraExplorer;

  const commands = [
    new SetupCredentialsCommand(),
    new SetWorkingProjectCommand(),
    new ChangeIssueStatusCommand(),
    new ChangeIssueAssigneeCommand(),
    new IssueAddCommentCommand(),
    new OpenGitHubRepoCommand(),
    new OpenIssueCommand(),
    new SetWorkingIssueCommand(),
    new IssueAddWorklogCommand(),
    new CreateIssueCommand(),
    new FavouritesFiltersCommand()
  ];

  // register all commands
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.refresh', () => selectIssue(SEARCH_MODE.REFRESH)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.allIssuesCommand', () => selectIssue(SEARCH_MODE.ALL)));
  context.subscriptions.push(
    vscode.commands.registerCommand('jira-plugin.currentSprintCommand', () => selectIssue(SEARCH_MODE.CURRENT_SPRINT))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('jira-plugin.myIssuesByStatusCommand', () => selectIssue(SEARCH_MODE.MY_STATUS))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('jira-plugin.issuesByStatusAssigneeCommand', () => selectIssue(SEARCH_MODE.STATUS_ASSIGNEE))
  );
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issuesByStatusCommand', () => selectIssue(SEARCH_MODE.STATUS)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issueByIdCommand', () => selectIssue(SEARCH_MODE.ID)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.issuesBySummaryCommand', () => selectIssue(SEARCH_MODE.SUMMARY)));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.copyJiraSummary', copyToClipboard));
  context.subscriptions.push(vscode.commands.registerCommand('jira-plugin.insertWorkingIssueComment', insertWorkingIssueComment));
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(statusBar);
  context.subscriptions.push(gitIntegration);

  // create Jira Instance and try to connect
  await connectToJira();
};
