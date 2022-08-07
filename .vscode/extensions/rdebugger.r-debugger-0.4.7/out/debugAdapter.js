"use strict";
/*
This file contains an implementation of vscode.Debugadapter.

DAP messages are received via `DebugAdapter.handleMessage` and sent via
`onDidSendMessage`.

Most messages are simply passed to the R pacakge by calling
`this.debugRuntime.dispatchRequest()`, only some requests are modified/handled
in `this.dispatchRequest()`.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugAdapter = void 0;
const debugRuntime_1 = require("./debugRuntime");
const utils_1 = require("./utils");
const logging_1 = require("./logging");
const vscode = require("vscode");
class DebugAdapter {
    constructor(helpPanel, launchConfig) {
        // properties
        this.sendMessage = new vscode.EventEmitter(); // used by onDidSendMessage
        this.sequence = 0; // seq of messages sent to VS Code
        this.THREAD_ID = 1; // dummy value
        this.disconnectTimeout = utils_1.config().get('timeouts.startup', 1000);
        // used to send messages from R to VS Code
        this.onDidSendMessage = this.sendMessage.event;
        // construct R runtime
        this.runtime = new debugRuntime_1.DebugRuntime(helpPanel, launchConfig);
        // setup event handler
        this.runtime.on('protocolMessage', (message) => {
            this.sendProtocolMessage(message);
        });
    }
    // dummy, required by vscode.Disposable (?)
    dispose() {
        this.runtime.killR();
    }
    // used to send messages from VS Code to R
    handleMessage(msg) {
        if (msg.type === 'request') {
            this.dispatchRequest(msg);
        }
        else {
            logging_1.logger.error('Unknown DAP message:', msg);
        }
    }
    sendProtocolMessage(message) {
        message.seq = this.sequence++;
        this.sendMessage.fire(message);
    }
    dispatchRequest(request) {
        var _a, _b, _c;
        // prepare response
        const response = {
            command: request.command,
            request_seq: request.seq,
            seq: 0,
            success: true,
            type: 'response'
        };
        let dispatchToR = false; // the cases handled here are not sent to R
        let sendResponse = true; // for cases handled here, the response must also be sent from here
        try {
            switch (request.command) {
                case 'initialize': {
                    const args = request.arguments || {};
                    args.threadId = this.THREAD_ID;
                    args.extensionVersion = utils_1.getVSCodePackageVersion();
                    void this.runtime.initializeRequest(response, args, request);
                    sendResponse = false;
                    break;
                }
                case 'launch':
                    dispatchToR = true;
                    sendResponse = false;
                    logging_1.logger.info('Launch Arguments:', request.arguments);
                    this.runtime.endOutputGroup();
                    break;
                case 'evaluate': {
                    const matches = /^### ?[sS][tT][dD][iI][nN]\s*(.*)$/s.exec((_a = request.arguments) === null || _a === void 0 ? void 0 : _a.expression);
                    if (matches) {
                        // send directly to stdin, don't send request
                        const toStdin = matches[1];
                        logging_1.logger.debug('user to stdin:\n' + toStdin);
                        (_b = this.runtime.rSession) === null || _b === void 0 ? void 0 : _b.writeToStdin(toStdin);
                    }
                    else {
                        // dispatch normally
                        dispatchToR = true;
                        sendResponse = false;
                    }
                    break;
                }
                case 'disconnect':
                    // kill R process after timeout, in case it doesn't quit successfully
                    setTimeout(() => {
                        logging_1.logger.info('Killing R...');
                        this.runtime.killR();
                    }, this.disconnectTimeout);
                    dispatchToR = true;
                    sendResponse = false;
                    break;
                case 'continue': {
                    // pass info about the currently open text editor
                    // can be used to start .vsc.debugSource(), when called from global workspace
                    const doc = (_c = vscode.window.activeTextEditor) === null || _c === void 0 ? void 0 : _c.document;
                    if ((doc === null || doc === void 0 ? void 0 : doc.uri.scheme) === 'file') {
                        const filename = doc.fileName;
                        request.arguments || (request.arguments = {});
                        request.arguments.callDebugSource = true;
                        request.arguments.source = { path: filename };
                    }
                    dispatchToR = true;
                    sendResponse = false;
                    break;
                }
                case 'pause':
                    // this._runtime.killR('SIGSTOP'); // doesn't work
                    response.success = false;
                    break;
                default:
                    // request not handled here -> send to R
                    dispatchToR = true;
                    sendResponse = false;
                // end cases
            }
        }
        catch (e) {
            logging_1.logger.error('Error while handling request:', request, e);
            response.success = false;
            dispatchToR = false;
            sendResponse = true;
        }
        // dispatch to R if not (completely) handled here
        if (dispatchToR) {
            this.runtime.dispatchRequest(request);
        }
        else {
            logging_1.logger.info('Request handled in VS Code:', request);
        }
        // send response if (completely) handled here
        if (sendResponse) {
            this.sendProtocolMessage(response);
        }
    }
}
exports.DebugAdapter = DebugAdapter;
//# sourceMappingURL=debugAdapter.js.map