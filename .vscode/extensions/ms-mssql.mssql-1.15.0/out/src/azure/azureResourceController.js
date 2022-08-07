"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
exports.AzureResourceController = void 0;
const azureUtils = require("./utils");
class AzureResourceController {
    constructor(_subscriptionClientFactory = azureUtils.defaultSubscriptionClientFactory, _resourceManagementClientFactory = azureUtils.defaultResourceManagementClientFactory, _sqlManagementClientFactory = azureUtils.defaultSqlManagementClientFactory) {
        this._subscriptionClientFactory = _subscriptionClientFactory;
        this._resourceManagementClientFactory = _resourceManagementClientFactory;
        this._sqlManagementClientFactory = _sqlManagementClientFactory;
    }
    /**
     * Returns Azure locations for given session
     * @param session Azure session
     * @returns List of locations
     */
    getLocations(session) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const subClient = this._subscriptionClientFactory(session.token);
            if ((_a = session.subscription) === null || _a === void 0 ? void 0 : _a.subscriptionId) {
                const locationsPages = yield subClient.subscriptions.listLocations(session.subscription.subscriptionId);
                let locations = yield azureUtils.getAllValues(locationsPages, (v) => v);
                return locations.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
            else {
                throw new Error('Invalid session');
            }
        });
    }
    /**
     * Creates or updates a Azure SQL server for given subscription, resource group and location
     * @param subscriptionId subscription Id
     * @param resourceGroupName resource group name
     * @param serverName SQL server name
     * @param parameters parameters for the SQL server
     * @returns name of the SQL server
     */
    createOrUpdateServer(subscriptionId, resourceGroupName, serverName, parameters, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (subscriptionId && resourceGroupName) {
                const sqlClient = this._sqlManagementClientFactory(token, subscriptionId);
                if (sqlClient) {
                    const result = yield sqlClient.servers.beginCreateOrUpdateAndWait(resourceGroupName, serverName, parameters);
                    return result.fullyQualifiedDomainName;
                }
            }
            return undefined;
        });
    }
    /**
     * Returns Azure resource groups for given subscription
     * @param session Azure session
     * @returns List of resource groups
     */
    getResourceGroups(session) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = session.subscription) === null || _a === void 0 ? void 0 : _a.subscriptionId) {
                const resourceGroupClient = this._resourceManagementClientFactory(session.token, session.subscription.subscriptionId);
                const newGroupsPages = yield resourceGroupClient.resourceGroups.list();
                let groups = yield azureUtils.getAllValues(newGroupsPages, (v) => v);
                return groups.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
            else {
                throw new Error('Invalid session');
            }
        });
    }
}
exports.AzureResourceController = AzureResourceController;

//# sourceMappingURL=azureResourceController.js.map
