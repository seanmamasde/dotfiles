"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
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
exports.domHtmlFragmentProcessor = exports.HtmlKernel = void 0;
const contracts = require("./contracts");
const kernel_1 = require("./kernel");
const promiseCompletionSource_1 = require("./promiseCompletionSource");
class HtmlKernel extends kernel_1.Kernel {
    constructor(kernelName, htmlFragmentProcessor, languageName, languageVersion) {
        super(kernelName !== null && kernelName !== void 0 ? kernelName : "html", languageName !== null && languageName !== void 0 ? languageName : "HTML");
        this.htmlFragmentProcessor = htmlFragmentProcessor;
        if (!this.htmlFragmentProcessor) {
            this.htmlFragmentProcessor = domHtmlFragmentProcessor;
        }
        this.registerCommandHandler({ commandType: contracts.SubmitCodeType, handle: invocation => this.handleSubmitCode(invocation) });
    }
    handleSubmitCode(invocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const submitCode = invocation.commandEnvelope.command;
            const code = submitCode.code;
            invocation.context.publish({ eventType: contracts.CodeSubmissionReceivedType, event: { code }, command: invocation.commandEnvelope });
            if (!this.htmlFragmentProcessor) {
                throw new Error("No HTML fragment processor registered");
            }
            try {
                yield this.htmlFragmentProcessor(code);
            }
            catch (e) {
                throw e; //?
            }
        });
    }
}
exports.HtmlKernel = HtmlKernel;
function domHtmlFragmentProcessor(htmlFragment, configuration) {
    var _a, _b, _c, _d;
    const factory = (_a = configuration === null || configuration === void 0 ? void 0 : configuration.containerFactory) !== null && _a !== void 0 ? _a : (() => document.createElement("div"));
    const elementToObserve = (_b = configuration === null || configuration === void 0 ? void 0 : configuration.elementToObserve) !== null && _b !== void 0 ? _b : (() => document.body);
    const addToDom = (_c = configuration === null || configuration === void 0 ? void 0 : configuration.addToDom) !== null && _c !== void 0 ? _c : ((element) => document.body.appendChild(element));
    const mutationObserverFactory = (_d = configuration === null || configuration === void 0 ? void 0 : configuration.mutationObserverFactory) !== null && _d !== void 0 ? _d : (callback => new MutationObserver(callback));
    let container = factory();
    if (!container.id) {
        container.id = "html_kernel_container" + Math.floor(Math.random() * 1000000);
    }
    container.innerHTML = htmlFragment;
    const completionPromise = new promiseCompletionSource_1.PromiseCompletionSource();
    const mutationObserver = mutationObserverFactory((mutations, observer) => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                const nodes = Array.from(mutation.addedNodes);
                for (const addedNode of nodes) {
                    const element = addedNode;
                    element.id; //?
                    container.id; //?
                    if ((element === null || element === void 0 ? void 0 : element.id) === container.id) { //?
                        completionPromise.resolve();
                        mutationObserver.disconnect();
                        return;
                    }
                }
            }
        }
    });
    mutationObserver.observe(elementToObserve(), { childList: true, subtree: true });
    addToDom(container);
    return completionPromise.promise;
}
exports.domHtmlFragmentProcessor = domHtmlFragmentProcessor;
//# sourceMappingURL=htmlKernel.js.map