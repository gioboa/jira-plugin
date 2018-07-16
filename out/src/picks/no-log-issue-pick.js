"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../shared/constants");
class NoIssueLoggingPick {
    get label() {
        return `$(x) ${constants_1.NO_ISSUE_LOGGING.text}`;
    }
    get description() {
        return '';
    }
    get pickValue() {
        return {
            id: '',
            key: constants_1.NO_ISSUE_LOGGING.key,
            fields: {
                summary: '',
                status: {
                    name: ''
                }
            }
        };
    }
}
exports.default = NoIssueLoggingPick;
//# sourceMappingURL=no-log-issue-pick.js.map