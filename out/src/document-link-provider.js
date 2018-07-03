"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configuration_1 = require("./configuration");
class IssueLinkProvider {
    get baseUrl() {
        return configuration_1.getConfiguration().baseUrl;
    }
    get projectNames() {
        return configuration_1.getConfiguration().projectNames.split(',');
    }
    provideDocumentLinks(document, token) {
        const baseUrl = this.baseUrl || '';
        return document
            .getText()
            .split('\n')
            .reduce((matches, line, no) => this.getMatchesOnLine(baseUrl, line, no, this.projectNames, matches), []);
    }
    getMatchesOnLine(baseUrl, line, lineNo, projectNames, matches) {
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
exports.IssueLinkProvider = IssueLinkProvider;
//# sourceMappingURL=document-link-provider.js.map