"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureAccountService = void 0;
const providerSettings_1 = require("../azure/providerSettings");
class AzureAccountService {
    constructor(_azureController, _accountStore) {
        this._azureController = _azureController;
        this._accountStore = _accountStore;
    }
    addAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._azureController.addAccount(this._accountStore);
        });
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._accountStore.getAccounts();
        });
    }
    getAccountSecurityToken(account, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._azureController.getAccountSecurityToken(account, tenantId, providerSettings_1.default.resources.azureManagementResource);
        });
    }
    /**
     * Returns Azure sessions with subscription, tenant and token for each given account
     */
    getAccountSessions(account) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._azureController.getAccountSessions(account);
        });
    }
}
exports.AzureAccountService = AzureAccountService;

//# sourceMappingURL=azureAccountService.js.map
