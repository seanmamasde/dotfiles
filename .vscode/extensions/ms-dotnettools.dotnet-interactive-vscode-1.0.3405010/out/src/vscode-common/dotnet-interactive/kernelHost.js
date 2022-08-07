"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelHost = void 0;
const contracts = require("./contracts");
const connection = require("./connection");
const proxyKernel_1 = require("./proxyKernel");
const logger_1 = require("./logger");
const kernelScheduler_1 = require("./kernelScheduler");
class KernelHost {
    constructor(kernel, sender, receiver, hostUri) {
        this._remoteUriToKernel = new Map();
        this._uriToKernel = new Map();
        this._kernelToKernelInfo = new Map();
        this._kernel = kernel;
        this._uri = hostUri || "kernel://vscode";
        this._kernel.host = this;
        this._scheduler = new kernelScheduler_1.KernelScheduler();
        this._defaultSender = sender;
        this._defaultReceiver = receiver;
    }
    get uri() {
        return this._uri;
    }
    tryGetKernelByRemoteUri(remoteUri) {
        return this._remoteUriToKernel.get(remoteUri);
    }
    trygetKernelByOriginUri(originUri) {
        return this._uriToKernel.get(originUri);
    }
    tryGetKernelInfo(kernel) {
        return this._kernelToKernelInfo.get(kernel);
    }
    addKernelInfo(kernel, kernelInfo) {
        kernelInfo.uri = `${this._uri}/${kernel.name}`; //?
        this._kernelToKernelInfo.set(kernel, kernelInfo);
        this._uriToKernel.set(kernelInfo.uri, kernel);
    }
    getKernel(kernelCommandEnvelope) {
        if (kernelCommandEnvelope.command.destinationUri) {
            let fromDestinationUri = this._uriToKernel.get(kernelCommandEnvelope.command.destinationUri.toLowerCase());
            if (fromDestinationUri) {
                logger_1.Logger.default.info(`Kernel ${fromDestinationUri.name} found for destination uri ${kernelCommandEnvelope.command.destinationUri}`);
                return fromDestinationUri;
            }
            fromDestinationUri = this._remoteUriToKernel.get(kernelCommandEnvelope.command.destinationUri.toLowerCase());
            if (fromDestinationUri) {
                logger_1.Logger.default.info(`Kernel ${fromDestinationUri.name} found for destination uri ${kernelCommandEnvelope.command.destinationUri}`);
                return fromDestinationUri;
            }
        }
        if (kernelCommandEnvelope.command.originUri) {
            let fromOriginUri = this._uriToKernel.get(kernelCommandEnvelope.command.originUri.toLowerCase());
            if (fromOriginUri) {
                logger_1.Logger.default.info(`Kernel ${fromOriginUri.name} found for origin uri ${kernelCommandEnvelope.command.originUri}`);
                return fromOriginUri;
            }
        }
        logger_1.Logger.default.info(`Using Kernel ${this._kernel.name}`);
        return this._kernel;
    }
    connectProxyKernelOnDefaultConnector(localName, remoteKernelUri, aliases) {
        return this.connectProxyKernelOnConnector(localName, this._defaultSender, this._defaultReceiver, remoteKernelUri, aliases);
    }
    connectProxyKernelOnConnector(localName, sender, receiver, remoteKernelUri, aliases) {
        let kernel = new proxyKernel_1.ProxyKernel(localName, sender, receiver);
        kernel.kernelInfo.remoteUri = remoteKernelUri;
        this._kernel.add(kernel, aliases);
        return kernel;
    }
    connect() {
        this._kernel.subscribeToKernelEvents(e => {
            this._defaultSender.send(e);
        });
        this._defaultReceiver.subscribe({
            next: (kernelCommandOrEventEnvelope) => {
                if (connection.isKernelCommandEnvelope(kernelCommandOrEventEnvelope)) {
                    this._scheduler.runAsync(kernelCommandOrEventEnvelope, commandEnvelope => {
                        const kernel = this._kernel;
                        ;
                        return kernel.send(commandEnvelope);
                    });
                }
            }
        });
        this._defaultSender.send({ eventType: contracts.KernelReadyType, event: {} });
        this._defaultSender.send({ eventType: contracts.KernelInfoProducedType, event: { kernelInfo: this._kernel.kernelInfo } });
        for (let kernel of this._kernel.childKernels) {
            this._defaultSender.send({ eventType: contracts.KernelInfoProducedType, event: { kernelInfo: kernel.kernelInfo } });
        }
    }
}
exports.KernelHost = KernelHost;
//# sourceMappingURL=kernelHost.js.map