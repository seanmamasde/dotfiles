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
exports.defaultSqlManagementClientFactory = exports.defaultResourceManagementClientFactory = exports.defaultSubscriptionClientFactory = exports.getAllValues = void 0;
const arm_resources_1 = require("@azure/arm-resources");
const arm_sql_1 = require("@azure/arm-sql");
const arm_subscriptions_1 = require("@azure/arm-subscriptions");
const credentialWrapper_1 = require("./credentialWrapper");
/**
 * Helper method to convert azure results that comes as pages to an array
 * @param pages azure resources as pages
 * @param convertor a function to convert a value in page to the expected value to add to array
 * @returns array or Azure resources
 */
function getAllValues(pages, convertor) {
    return __awaiter(this, void 0, void 0, function* () {
        let values = [];
        let newValue = yield pages.next();
        while (!newValue.done) {
            values.push(convertor(newValue.value));
            newValue = yield pages.next();
        }
        return values;
    });
}
exports.getAllValues = getAllValues;
function defaultSubscriptionClientFactory(token) {
    return new arm_subscriptions_1.SubscriptionClient(new credentialWrapper_1.TokenCredentialWrapper(token));
}
exports.defaultSubscriptionClientFactory = defaultSubscriptionClientFactory;
function defaultResourceManagementClientFactory(token, subscriptionId) {
    return new arm_resources_1.ResourceManagementClient(new credentialWrapper_1.TokenCredentialWrapper(token), subscriptionId);
}
exports.defaultResourceManagementClientFactory = defaultResourceManagementClientFactory;
function defaultSqlManagementClientFactory(token, subscriptionId) {
    return new arm_sql_1.SqlManagementClient(new credentialWrapper_1.TokenCredentialWrapper(token), subscriptionId);
}
exports.defaultSqlManagementClientFactory = defaultSqlManagementClientFactory;

//# sourceMappingURL=utils.js.map
