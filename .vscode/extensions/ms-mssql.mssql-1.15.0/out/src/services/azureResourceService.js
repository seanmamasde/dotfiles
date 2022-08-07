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
exports.AzureResourceService = void 0;
class AzureResourceService {
    constructor(_azureController, _azureResourceController, _accountStore) {
        this._azureController = _azureController;
        this._azureResourceController = _azureResourceController;
        this._accountStore = _accountStore;
    }
    /**
     * Returns Azure locations for given subscription
     */
    getLocations(session) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._azureController.checkAndRefreshToken(session, this._accountStore);
            return yield this._azureResourceController.getLocations(session);
        });
    }
    /**
     * Returns Azure resource groups for given subscription
     */
    getResourceGroups(session) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._azureController.checkAndRefreshToken(session, this._accountStore);
            return yield this._azureResourceController.getResourceGroups(session);
        });
    }
    /**
     * Creates or updates a Azure SQL server for given subscription, resource group and location
     */
    createOrUpdateServer(session, resourceGroupName, serverName, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._azureController.checkAndRefreshToken(session, this._accountStore);
            return yield this._azureResourceController.createOrUpdateServer(session.subscription.subscriptionId, resourceGroupName, serverName, parameters, session.token);
        });
    }
}
exports.AzureResourceService = AzureResourceService;

//# sourceMappingURL=azureResourceService.js.map
