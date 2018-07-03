import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from '../command';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssignee';
  
  constructor(private context: vscode.ExtensionContext) {}

  @bind
  public async run(): Promise<void> {
    //
  }
}
