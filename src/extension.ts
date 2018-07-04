import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { ChangeIssueAssigneeCommand } from './commands/change-issue-assignee';
import { ChangeIssueStatusCommand } from './commands/change-issue-status';
import { IssueByIdCommand } from './commands/issue-by-id';
import { IssuesByStatusAssigneeCommand } from './commands/issues-by-status-assignee';
import { MyIssuesByStatusCommand } from './commands/my-issues-by-status';
import { SetCurrentProjectCommand } from './commands/set-current-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { IssueLinkProvider } from './shared/document-link-provider';
import state from './state/state';
import { StatusBarManager } from './shared/status-bar';
import { getConfigurationByKey, getGlobalStateConfiguration } from './shared/configuration';
import { CONFIG, CREDENTIALS_SEPARATOR } from './shared/constants';
import { createClient } from './http/api';
import { Jira } from './http/api.model';

let channel: vscode.OutputChannel;

export const activate = (context: vscode.ExtensionContext): void => {
  channel = vscode.window.createOutputChannel('JIRA');
  context.subscriptions.push(channel);

  const jiraLinkProvider = new IssueLinkProvider();
  vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);

  if (getConfigurationByKey(CONFIG.BASE_URL)) {
    const connect = async () => {
      state.jira = (await connectToJira(context))!;
      state.context = context;
      state.statuses = await state.jira.getStatuses();
      state.projects = await state.jira.getProjects();
    };
    connect().catch(() => {
      vscode.window.showErrorMessage('Failed to connect to jira');
    });
  }

  const statusBar = new StatusBarManager();
  const commands = [
    new SetupCredentialsCommand(context),
    new SetCurrentProjectCommand(statusBar),
    new MyIssuesByStatusCommand(),
    new IssuesByStatusAssigneeCommand(),
    new IssueByIdCommand(),
    new ChangeIssueStatusCommand(),
    new ChangeIssueAssigneeCommand()
  ];
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(statusBar);
};

export const connectToJira = async (context: vscode.ExtensionContext): Promise<Jira | undefined> => {
  const baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';
  const [username, password] = getGlobalStateConfiguration(context).split(CREDENTIALS_SEPARATOR);
  if (!!baseUrl && !!username && !!password) {
    try {
      const client = createClient(baseUrl, username, password);
      const serverInfo = await client.serverInfo();
      if (serverInfo.versionNumbers[0] < 5) {
        vscode.window.showInformationMessage(`Unsupported JIRA version '${serverInfo.version}'. Must be at least 5.0.0`);
        return;
      }
      channel.appendLine(`Connected to JIRA server at '${baseUrl}'`);
      return client;
    } catch (e) {
      channel.appendLine(`Failed to contact JIRA server using '${baseUrl}'. Please check url and credentials`);
      channel.appendLine(e.message);
    }
  }
  return undefined;
};
