"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectExplorerUtils = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const path = require("path");
const treeNodeInfo_1 = require("./treeNodeInfo");
const Constants = require("../constants/constants");
const LocalizedConstants = require("../constants/localizedConstants");
class ObjectExplorerUtils {
    static iconPath(label) {
        if (label) {
            if (label === Constants.disconnectedServerLabel) {
                // if disconnected
                label = `${Constants.serverLabel}_red`;
            }
            else if (label === Constants.serverLabel) {
                // if connected
                label += '_green';
            }
            return path.join(ObjectExplorerUtils.rootPath, `${label}.svg`);
        }
    }
    static getNodeUri(node) {
        let profile;
        if (node instanceof treeNodeInfo_1.TreeNodeInfo) {
            profile = node.connectionInfo;
        }
        else {
            profile = node.parentNode.connectionInfo;
        }
        return ObjectExplorerUtils.getNodeUriFromProfile(profile);
    }
    static getNodeUriFromProfile(profile) {
        let uri;
        if (profile.connectionString) {
            let fields = profile.connectionString.split(';').filter(s => !s.toLowerCase().includes('password'));
            uri = fields.join(';');
            return uri;
        }
        if (profile.authenticationType === Constants.sqlAuthentication) {
            uri = `${profile.server}_${profile.database}_${profile.user}_${profile.profileName}`;
        }
        else {
            uri = `${profile.server}_${profile.database}_${profile.profileName}`;
        }
        return uri;
    }
    /**
     * Gets the database name for the node - which is the database name of the connection for a server node, the database name
     * for nodes at or under a database node or a default value if it's neither of those.
     * @param node The node to get the database name of
     * @returns The database name
     */
    static getDatabaseName(node) {
        // We're on a server node so just use the database directly from the connection string
        if (node.nodeType === Constants.serverLabel ||
            node.nodeType === Constants.disconnectedServerLabel) {
            return node.connectionInfo.database;
        }
        // Otherwise find the name from the node metadata - going up through the parents of the node
        // until we find the database node (so anything under a database node will get the name of
        // the database it's nested in)
        while (node) {
            if (node.metadata) {
                if (node.metadata.metadataTypeName === Constants.databaseString) {
                    return node.metadata.name;
                }
            }
            node = node.parentNode;
        }
        return LocalizedConstants.defaultDatabaseLabel;
    }
    static isFirewallError(errorMessage) {
        return errorMessage.includes(Constants.firewallErrorMessage);
    }
}
exports.ObjectExplorerUtils = ObjectExplorerUtils;
ObjectExplorerUtils.rootPath = path.join(__dirname, 'objectTypes');

//# sourceMappingURL=objectExplorerUtils.js.map
