import * as vscode from 'vscode';

export default async function openGitHubRepo(issueId: string): Promise<void> {
  const url = `https://github.com/gioboa/jira-plugin`;
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
}
