import * as vscode from 'vscode';
import { printErrorMessageInOutput } from '../state/state';
import { Command } from './shared/command';

export class FavouritesFiltersCommand implements Command {
  public id = 'jira-plugin.favouritesFilters';

  public async run(): Promise<void> {
    try {
      vscode.window.showInformationMessage('FavouritesFiltersCommand');
    } catch (err) {
      printErrorMessageInOutput(err);
    }
  }

  dispose(): void {}
}
