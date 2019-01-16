import * as vscode from 'vscode';
import commands from './commands';
import services from './services';
import { GitIntegrationService } from './services/git-integration.service';
import { StatusBarService } from './services/status-bar.service';
import { CONFIG_NAME } from './shared/constants';
import state, { connectToJira } from './store/state';

let channel: vscode.OutputChannel;

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  channel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  state.channel = channel;
  context.subscriptions.push(channel);
  state.context = context;
  services.gitIntegration = new GitIntegrationService();
  services.statusBarManager = new StatusBarService();
  vscode.window.registerTreeDataProvider('jiraExplorer', services.jiraExplorer);
  context.subscriptions.push(services.statusBarManager);
  context.subscriptions.push(services.gitIntegration);
  context.subscriptions.push(...commands.register());
  // create Jira Instance and try to connect
  await connectToJira();
};
