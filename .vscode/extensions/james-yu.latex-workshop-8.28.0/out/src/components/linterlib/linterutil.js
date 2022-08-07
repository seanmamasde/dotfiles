"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LinterUtil_currentProcesses;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinterUtil = void 0;
const child_process_1 = require("child_process");
const os_1 = require("os");
class LinterUtil {
    constructor(extension) {
        this.extension = extension;
        _LinterUtil_currentProcesses.set(this, Object.create(null));
    }
    processWrapper(linterId, command, args, options, stdin) {
        this.extension.logger.logCommand(`Linter for ${linterId} command`, command, args);
        return new Promise((resolve, reject) => {
            if (__classPrivateFieldGet(this, _LinterUtil_currentProcesses, "f")[linterId]) {
                __classPrivateFieldGet(this, _LinterUtil_currentProcesses, "f")[linterId].kill();
            }
            const startTime = process.hrtime();
            __classPrivateFieldGet(this, _LinterUtil_currentProcesses, "f")[linterId] = (0, child_process_1.spawn)(command, args, options);
            const proc = __classPrivateFieldGet(this, _LinterUtil_currentProcesses, "f")[linterId];
            proc.stdout.setEncoding('binary');
            proc.stderr.setEncoding('binary');
            let stdout = '';
            proc.stdout.on('data', newStdout => {
                stdout += newStdout;
            });
            let stderr = '';
            proc.stderr.on('data', newStderr => {
                stderr += newStderr;
            });
            proc.on('error', err => {
                this.extension.logger.addLogMessage(`Linter for ${linterId} failed to spawn command, encountering error: ${err.message}`);
                return reject(err);
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    let msg;
                    if (stderr === '') {
                        msg = stderr;
                    }
                    else {
                        msg = '\n' + stderr;
                    }
                    this.extension.logger.addLogMessage(`Linter for ${linterId} failed with exit code ${exitCode} and error:${msg}`);
                    return reject({ exitCode, stdout, stderr });
                }
                else {
                    const [s, ms] = process.hrtime(startTime);
                    this.extension.logger.addLogMessage(`Linter for ${linterId} successfully finished in ${s}s ${Math.round(ms / 1000000)}ms`);
                    return resolve(stdout);
                }
            });
            if (stdin !== undefined) {
                proc.stdin.write(stdin);
                if (!stdin.endsWith(os_1.EOL)) {
                    // Always ensure we end with EOL otherwise ChkTeX will report line numbers as off by 1.
                    proc.stdin.write(os_1.EOL);
                }
                proc.stdin.end();
            }
        });
    }
}
exports.LinterUtil = LinterUtil;
_LinterUtil_currentProcesses = new WeakMap();
//# sourceMappingURL=linterutil.js.map