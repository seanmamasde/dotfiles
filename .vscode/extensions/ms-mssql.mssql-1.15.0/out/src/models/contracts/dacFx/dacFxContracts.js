"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateStreamingJobRequest = exports.GetOptionsFromProfileRequest = exports.GenerateDeployPlanRequest = exports.GenerateDeployScriptRequest = exports.DeployRequest = exports.ExtractRequest = exports.ImportRequest = exports.ExportRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var ExportRequest;
(function (ExportRequest) {
    ExportRequest.type = new vscode_languageclient_1.RequestType('dacfx/export');
})(ExportRequest = exports.ExportRequest || (exports.ExportRequest = {}));
var ImportRequest;
(function (ImportRequest) {
    ImportRequest.type = new vscode_languageclient_1.RequestType('dacfx/import');
})(ImportRequest = exports.ImportRequest || (exports.ImportRequest = {}));
var ExtractRequest;
(function (ExtractRequest) {
    ExtractRequest.type = new vscode_languageclient_1.RequestType('dacfx/extract');
})(ExtractRequest = exports.ExtractRequest || (exports.ExtractRequest = {}));
var DeployRequest;
(function (DeployRequest) {
    DeployRequest.type = new vscode_languageclient_1.RequestType('dacfx/deploy');
})(DeployRequest = exports.DeployRequest || (exports.DeployRequest = {}));
var GenerateDeployScriptRequest;
(function (GenerateDeployScriptRequest) {
    GenerateDeployScriptRequest.type = new vscode_languageclient_1.RequestType('dacfx/generateDeploymentScript');
})(GenerateDeployScriptRequest = exports.GenerateDeployScriptRequest || (exports.GenerateDeployScriptRequest = {}));
var GenerateDeployPlanRequest;
(function (GenerateDeployPlanRequest) {
    GenerateDeployPlanRequest.type = new vscode_languageclient_1.RequestType('dacfx/generateDeployPlan');
})(GenerateDeployPlanRequest = exports.GenerateDeployPlanRequest || (exports.GenerateDeployPlanRequest = {}));
var GetOptionsFromProfileRequest;
(function (GetOptionsFromProfileRequest) {
    GetOptionsFromProfileRequest.type = new vscode_languageclient_1.RequestType('dacfx/getOptionsFromProfile');
})(GetOptionsFromProfileRequest = exports.GetOptionsFromProfileRequest || (exports.GetOptionsFromProfileRequest = {}));
var ValidateStreamingJobRequest;
(function (ValidateStreamingJobRequest) {
    ValidateStreamingJobRequest.type = new vscode_languageclient_1.RequestType('dacfx/validateStreamingJob');
})(ValidateStreamingJobRequest = exports.ValidateStreamingJobRequest || (exports.ValidateStreamingJobRequest = {}));

//# sourceMappingURL=dacFxContracts.js.map
