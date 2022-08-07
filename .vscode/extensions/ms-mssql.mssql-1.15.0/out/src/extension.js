"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
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
exports.getController = exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const Constants = require("./constants/constants");
const LocalizedConstants = require("./constants/localizedConstants");
const mainController_1 = require("./controllers/mainController");
const vscodeWrapper_1 = require("./controllers/vscodeWrapper");
const protocol_1 = require("./protocol");
const utils = require("./models/utils");
const objectExplorerUtils_1 = require("./objectExplorer/objectExplorerUtils");
const serviceclient_1 = require("./languageservice/serviceclient");
const connectionProfile_1 = require("./models/connectionProfile");
const interfaces_1 = require("./languageservice/interfaces");
let controller = undefined;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let vscodeWrapper = new vscodeWrapper_1.default();
        controller = new mainController_1.default(context, undefined, vscodeWrapper);
        context.subscriptions.push(controller);
        // Checking if localization should be applied
        let config = vscodeWrapper.getConfiguration(Constants.extensionConfigSectionName);
        let applyLocalization = config[Constants.configApplyLocalization];
        if (applyLocalization) {
            LocalizedConstants.loadLocalizedConstants(vscode.env.language);
        }
        // Exposed for testing purposes
        vscode.commands.registerCommand('mssql.getControllerForTests', () => controller);
        yield controller.activate();
        return {
            sqlToolsServicePath: serviceclient_1.default.instance.sqlToolsServicePath,
            promptForConnection: (ignoreFocusOut) => {
                return controller.connectionManager.connectionUI.promptForConnection(ignoreFocusOut);
            },
            connect: (connectionInfo, saveConnection) => __awaiter(this, void 0, void 0, function* () {
                const uri = utils.generateQueryUri().toString();
                const connectionPromise = new protocol_1.Deferred();
                // First wait for initial connection request to succeed
                const requestSucceeded = yield controller.connect(uri, connectionInfo, connectionPromise, saveConnection);
                if (!requestSucceeded) {
                    if (controller.connectionManager.failedUriToFirewallIpMap.has(uri)) {
                        throw new interfaces_1.FirewallRuleError(uri, `Connection request for ${JSON.stringify(connectionInfo)} failed because of invalid firewall rule settings`);
                    }
                    else {
                        throw new Error(`Connection request for ${JSON.stringify(connectionInfo)} failed`);
                    }
                }
                // Next wait for the actual connection to be made
                const connectionSucceeded = yield connectionPromise;
                if (!connectionSucceeded) {
                    throw new Error(`Connection for ${JSON.stringify(connectionInfo)} failed`);
                }
                return uri;
            }),
            listDatabases: (connectionUri) => {
                return controller.connectionManager.listDatabases(connectionUri);
            },
            getDatabaseNameFromTreeNode: (node) => {
                return objectExplorerUtils_1.ObjectExplorerUtils.getDatabaseName(node);
            },
            dacFx: controller.dacFxService,
            schemaCompare: controller.schemaCompareService,
            getConnectionString: (connectionUriOrDetails, includePassword, includeApplicationName) => {
                return controller.connectionManager.getConnectionString(connectionUriOrDetails, includePassword, includeApplicationName);
            },
            promptForFirewallRule: (connectionUri, connectionInfo) => {
                const connectionProfile = new connectionProfile_1.ConnectionProfile(connectionInfo);
                return controller.connectionManager.connectionUI.addFirewallRule(connectionUri, connectionProfile);
            },
            azureAccountService: controller.azureAccountService,
            azureResourceService: controller.azureResourceService,
            createConnectionDetails: (connectionInfo) => {
                return controller.connectionManager.createConnectionDetails(connectionInfo);
            },
            sendRequest: (requestType, params) => __awaiter(this, void 0, void 0, function* () {
                return yield controller.connectionManager.sendRequest(requestType, params);
            })
        };
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (controller) {
            yield controller.deactivate();
            controller.dispose();
        }
    });
}
exports.deactivate = deactivate;
/**
 * Exposed for testing purposes
 */
function getController() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!controller) {
            let savedController = yield vscode.commands.executeCommand('mssql.getControllerForTests');
            return savedController;
        }
        return controller;
    });
}
exports.getController = getController;

//# sourceMappingURL=extension.js.map
