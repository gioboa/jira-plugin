import * as vscode from 'vscode';
import { IProject } from '../services/http.model';
import '../services';
import { configuration } from '../services';
import { CONFIG } from './constants';

export class IssueLinkProvider implements vscode.DocumentLinkProvider {
  constructor(private projects: IProject[]) {}

  private get baseUrl(): string | undefined {
    return configuration.get(CONFIG.BASE_URL);
  }

  public provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
    const baseUrl = this.baseUrl;
    if (!baseUrl || !this.projects) {
      return null;
    }
    return document
      .getText()
      .split('\n')
      .reduce((matches, line, no) => this.getMatchesOnLine(baseUrl, line, no, matches), [] as vscode.DocumentLink[]);
  }

  private getMatchesOnLine(baseUrl: string, line: string, lineNo: number, matches: vscode.DocumentLink[]): vscode.DocumentLink[] {
    this.projects.forEach(project => {
      const expr = new RegExp(`${project.key}-\\d+`, 'gi');
      let match;
      while (true) {
        match = expr.exec(line);
        if (match === null) {
          break;
        }
        const range = new vscode.Range(
          new vscode.Position(lineNo, match.index),
          new vscode.Position(lineNo, match.index + match[0].length)
        );
        matches.push({
          range,
          target: vscode.Uri.parse(`${baseUrl}/browse/${match[0]}`)
        });
      }
    });
    return matches;
  }
}
