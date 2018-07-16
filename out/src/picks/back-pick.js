"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../shared/constants");
class BackPick {
    get label() {
        return constants_1.BACK_PICK_LABEL;
    }
    get description() {
        return `Previous selection`;
    }
    get pickValue() {
        return constants_1.BACK_PICK_LABEL;
    }
}
exports.default = BackPick;
//# sourceMappingURL=back-pick.js.map