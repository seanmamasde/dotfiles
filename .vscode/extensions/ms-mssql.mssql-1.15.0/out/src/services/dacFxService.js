"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DacFxService = void 0;
const dacFxContracts = require("../models/contracts/dacFx/dacFxContracts");
class DacFxService {
    constructor(_client) {
        this._client = _client;
    }
    exportBacpac(databaseName, packageFilePath, ownerUri, taskExecutionMode) {
        const params = {
            databaseName: databaseName,
            packageFilePath: packageFilePath,
            ownerUri: ownerUri,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.ExportRequest.type, params);
    }
    importBacpac(packageFilePath, databaseName, ownerUri, taskExecutionMode) {
        const params = {
            packageFilePath: packageFilePath,
            databaseName: databaseName,
            ownerUri: ownerUri,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.ImportRequest.type, params);
    }
    extractDacpac(databaseName, packageFilePath, applicationName, applicationVersion, ownerUri, taskExecutionMode) {
        const params = {
            databaseName: databaseName,
            packageFilePath: packageFilePath,
            applicationName: applicationName,
            applicationVersion: applicationVersion,
            ownerUri: ownerUri,
            extractTarget: 0 /* dacpac */,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.ExtractRequest.type, params);
    }
    createProjectFromDatabase(databaseName, targetFilePath, applicationName, applicationVersion, ownerUri, extractTarget, taskExecutionMode) {
        const params = {
            databaseName: databaseName,
            packageFilePath: targetFilePath,
            applicationName: applicationName,
            applicationVersion: applicationVersion,
            ownerUri: ownerUri,
            extractTarget: extractTarget,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.ExtractRequest.type, params);
    }
    deployDacpac(packageFilePath, targetDatabaseName, upgradeExisting, ownerUri, taskExecutionMode, sqlCommandVariableValues, deploymentOptions) {
        const params = {
            packageFilePath: packageFilePath,
            databaseName: targetDatabaseName,
            upgradeExisting: upgradeExisting,
            sqlCommandVariableValues: sqlCommandVariableValues,
            deploymentOptions: deploymentOptions,
            ownerUri: ownerUri,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.DeployRequest.type, params);
    }
    generateDeployScript(packageFilePath, targetDatabaseName, ownerUri, taskExecutionMode, sqlCommandVariableValues, deploymentOptions) {
        const params = {
            packageFilePath: packageFilePath,
            databaseName: targetDatabaseName,
            sqlCommandVariableValues: sqlCommandVariableValues,
            deploymentOptions: deploymentOptions,
            ownerUri: ownerUri,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.GenerateDeployScriptRequest.type, params);
    }
    generateDeployPlan(packageFilePath, targetDatabaseName, ownerUri, taskExecutionMode) {
        const params = {
            packageFilePath: packageFilePath,
            databaseName: targetDatabaseName,
            ownerUri: ownerUri,
            taskExecutionMode: taskExecutionMode
        };
        return this._client.sendRequest(dacFxContracts.GenerateDeployPlanRequest.type, params);
    }
    getOptionsFromProfile(profilePath) {
        const params = { profilePath: profilePath };
        return this._client.sendRequest(dacFxContracts.GetOptionsFromProfileRequest.type, params);
    }
    validateStreamingJob(packageFilePath, createStreamingJobTsql) {
        const params = {
            packageFilePath: packageFilePath,
            createStreamingJobTsql: createStreamingJobTsql
        };
        return this._client.sendRequest(dacFxContracts.ValidateStreamingJobRequest.type, params);
    }
}
exports.DacFxService = DacFxService;

//# sourceMappingURL=dacFxService.js.map
