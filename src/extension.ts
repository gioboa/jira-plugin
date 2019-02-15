import * as vscode from 'vscode';
import commands from './commands';
import './services';
import { gitIntegration, issuesExplorer, statusBar } from './services';
import { CONFIG_NAME } from './shared/constants';
import state, { connectToJira } from './store/state';

let channel: vscode.OutputChannel;

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  channel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  state.channel = channel;
  context.subscriptions.push(channel);
  state.context = context;
  vscode.window.registerTreeDataProvider('issues', issuesExplorer);
  context.subscriptions.push(statusBar);
  context.subscriptions.push(gitIntegration);
  context.subscriptions.push(...commands.register());
  // create Jira Instance and try to connect
  await connectToJira();
};
