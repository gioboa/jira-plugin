"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const decko_1 = require("decko");
const vscode = require("vscode");
const configuration_1 = require("../shared/configuration");
const constants_1 = require("../shared/constants");
const utils_1 = require("../shared/utils");
class SetupCredentialsCommand {
    constructor() {
        this.id = 'jira-plugin.setupCredentialsCommand';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const baseUrl = configuration_1.getConfigurationByKey(constants_1.CONFIG.BASE_URL);
            if (baseUrl) {
                const res = yield vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Config already exist. Reset config?' });
                if (res === 'No') {
                    return;
                }
            }
            configuration_1.setConfigurationByKey(constants_1.CONFIG.BASE_URL, yield vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Your JIRA url' }));
            configuration_1.setConfigurationByKey(constants_1.CONFIG.USERNAME, yield vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Your JIRA username' }));
            configuration_1.setGlobalStateConfiguration(yield vscode.window.showInputBox({ ignoreFocusOut: true, password: true, placeHolder: 'Your JIRA password' }));
            utils_1.executeConnectionToJira();
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupCredentialsCommand.prototype, "run", null);
exports.SetupCredentialsCommand = SetupCredentialsCommand;
//# sourceMappingURL=setup-credentials.js.map