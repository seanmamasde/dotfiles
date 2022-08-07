"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelScheduler = void 0;
const promiseCompletionSource_1 = require("./promiseCompletionSource");
class KernelScheduler {
    constructor() {
        this.operationQueue = [];
    }
    runAsync(value, executor) {
        const operation = {
            value,
            executor,
            promiseCompletionSource: new promiseCompletionSource_1.PromiseCompletionSource(),
        };
        if (this.inFlightOperation) {
            // invoke immediately
            return operation.executor(operation.value)
                .then(() => {
                operation.promiseCompletionSource.resolve();
            })
                .catch(e => {
                operation.promiseCompletionSource.reject(e);
            });
        }
        this.operationQueue.push(operation);
        if (this.operationQueue.length === 1) {
            this.executeNextCommand();
        }
        return operation.promiseCompletionSource.promise;
    }
    executeNextCommand() {
        const nextOperation = this.operationQueue.length > 0 ? this.operationQueue[0] : undefined;
        if (nextOperation) {
            this.inFlightOperation = nextOperation;
            nextOperation.executor(nextOperation.value)
                .then(() => {
                this.inFlightOperation = undefined;
                nextOperation.promiseCompletionSource.resolve();
            })
                .catch(e => {
                this.inFlightOperation = undefined;
                nextOperation.promiseCompletionSource.reject(e);
            })
                .finally(() => {
                this.operationQueue.shift();
                this.executeNextCommand();
            });
        }
    }
}
exports.KernelScheduler = KernelScheduler;
//# sourceMappingURL=kernelScheduler.js.map