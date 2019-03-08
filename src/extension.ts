import * as vscode from 'vscode';
import commands from './commands';
import './services';
import { gitIntegration, issuesExplorer, statusBar, store } from './services';
import { CONFIG_NAME } from './shared/constants';

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  const channel: vscode.OutputChannel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  context.subscriptions.push(channel);
  store.state.channel = channel;
  store.state.context = context;
  vscode.window.registerTreeDataProvider('issuesExplorer', issuesExplorer);
  context.subscriptions.push(statusBar);
  context.subscriptions.push(gitIntegration);
  context.subscriptions.push(...commands.register());
  // create Jira Instance and try to connect
  await store.connectToJira();
};
