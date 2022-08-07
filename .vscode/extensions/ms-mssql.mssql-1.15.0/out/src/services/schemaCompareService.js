"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaCompareService = void 0;
const schemaCompareContracts = require("../models/contracts/schemaCompare/schemaCompareContracts");
class SchemaCompareService {
    constructor(_client) {
        this._client = _client;
    }
    schemaCompareGetDefaultOptions() {
        const params = {};
        return this._client.sendRequest(schemaCompareContracts.SchemaCompareGetDefaultOptionsRequest.type, params);
    }
}
exports.SchemaCompareService = SchemaCompareService;

//# sourceMappingURL=schemaCompareService.js.map
