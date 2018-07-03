import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from '../command';

export class SetActiveProjectCommand implements Command {
  public id = 'jira-plugin.setActiveProject';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  @bind
  public async run(): Promise<void> {
    //
  }
}
