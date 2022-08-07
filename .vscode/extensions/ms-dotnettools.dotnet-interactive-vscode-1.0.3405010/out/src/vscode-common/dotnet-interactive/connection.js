"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryAddUriToRoutingSlip = exports.isArrayOfString = exports.isSetOfString = exports.KernelCommandAndEventSender = exports.KernelCommandAndEventReceiver = exports.isKernelEventEnvelope = exports.isKernelCommandEnvelope = void 0;
const rxjs = require("rxjs");
function isKernelCommandEnvelope(commandOrEvent) {
    return commandOrEvent.commandType !== undefined;
}
exports.isKernelCommandEnvelope = isKernelCommandEnvelope;
function isKernelEventEnvelope(commandOrEvent) {
    return commandOrEvent.eventType !== undefined;
}
exports.isKernelEventEnvelope = isKernelEventEnvelope;
class KernelCommandAndEventReceiver {
    constructor(observer) {
        this._disposables = [];
        this._observable = observer;
    }
    subscribe(observer) {
        return this._observable.subscribe(observer);
    }
    dispose() {
        for (let disposable of this._disposables) {
            disposable.dispose();
        }
    }
    static FromObservable(observable) {
        return new KernelCommandAndEventReceiver(observable);
    }
    static FromEventListener(args) {
        let subject = new rxjs.Subject();
        args.eventTarget.addEventListener(args.event, (e) => {
            let mapped = args.map(e);
            subject.next(mapped);
        });
        return new KernelCommandAndEventReceiver(subject);
    }
}
exports.KernelCommandAndEventReceiver = KernelCommandAndEventReceiver;
function isObservable(source) {
    return source.next !== undefined;
}
class KernelCommandAndEventSender {
    constructor(remoteHostUri) {
        this._remoteHostUri = remoteHostUri;
    }
    send(kernelCommandOrEventEnvelope) {
        if (this._sender) {
            try {
                if (typeof this._sender === "function") {
                    this._sender(kernelCommandOrEventEnvelope);
                }
                else if (isObservable(this._sender)) {
                    this._sender.next(kernelCommandOrEventEnvelope);
                }
                else {
                    return Promise.reject(new Error("Sender is not set"));
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
            return Promise.resolve();
        }
        return Promise.reject(new Error("Sender is not set"));
    }
    get remoteHostUri() {
        return this._remoteHostUri;
    }
    static FromObserver(observer) {
        const sender = new KernelCommandAndEventSender("");
        sender._sender = observer;
        return sender;
    }
    static FromFunction(send) {
        const sender = new KernelCommandAndEventSender("");
        sender._sender = send;
        return sender;
    }
}
exports.KernelCommandAndEventSender = KernelCommandAndEventSender;
function isSetOfString(collection) {
    return typeof (collection) !== typeof (new Set());
}
exports.isSetOfString = isSetOfString;
function isArrayOfString(collection) {
    return Array.isArray(collection) && collection.length > 0 && typeof (collection[0]) === typeof ("");
}
exports.isArrayOfString = isArrayOfString;
function tryAddUriToRoutingSlip(kernelCommandOrEventEnvelope, kernelUri) {
    if (kernelCommandOrEventEnvelope.routingSlip === undefined || kernelCommandOrEventEnvelope.routingSlip === null) {
        kernelCommandOrEventEnvelope.routingSlip = [];
    }
    var canAdd = !kernelCommandOrEventEnvelope.routingSlip.find(e => e === kernelUri);
    if (canAdd) {
        kernelCommandOrEventEnvelope.routingSlip.push(kernelUri);
        kernelCommandOrEventEnvelope.routingSlip; //?
    }
    return canAdd;
}
exports.tryAddUriToRoutingSlip = tryAddUriToRoutingSlip;
//# sourceMappingURL=connection.js.map