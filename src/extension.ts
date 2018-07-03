import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { createClient, Jira } from './api';
import { SetActiveProjectCommand } from './commands/set-active-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { CONFIG, CREDENTIALS_SEPARATOR, getConfigurationByKey, getGlobalStateConfiguration } from './configuration';
import { IssueLinkProvider } from './document-link-provider';
import state from './state';
import { StatusBarManager } from './status-bar';

let context: vscode.ExtensionContext;
let channel: vscode.OutputChannel;
let baseUrl: string | undefined;

export function activate(_context: vscode.ExtensionContext): void {
  context = _context;
  state.workspaceState = context.workspaceState;
  channel = vscode.window.createOutputChannel('JIRA');
  context.subscriptions.push(channel);

  const jiraLinkProvider = new IssueLinkProvider();
  vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);

  if (getConfigurationByKey(CONFIG.BASE_URL)) {
    const connect = async () => {
      state.jira = (await connectToJira(context))!;
      state.update();
    };
    connect().catch(() => {
      vscode.window.showErrorMessage('Failed to connect to jira');
    });
  }

  const commands = [new SetupCredentialsCommand(context), new SetActiveProjectCommand(context)];
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(new StatusBarManager());
}

export function checkEnabled(): boolean {
  const config = vscode.workspace.getConfiguration('jira');
  if (!state.jira || !config.has('baseUrl') || !config.has('projectNames')) {
    vscode.window.showInformationMessage('No JIRA client configured. Setup baseUrl, projectNames, username and password');
    return false;
  }
  return true;
}

export async function connectToJira(ceontext: vscode.ExtensionContext): Promise<Jira | undefined> {
  const baseUrl = getConfigurationByKey(CONFIG.BASE_URL);
  const globalConfig = getGlobalStateConfiguration(context);
  if (baseUrl && globalConfig) {
    try {
      const [username, password] = globalConfig.split(CREDENTIALS_SEPARATOR);
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
}
