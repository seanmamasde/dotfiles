"use strict";
/*
The functions in this file are only used when debugging in attached mode.


This file contains functions to answer the custom request
`writeToStdinRequest`
which is used by the R package vscDebugger to request text written to its stdin.

This approach is used, since there are no R functions to replace e.g.
`n`, `f`, `c`
when using the browser() prompt.

Therefore, there is no way for the R package to continue execution or step
through code by itself (as far as I'm aware).

This problem can be solved to some extent by the R package requesting text
like the commands mentioned above to its stdin.

This approach is a bit hacky but seems to work fine in simple usecases.
If the user is using the terminal at the same time, things probably get messy.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalHandler = exports.trackTerminals = void 0;
const net = require("net");
const vscode = require("vscode");
const utils_1 = require("./utils");
const logging_1 = require("./logging");
let doTrackTerminals = false;
function trackTerminals(envCol) {
    let terminalId = 1;
    function getAndUpdateTerminalId() {
        const oldId = `${terminalId}`;
        terminalId += 1;
        envCol.replace('VSCODE_R_DEBUGGER_TERMINAL_ID', `${terminalId}`);
        return oldId;
    }
    // initialize the EnvironmentVariableMutator
    getAndUpdateTerminalId();
    vscode.window.onDidOpenTerminal((term) => {
        term.vscodeRDebuggerTerminalId = getAndUpdateTerminalId();
        return null;
    });
    doTrackTerminals = true;
}
exports.trackTerminals = trackTerminals;
class TerminalHandler {
    constructor(port = 0, host = 'localhost') {
        this.lineCache = new Map();
        const timeout = utils_1.config().get('timeouts.startup', 1000);
        this.server = net.createServer((socket) => {
            logging_1.logger.debug('Cusotm server: connection!');
            socket.on('data', (data) => {
                this.handleData(data, socket);
            });
        });
        const portPromise = new Promise((resolve, reject) => {
            this.server.listen(port, host, () => {
                const port = utils_1.getPortNumber(this.server);
                logging_1.logger.info(`Custom server listening on ${host}:${port}`);
                resolve(port);
            });
            setTimeout(() => {
                reject(new Error('Server not listening...'));
            }, timeout);
        });
        this.portPromise = portPromise;
    }
    dispose() {
        logging_1.logger.info('Closing custom server connections');
        this.lineCache.forEach((_, socket) => {
            socket.destroy();
        });
        this.server.close();
    }
    handleData(data, socket) {
        const newText = data.toString().replace(/\r/g, '');
        const restOfLine = this.lineCache.get(socket) || '';
        const text = restOfLine + newText;
        const lines = text.split('\n');
        this.lineCache.set(socket, lines.pop());
        for (const line of lines) {
            const j = JSON.parse(line);
            void this.handleJson(j);
        }
    }
    handleJson(json) {
        if (json.type === 'event' && json.event === 'custom') {
            const body = json.body;
            if ((body === null || body === void 0 ? void 0 : body.reason) === 'writeToStdin') {
                body.terminalId = body.terminalId || '0';
                body.useActiveTerminal = body.useActiveTerminal || false;
                body.text = body.text || '';
                body.addNewLine = body.addNewLine || true;
                if (body.count !== 0) {
                    body.count = body.count || 1;
                }
                body.pid = body.pid || 0;
                body.ppid = body.ppid || 0;
                if (body.when === 'now' || body.fallBackToNow) {
                    // make sure, all mandatory fields are assigned above!
                    return writeToStdin(body);
                }
                else {
                    return false;
                }
            }
        }
        return false;
    }
}
exports.TerminalHandler = TerminalHandler;
async function writeToStdin(args) {
    const terminal = await findTerminal(args);
    if (terminal) {
        terminal.sendText(args.text, args.addNewLine);
        return true;
    }
    else {
        logging_1.logger.debug('No terminal found.');
        return false;
    }
}
async function findTerminal(args) {
    // abort if no terminals open
    if (vscode.window.terminals.length < 1) {
        return undefined;
    }
    let term;
    // try looking by pid / parent pid
    if (args.pid > 0 || args.ppid > 0) {
        for (term of vscode.window.terminals) {
            const pid = await term.processId;
            if (pid === args.pid || pid === args.ppid) {
                logging_1.logger.debug('identified terminal by pid');
                return term;
            }
        }
    }
    // try looking by terminal id (added on terminal creation by the extension)
    if (args.terminalId && doTrackTerminals) {
        for (term of vscode.window.terminals) {
            if ('vscodeRDebuggerTerminalId' in term && args.terminalId === term.vscodeRDebuggerTerminalId) {
                logging_1.logger.debug('identified terminal by terminalId');
                return term;
            }
        }
    }
    // resort to active terminal
    if (args.useActiveTerminal) {
        logging_1.logger.debug('resort to active terminal');
        return vscode.window.activeTerminal;
    }
    // give up...
    return undefined;
}
//# sourceMappingURL=terminals.js.map