import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { createClient } from './api';
import { Jira } from './api.model';
import { ChangeIssueAssigneeCommand } from './commands/assign-issue';
import { IssueByIdCommand } from './commands/issue-by-id';
import { IssueNewTransitionCommand } from './commands/issue-new-transition';
import { IssuesByStatusAssigneeCommand } from './commands/issues-by-status-assignee';
import { MyIssuesByStatusCommand } from './commands/my-issues-by-status';
import { SetCurrentProjectCommand } from './commands/set-current-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { CONFIG, CREDENTIALS_SEPARATOR, getConfigurationByKey, getGlobalStateConfiguration } from './configuration';
import { IssueLinkProvider } from './document-link-provider';
import state from './state';
import { StatusBarManager } from './status-bar';

let context: vscode.ExtensionContext;
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
    new IssueNewTransitionCommand(),
    new ChangeIssueAssigneeCommand()
  ];
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(statusBar);
};

export const checkEnabled = (): boolean => {
  const config = vscode.workspace.getConfiguration('jira');
  if (!state.jira || !config.has('baseUrl') || !config.has('projectNames')) {
    vscode.window.showInformationMessage('No JIRA client configured. Setup baseUrl, projectNames, username and password');
    return false;
  }
  return true;
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
