"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../shared/constants");
const utilities_1 = require("../../shared/utilities");
class IssueItem extends vscode.TreeItem {
    constructor(issue, command) {
        super(`${issue.key} - ${issue.fields.summary}`, vscode.TreeItemCollapsibleState.None);
        this.issue = issue;
        this.command = command;
        this.iconPath = {
            light: utilities_1.getIconsPath(`light/${this.icon(this.issue.fields.status.name)}`),
            dark: utilities_1.getIconsPath(`dark/${this.icon(this.issue.fields.status.name)}`)
        };
        this.contextValue = 'IssueItem';
    }
    get tooltip() {
        return `(${this.issue.fields.status.name}) ${this.label}`;
    }
    icon(status) {
        let icon = constants_1.STATUS_ICONS.DEFAULT.file;
        if (!!status) {
            Object.values(constants_1.STATUS_ICONS).forEach(value => {
                if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
                    icon = value.file;
                }
            });
        }
        return icon;
    }
}
exports.IssueItem = IssueItem;
//# sourceMappingURL=issue-item 2.js.map