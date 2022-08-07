"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LaCheck_linterName, _LaCheck_linterUtil;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaCheck = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const linterutil_1 = require("./linterutil");
const convertfilename_1 = require("../../utils/convertfilename");
class LaCheck {
    constructor(extension) {
        this.extension = extension;
        _LaCheck_linterName.set(this, 'LaCheck');
        this.linterDiagnostics = vscode.languages.createDiagnosticCollection(__classPrivateFieldGet(this, _LaCheck_linterName, "f"));
        _LaCheck_linterUtil.set(this, void 0);
        __classPrivateFieldSet(this, _LaCheck_linterUtil, new linterutil_1.LinterUtil(extension), "f");
    }
    async lintRootFile() {
        this.extension.logger.addLogMessage('Linter for root file started.');
        if (this.extension.manager.rootFile === undefined) {
            this.extension.logger.addLogMessage('No root file found for linting.');
            return;
        }
        const filePath = this.extension.manager.rootFile;
        const stdout = await this.lacheckWrapper('root', vscode.Uri.file(filePath), filePath, undefined);
        if (!stdout) {
            return;
        }
        this.parseLog(stdout);
    }
    async lintFile(document) {
        this.extension.logger.addLogMessage('Linter for active file started.');
        const filePath = document.fileName;
        const content = document.getText();
        const stdout = await this.lacheckWrapper('active', document, filePath, content);
        if (!stdout) {
            return;
        }
        this.parseLog(stdout, document.fileName);
    }
    async lacheckWrapper(linterid, configScope, filePath, content) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop', configScope);
        const command = configuration.get('linting.lacheck.exec.path');
        let stdout;
        try {
            stdout = await __classPrivateFieldGet(this, _LaCheck_linterUtil, "f").processWrapper(linterid, command, [filePath], { cwd: path.dirname(filePath) }, content);
        }
        catch (err) {
            if ('stdout' in err) {
                stdout = err.stdout;
            }
            else {
                return undefined;
            }
        }
        return stdout;
    }
    parseLog(log, filePath) {
        const linterLog = [];
        const lines = log.split('\n');
        const baseDir = path.dirname(filePath || this.extension.manager.rootFile || '.');
        for (let index = 0; index < lines.length; index++) {
            const logLine = lines[index];
            const re = /"(.*?)",\sline\s(\d+):\s(<-\s)?(.*)/g;
            const match = re.exec(logLine);
            if (!match) {
                continue;
            }
            if (match[3] === '<- ') {
                const nextLineRe = /.*line\s(\d+).*->\s(.*)/g;
                const nextLineMatch = nextLineRe.exec(lines[index + 1]);
                if (nextLineMatch) {
                    linterLog.push({
                        file: path.resolve(baseDir, match[1]),
                        line: parseInt(match[2]),
                        text: `${match[4]} -> ${nextLineMatch[2]} at Line ${nextLineMatch[1]}`
                    });
                    index++;
                }
                else {
                    linterLog.push({
                        file: path.resolve(baseDir, match[1]),
                        line: parseInt(match[2]),
                        text: match[4]
                    });
                }
            }
            else {
                linterLog.push({
                    file: path.resolve(baseDir, match[1]),
                    line: parseInt(match[2]),
                    text: match[4]
                });
            }
        }
        this.extension.logger.addLogMessage(`Linter log parsed with ${linterLog.length} messages.`);
        this.linterDiagnostics.clear();
        this.showLinterDiagnostics(linterLog);
    }
    showLinterDiagnostics(linterLog) {
        const diagsCollection = Object.create(null);
        for (const item of linterLog) {
            const range = new vscode.Range(new vscode.Position(item.line - 1, 0), new vscode.Position(item.line - 1, 65535));
            const diag = new vscode.Diagnostic(range, item.text, vscode.DiagnosticSeverity.Warning);
            diag.source = __classPrivateFieldGet(this, _LaCheck_linterName, "f");
            if (diagsCollection[item.file] === undefined) {
                diagsCollection[item.file] = [];
            }
            diagsCollection[item.file].push(diag);
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const convEnc = configuration.get('message.convertFilenameEncoding');
        for (const file in diagsCollection) {
            let file1 = file;
            if (['.tex', '.bbx', '.cbx', '.dtx'].includes(path.extname(file))) {
                // Only report LaCheck errors on TeX files. This is done to avoid
                // reporting errors in .sty files, which are irrelevant for most users.
                if (!fs.existsSync(file1) && convEnc) {
                    const f = (0, convertfilename_1.convertFilenameEncoding)(file1);
                    if (f !== undefined) {
                        file1 = f;
                    }
                }
                this.linterDiagnostics.set(vscode.Uri.file(file1), diagsCollection[file]);
            }
        }
    }
}
exports.LaCheck = LaCheck;
_LaCheck_linterName = new WeakMap(), _LaCheck_linterUtil = new WeakMap();
//# sourceMappingURL=lacheck.js.map