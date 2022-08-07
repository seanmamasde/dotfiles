"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashBangConnect = void 0;
const logger_1 = require("./dotnet-interactive/logger");
const dotnet_interactive_1 = require("./dotnet-interactive");
const rxjs = require("rxjs");
function hashBangConnect(clientMapper, messageHandlerMap, controllerPostMessage, documentUri) {
    logger_1.Logger.default.info(`handling #!connect for ${documentUri.toString()}`);
    hashBangConnectPrivate(clientMapper, messageHandlerMap, controllerPostMessage, documentUri);
    clientMapper.onClientCreate((clientUri, _client) => {
        if (clientUri.toString() === documentUri.toString()) {
            logger_1.Logger.default.info(`reconnecting webview kernels for ${documentUri.toString()}`);
            hashBangConnectPrivate(clientMapper, messageHandlerMap, controllerPostMessage, documentUri);
            return Promise.resolve();
        }
    });
}
exports.hashBangConnect = hashBangConnect;
function hashBangConnectPrivate(clientMapper, messageHandlerMap, controllerPostMessage, documentUri) {
    const documentUriString = documentUri.toString();
    let messageHandler = messageHandlerMap.get(documentUriString);
    if (!messageHandler) {
        messageHandler = new rxjs.Subject();
        messageHandlerMap.set(documentUriString, messageHandler);
    }
    const extensionHostToWebviewSender = dotnet_interactive_1.KernelCommandAndEventSender.FromFunction(envelope => {
        controllerPostMessage({ envelope });
    });
    const WebviewToExtensionHostReceiver = dotnet_interactive_1.KernelCommandAndEventReceiver.FromObservable(messageHandler);
    clientMapper.getOrAddClient(documentUri).then(client => {
        client.kernelHost.connectProxyKernelOnConnector('javascript', extensionHostToWebviewSender, WebviewToExtensionHostReceiver, "kernel://webview/javascript", ['js']);
        WebviewToExtensionHostReceiver.subscribe({
            next: envelope => {
                var _a, _b;
                if ((0, dotnet_interactive_1.isKernelCommandEnvelope)(envelope)) {
                    // handle command routing
                    if (envelope.command.destinationUri) {
                        if (envelope.command.destinationUri.startsWith("kernel://vscode")) {
                            // wants to go to vscode
                            logger_1.Logger.default.info(`routing command from webview ${JSON.stringify(envelope)} to extension host`);
                            const kernel = client.kernelHost.getKernel(envelope);
                            kernel.send(envelope);
                        }
                        else if (envelope.command.destinationUri.startsWith("kernel://pid")) {
                            // route to interactive
                            logger_1.Logger.default.info(`routing command from webview ${JSON.stringify(envelope)} to interactive`);
                            client.channel.sender.send(envelope);
                        }
                    }
                    else {
                        const kernel = client.kernelHost.getKernel(envelope);
                        kernel.send(envelope);
                    }
                }
                if ((0, dotnet_interactive_1.isKernelEventEnvelope)(envelope)) {
                    if ((_a = envelope.command) === null || _a === void 0 ? void 0 : _a.command.originUri) {
                        // route to interactive
                        if ((_b = envelope.command) === null || _b === void 0 ? void 0 : _b.command.originUri.startsWith("kernel://pid")) {
                            logger_1.Logger.default.info(`routing event from webview ${JSON.stringify(envelope)} to interactive`);
                            client.channel.sender.send(envelope);
                        }
                    }
                }
            }
        });
        client.channel.receiver.subscribe({
            next: envelope => {
                if ((0, dotnet_interactive_1.isKernelEventEnvelope)(envelope)) {
                    logger_1.Logger.default.info(`forwarding event to webview ${JSON.stringify(envelope)}`);
                    extensionHostToWebviewSender.send(envelope);
                }
            }
        });
    });
}
//# sourceMappingURL=notebookMessageHandler.js.map