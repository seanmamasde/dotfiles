"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenCredentialWrapper = void 0;
/**
 * TokenCredential wrapper to only return the given token.
 * Azure clients usually get a type of credential with a getToken function.
 * Since in mssql extension we get the token differently, we need this wrapper class to just return
 * that token value
 */
class TokenCredentialWrapper {
    constructor(_token) {
        this._token = _token;
    }
    getToken(_, __) {
        return Promise.resolve({
            token: this._token.token,
            expiresOnTimestamp: this._token.expiresOn || 0
        });
    }
}
exports.TokenCredentialWrapper = TokenCredentialWrapper;

//# sourceMappingURL=credentialWrapper.js.map
