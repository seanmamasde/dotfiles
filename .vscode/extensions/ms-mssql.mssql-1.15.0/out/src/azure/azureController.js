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
exports.AzureController = void 0;
const vscode = require("vscode");
const LocalizedConstants = require("../constants/localizedConstants");
const azureStringLookup_1 = require("../azure/azureStringLookup");
const azureUserInteraction_1 = require("../azure/azureUserInteraction");
const azureErrorLookup_1 = require("../azure/azureErrorLookup");
const azureMessageDisplayer_1 = require("./azureMessageDisplayer");
const azureLogger_1 = require("../azure/azureLogger");
const azureAuthRequest_1 = require("./azureAuthRequest");
const cacheService_1 = require("./cacheService");
const path = require("path");
const os = require("os");
const fs_1 = require("fs");
const credentialstore_1 = require("../credentialstore/credentialstore");
const utils = require("../models/utils");
const ads_adal_library_1 = require("@microsoft/ads-adal-library");
const providerSettings_1 = require("../azure/providerSettings");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
const question_1 = require("../prompts/question");
const azureUtils = require("./utils");
function getAppDataPath() {
    let platform = process.platform;
    switch (platform) {
        case 'win32': return process.env['APPDATA'] || path.join(process.env['USERPROFILE'], 'AppData', 'Roaming');
        case 'darwin': return path.join(os.homedir(), 'Library', 'Application Support');
        case 'linux': return process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
        default: throw new Error('Platform not supported');
    }
}
function getDefaultLogLocation() {
    return path.join(getAppDataPath(), 'vscode-mssql');
}
function findOrMakeStoragePath() {
    return __awaiter(this, void 0, void 0, function* () {
        let defaultLogLocation = getDefaultLogLocation();
        let storagePath = path.join(defaultLogLocation, 'AAD');
        try {
            yield fs_1.promises.mkdir(defaultLogLocation, { recursive: true });
        }
        catch (e) {
            if (e.code !== 'EEXIST') {
                console.log(`Creating the base directory failed... ${e}`);
                return undefined;
            }
        }
        try {
            yield fs_1.promises.mkdir(storagePath, { recursive: true });
        }
        catch (e) {
            if (e.code !== 'EEXIST') {
                console.error(`Initialization of vscode-mssql storage failed: ${e}`);
                console.error('Azure accounts will not be available');
                return undefined;
            }
        }
        console.log('Initialized vscode-mssql storage.');
        return storagePath;
    });
}
class AzureController {
    constructor(context, prompter, logger, _subscriptionClientFactory = azureUtils.defaultSubscriptionClientFactory) {
        this._subscriptionClientFactory = _subscriptionClientFactory;
        this.credentialStoreInitialized = false;
        this.context = context;
        this.prompter = prompter;
        if (!this.logger) {
            this.logger = new azureLogger_1.AzureLogger();
        }
        if (!this._vscodeWrapper) {
            this._vscodeWrapper = new vscodeWrapper_1.default();
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.authRequest = new azureAuthRequest_1.AzureAuthRequest(this.context, this.logger);
            yield this.authRequest.startServer();
            this.azureStringLookup = new azureStringLookup_1.AzureStringLookup();
            this.azureUserInteraction = new azureUserInteraction_1.AzureUserInteraction(this.authRequest.getState());
            this.azureErrorLookup = new azureErrorLookup_1.AzureErrorLookup();
            this.azureMessageDisplayer = new azureMessageDisplayer_1.AzureMessageDisplayer();
        });
    }
    promptForTenantChoice(account, profile) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let tenantChoices = (_a = account.properties.tenants) === null || _a === void 0 ? void 0 : _a.map(t => ({ name: t.displayName, value: t }));
            if (tenantChoices && tenantChoices.length === 1) {
                profile.tenantId = tenantChoices[0].value.id;
                return;
            }
            let tenantQuestion = {
                type: question_1.QuestionTypes.expand,
                name: LocalizedConstants.tenant,
                message: LocalizedConstants.azureChooseTenant,
                choices: tenantChoices,
                shouldPrompt: (answers) => profile.isAzureActiveDirectory() && tenantChoices.length > 1,
                onAnswered: (value) => {
                    profile.tenantId = value.id;
                }
            };
            yield this.prompter.promptSingle(tenantQuestion, true);
        });
    }
    addAccount(accountStore) {
        return __awaiter(this, void 0, void 0, function* () {
            let account;
            let config = vscode.workspace.getConfiguration('mssql').get('azureActiveDirectory');
            if (config === utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.AuthCodeGrant)) {
                let azureCodeGrant = yield this.createAuthCodeGrant();
                account = yield azureCodeGrant.startLogin();
                yield accountStore.addAccount(account);
            }
            else if (config === utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.DeviceCode)) {
                let azureDeviceCode = yield this.createDeviceCode();
                account = yield azureDeviceCode.startLogin();
                yield accountStore.addAccount(account);
            }
            return account;
        });
    }
    getAccountSecurityToken(account, tenantId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let token;
            let config = vscode.workspace.getConfiguration('mssql').get('azureActiveDirectory');
            if (config === utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.AuthCodeGrant)) {
                let azureCodeGrant = yield this.createAuthCodeGrant();
                tenantId = tenantId ? tenantId : azureCodeGrant.getHomeTenant(account).id;
                token = yield azureCodeGrant.getAccountSecurityToken(account, tenantId, settings);
            }
            else if (config === utils.azureAuthTypeToString(ads_adal_library_1.AzureAuthType.DeviceCode)) {
                let azureDeviceCode = yield this.createDeviceCode();
                tenantId = tenantId ? tenantId : azureDeviceCode.getHomeTenant(account).id;
                token = yield azureDeviceCode.getAccountSecurityToken(account, tenantId, settings);
            }
            return token;
        });
    }
    /**
     * Gets the token for given account and updates the connection profile with token information needed for AAD authentication
     */
    populateAccountProperties(profile, accountStore, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield this.addAccount(accountStore);
            if (!profile.tenantId) {
                yield this.promptForTenantChoice(account, profile);
            }
            const token = yield this.getAccountSecurityToken(account, profile.tenantId, settings);
            if (!token) {
                let errorMessage = LocalizedConstants.msgGetTokenFail;
                this._vscodeWrapper.showErrorMessage(errorMessage);
            }
            else {
                profile.azureAccountToken = token.token;
                profile.expiresOn = token.expiresOn;
                profile.email = account.displayInfo.email;
                profile.accountId = account.key.id;
            }
            return profile;
        });
    }
    refreshTokenWrapper(profile, accountStore, accountAnswer, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = accountStore.getAccount(accountAnswer.key.id);
            if (!account) {
                yield this._vscodeWrapper.showErrorMessage(LocalizedConstants.msgAccountNotFound);
                throw new Error(LocalizedConstants.msgAccountNotFound);
            }
            let azureAccountToken = yield this.refreshToken(account, accountStore, settings, profile.tenantId);
            if (!azureAccountToken) {
                let errorMessage = LocalizedConstants.msgAccountRefreshFailed;
                return this._vscodeWrapper.showErrorMessage(errorMessage, LocalizedConstants.refreshTokenLabel).then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (result === LocalizedConstants.refreshTokenLabel) {
                        let refreshedProfile = yield this.populateAccountProperties(profile, accountStore, settings);
                        return refreshedProfile;
                    }
                    else {
                        return undefined;
                    }
                }));
            }
            profile.azureAccountToken = azureAccountToken.token;
            profile.expiresOn = azureAccountToken.expiresOn;
            profile.email = account.displayInfo.email;
            profile.accountId = account.key.id;
            return profile;
        });
    }
    refreshToken(account, accountStore, settings, tenantId = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let token;
                if (account.properties.azureAuthType === 0) {
                    // Auth Code Grant
                    let azureCodeGrant = yield this.createAuthCodeGrant();
                    let newAccount = yield azureCodeGrant.refreshAccess(account);
                    if (newAccount.isStale === true) {
                        return undefined;
                    }
                    yield accountStore.addAccount(newAccount);
                    token = yield this.getAccountSecurityToken(account, tenantId, settings);
                }
                else if (account.properties.azureAuthType === 1) {
                    // Auth Device Code
                    let azureDeviceCode = yield this.createDeviceCode();
                    let newAccount = yield azureDeviceCode.refreshAccess(account);
                    yield accountStore.addAccount(newAccount);
                    if (newAccount.isStale === true) {
                        return undefined;
                    }
                    token = yield this.getAccountSecurityToken(account, tenantId, settings);
                }
                return token;
            }
            catch (ex) {
                let errorMsg = this.azureErrorLookup.getSimpleError(ex.errorCode);
                this._vscodeWrapper.showErrorMessage(errorMsg);
            }
        });
    }
    /**
     * Returns Azure sessions with subscriptions, tenant and token for each given account
     */
    getAccountSessions(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let sessions = [];
            const tenants = account.properties.tenants;
            for (const tenantId of tenants.map(t => t.id)) {
                const token = yield this.getAccountSecurityToken(account, tenantId, providerSettings_1.default.resources.azureManagementResource);
                const subClient = this._subscriptionClientFactory(token);
                const newSubPages = yield subClient.subscriptions.list();
                const array = yield azureUtils.getAllValues(newSubPages, (nextSub) => {
                    return {
                        subscription: nextSub,
                        tenantId: tenantId,
                        account: account,
                        token: token
                    };
                });
                sessions = sessions.concat(array);
            }
            return sessions.sort((a, b) => (a.subscription.displayName || '').localeCompare(b.subscription.displayName || ''));
        });
    }
    createAuthCodeGrant() {
        return __awaiter(this, void 0, void 0, function* () {
            let azureLogger = new azureLogger_1.AzureLogger();
            yield this.initializeCredentialStore();
            return new ads_adal_library_1.AzureCodeGrant(providerSettings_1.default, this.storageService, this.cacheService, azureLogger, this.azureMessageDisplayer, this.azureErrorLookup, this.azureUserInteraction, this.azureStringLookup, this.authRequest);
        });
    }
    createDeviceCode() {
        return __awaiter(this, void 0, void 0, function* () {
            let azureLogger = new azureLogger_1.AzureLogger();
            yield this.initializeCredentialStore();
            return new ads_adal_library_1.AzureDeviceCode(providerSettings_1.default, this.storageService, this.cacheService, azureLogger, this.azureMessageDisplayer, this.azureErrorLookup, this.azureUserInteraction, this.azureStringLookup, this.authRequest);
        });
    }
    removeToken(account) {
        return __awaiter(this, void 0, void 0, function* () {
            let azureAuth = yield this.createAuthCodeGrant();
            yield azureAuth.deleteAccountCache(account.key);
            return;
        });
    }
    /**
     * Checks if this.init() has already been called, initializes the credential store (should only be called once)
     */
    initializeCredentialStore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.credentialStoreInitialized) {
                let storagePath = yield findOrMakeStoragePath();
                let credentialStore = new credentialstore_1.CredentialStore(this.context);
                this.cacheService = new cacheService_1.SimpleTokenCache('aad', storagePath, true, credentialStore);
                yield this.cacheService.init();
                this.storageService = this.cacheService.db;
                this.credentialStoreInitialized = true;
            }
        });
    }
    /**
     * Verifies if the token still valid, refreshes the token for given account
     * @param session
     */
    checkAndRefreshToken(session, accountStore) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (session.account && AzureController.isTokenInValid((_a = session.token) === null || _a === void 0 ? void 0 : _a.token, session.token.expiresOn)) {
                const token = yield this.refreshToken(session.account, accountStore, providerSettings_1.default.resources.azureManagementResource);
                session.token = token;
            }
        });
    }
    /**
     * Returns true if token is invalid or expired
     * @param token Token
     * @param token expiry
     */
    static isTokenInValid(token, expiresOn) {
        return (!token || this.isTokenExpired(expiresOn));
    }
    /**
     * Returns true if token is expired
     * @param token expiry
     */
    static isTokenExpired(expiresOn) {
        if (!expiresOn) {
            return true;
        }
        const currentTime = new Date().getTime() / 1000;
        const maxTolerance = 2 * 60; // two minutes
        return (expiresOn - currentTime < maxTolerance);
    }
}
exports.AzureController = AzureController;

//# sourceMappingURL=azureController.js.map
