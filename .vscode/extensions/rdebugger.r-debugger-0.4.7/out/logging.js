"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const vscode = require("vscode");
class Logger {
    constructor(outputLine) {
        this.outputLine = outputLine;
        this.srcLength = 8;
    }
    logSingleText(source, txt) {
        const lines = txt.replace(/\r/g, '').split('\n');
        const ts = getTimeStamp();
        const src = source.padEnd(this.srcLength, '.');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLastLine = (i === lines.length - 1);
            if (isLastLine && line === '') {
                continue;
            }
            const lfInfo = isLastLine ? ' ' : 'n';
            this.outputLine(`[${src}] [${ts}] [${lfInfo}] ${line}`);
        }
    }
    logText(source, ...txt) {
        txt.map((t) => this.logSingleText(source, t));
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    log(source, ...msg) {
        const txt = msg.map(m => forceString(m));
        this.logText(source, ...txt);
    }
    info(...msg) {
        this.log('info', ...msg);
    }
    debug(...msg) {
        this.log('debug', ...msg);
    }
    error(...msg) {
        this.log('error', ...msg);
    }
}
exports.Logger = Logger;
function makeVsCodeLogger() {
    const outputChannel = vscode.window.createOutputChannel('R Debugger');
    const logFunction = (txt) => outputChannel.appendLine(txt);
    const logger = new Logger(logFunction);
    return logger;
}
function getTimeStamp() {
    const date = new Date();
    const s = date.toISOString().replace(/^.*T(.*)Z$/, '$1');
    return s;
}
function forceString(x) {
    try {
        // x = (<string>x).toString();
    }
    catch (e) {
        // ignore
    }
    if (typeof x === 'string') {
        return x;
    }
    else if (x instanceof Buffer) {
        return String(x);
    }
    else if (typeof x === 'object') {
        return JSON.stringify(x);
    }
    else {
        return String(x);
    }
}
exports.logger = makeVsCodeLogger();
//# sourceMappingURL=logging.js.map