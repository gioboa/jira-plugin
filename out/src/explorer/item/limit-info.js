"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../shared/constants");
const utilities_1 = require("../../shared/utilities");
class LimitInfoItem extends vscode.TreeItem {
    constructor() {
        super(`Viewable rows maximum has been reached. Modify filters to narrow search`, vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: utilities_1.getIconsPath(`light/${constants_1.STATUS_ICONS.DEFAULT.file}`),
            dark: utilities_1.getIconsPath(`dark/${constants_1.STATUS_ICONS.DEFAULT.file}`)
        };
        this.contextValue = 'LimitInfoItem';
    }
    get tooltip() {
        return this.label || '';
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
exports.LimitInfoItem = LimitInfoItem;
//# sourceMappingURL=limit-info.js.map