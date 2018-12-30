import * as vscode from "vscode";
import { getConfigurationByKey } from "./configuration";
import { CONFIG } from "./constants";

export class IssueLinkProvider implements vscode.DocumentLinkProvider {
  private get baseUrl(): string | undefined {
    return getConfigurationByKey(CONFIG.BASE_URL);
  }

  private get projectName(): string | undefined {
    return getConfigurationByKey(CONFIG.WORKING_PROJECT);
  }

  public provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
    const baseUrl = this.baseUrl;
    const project = this.projectName;

    if (!baseUrl || !project) {
      return null;
    }

    return document
      .getText()
      .split("\n")
      .reduce((matches, line, no) => this.getMatchesOnLine(baseUrl, line, no, project, matches), [] as vscode.DocumentLink[]);
  }

  private getMatchesOnLine(baseUrl: string, line: string, lineNo: number, projectName: string, matches: vscode.DocumentLink[]): vscode.DocumentLink[] {
    const expr = new RegExp(`${projectName}-\\d+`, "gi");
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
    return matches;
  }
}
