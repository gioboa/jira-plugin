import * as vscode from 'vscode';
import { getConfiguration } from './configuration';

export class IssueLinkProvider implements vscode.DocumentLinkProvider {
  private get baseUrl(): string | undefined {
    return getConfiguration().baseUrl;
  }

  private get projectNames(): string[] {
    return getConfiguration().projectNames.split(',');
  }

  public provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
    const baseUrl = this.baseUrl || '';
    return document
      .getText()
      .split('\n')
      .reduce((matches, line, no) => this.getMatchesOnLine(baseUrl, line, no, this.projectNames, matches), [] as vscode.DocumentLink[]);
  }

  private getMatchesOnLine(baseUrl: string, line: string, lineNo: number, projectNames: string[], matches: vscode.DocumentLink[]): vscode.DocumentLink[] {
    projectNames.forEach(projectName => {
      const expr = new RegExp(`${projectName}-\\d+`, 'gi');
      let match;
      while (true) {
        match = expr.exec(line);
        if (match === null) {
          break;
        }
        const range = new vscode.Range(new vscode.Position(lineNo, match.index), new vscode.Position(lineNo, match.index + match[0].length));
        matches.push({
          range,
          target: vscode.Uri.parse(`${baseUrl}/browse/${match[0]}`)
        });
      }
    });
    return matches;
  }
}
