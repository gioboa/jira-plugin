import * as vscode from 'vscode';
import commands from './commands';
import { JiraExplorer } from './explorer/jira-explorer';
import { CONFIG_NAME } from './shared/constants';
import { GitIntegration } from './shared/git-integration';
import { StatusBarManager } from './shared/status-bar';
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

  context.subscriptions.push(statusBar);
  context.subscriptions.push(gitIntegration);

  context.subscriptions.push(...commands.register());

  // create Jira Instance and try to connect
  await connectToJira();
};
