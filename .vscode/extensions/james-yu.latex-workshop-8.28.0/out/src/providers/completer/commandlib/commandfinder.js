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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandNameDuplicationDetector = exports.CommandSignatureDuplicationDetector = exports.CommandFinder = exports.resolveCmdEnvFile = exports.isTriggerSuggestNeeded = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const latex_utensils_1 = require("latex-utensils");
const command_1 = require("../command");
function isTriggerSuggestNeeded(name) {
    const reg = /^(?:[a-z]*(cite|ref|input)[a-z]*|begin|bibitem|(sub)?(import|includefrom|inputfrom)|gls(?:pl|text|first|plural|firstplural|name|symbol|desc|user(?:i|ii|iii|iv|v|vi))?|Acr(?:long|full|short)?(?:pl)?|ac[slf]?p?)/i;
    return reg.test(name);
}
exports.isTriggerSuggestNeeded = isTriggerSuggestNeeded;
function resolveCmdEnvFile(name, dataDir) {
    const dirs = vscode.workspace.getConfiguration('latex-workshop').get('intellisense.package.dirs');
    dirs.push(dataDir);
    for (const dir of dirs) {
        const f = `${dir}/${name}`;
        if (fs.existsSync(f)) {
            return f;
        }
    }
    // Many package with names like toppackage-config.sty are just wrappers around
    // the general package toppacke.sty and do not define commands on their own.
    const suffix = name.substring(name.lastIndexOf('_'));
    const indexDash = name.lastIndexOf('-');
    if (indexDash > -1) {
        const generalPkg = name.substring(0, indexDash);
        const f = `${dataDir}/${generalPkg}${suffix}`;
        if (fs.existsSync(f)) {
            return f;
        }
    }
    return undefined;
}
exports.resolveCmdEnvFile = resolveCmdEnvFile;
class CommandFinder {
    constructor(extension) {
        this.definedCmds = new Map();
        this.extension = extension;
    }
    getCmdFromNodeArray(file, nodes, commandNameDuplicationDetector) {
        let cmds = [];
        nodes.forEach(node => {
            cmds = cmds.concat(this.getCmdFromNode(file, node, commandNameDuplicationDetector));
        });
        return cmds;
    }
    getCmdFromNode(file, node, commandNameDuplicationDetector) {
        const cmds = [];
        if (latex_utensils_1.latexParser.isDefCommand(node)) {
            const name = node.token.slice(1);
            if (!commandNameDuplicationDetector.has(name)) {
                const cmd = new command_1.CmdEnvSuggestion(`\\${name}`, '', { name, args: this.getArgsFromNode(node) }, vscode.CompletionItemKind.Function);
                cmd.documentation = '`' + name + '`';
                cmd.insertText = new vscode.SnippetString(name + this.getTabStopsFromNode(node));
                cmd.filterText = name;
                if (isTriggerSuggestNeeded(name)) {
                    cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                }
                cmds.push(cmd);
                commandNameDuplicationDetector.add(name);
            }
        }
        else if (latex_utensils_1.latexParser.isCommand(node)) {
            if (!commandNameDuplicationDetector.has(node.name)) {
                const cmd = new command_1.CmdEnvSuggestion(`\\${node.name}`, this.whichPackageProvidesCommand(node.name), { name: node.name, args: this.getArgsFromNode(node) }, vscode.CompletionItemKind.Function);
                cmd.documentation = '`' + node.name + '`';
                cmd.insertText = new vscode.SnippetString(node.name + this.getTabStopsFromNode(node));
                if (isTriggerSuggestNeeded(node.name)) {
                    cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                }
                cmds.push(cmd);
                commandNameDuplicationDetector.add(node.name);
            }
            if (['newcommand', 'renewcommand', 'providecommand', 'DeclareMathOperator', 'DeclarePairedDelimiter', 'DeclarePairedDelimiterX', 'DeclarePairedDelimiterXPP'].includes(node.name.replace(/\*$/, '')) &&
                Array.isArray(node.args) && node.args.length > 0) {
                const label = node.args[0].content[0].name;
                let tabStops = '';
                let args = '';
                if (latex_utensils_1.latexParser.isOptionalArg(node.args[1])) {
                    const numArgs = parseInt(node.args[1].content[0].content);
                    for (let i = 1; i <= numArgs; ++i) {
                        tabStops += '{${' + i + '}}';
                        args += '{}';
                    }
                }
                if (!commandNameDuplicationDetector.has(label)) {
                    const cmd = new command_1.CmdEnvSuggestion(`\\${label}`, 'user-defined', { name: label, args }, vscode.CompletionItemKind.Function);
                    cmd.documentation = '`' + label + '`';
                    cmd.insertText = new vscode.SnippetString(label + tabStops);
                    cmd.filterText = label;
                    if (isTriggerSuggestNeeded(label)) {
                        cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                    }
                    cmds.push(cmd);
                    this.definedCmds.set(label, {
                        file,
                        location: new vscode.Location(vscode.Uri.file(file), new vscode.Position(node.location.start.line - 1, node.location.start.column))
                    });
                    commandNameDuplicationDetector.add(label);
                }
            }
        }
        if (latex_utensils_1.latexParser.hasContentArray(node)) {
            return cmds.concat(this.getCmdFromNodeArray(file, node.content, commandNameDuplicationDetector));
        }
        return cmds;
    }
    getArgsHelperFromNode(node, helper) {
        let args = '';
        if (!('args' in node)) {
            return args;
        }
        let index = 0;
        if (latex_utensils_1.latexParser.isCommand(node)) {
            node.args.forEach(arg => {
                ++index;
                if (latex_utensils_1.latexParser.isOptionalArg(arg)) {
                    args += '[' + helper(index) + ']';
                }
                else {
                    args += '{' + helper(index) + '}';
                }
            });
            return args;
        }
        if (latex_utensils_1.latexParser.isDefCommand(node)) {
            node.args.forEach(arg => {
                ++index;
                if (latex_utensils_1.latexParser.isCommandParameter(arg)) {
                    args += '{' + helper(index) + '}';
                }
            });
            return args;
        }
        return args;
    }
    getTabStopsFromNode(node) {
        return this.getArgsHelperFromNode(node, (i) => { return '${' + i + '}'; });
    }
    getArgsFromNode(node) {
        return this.getArgsHelperFromNode(node, (_) => { return ''; });
    }
    getCmdFromContent(file, content) {
        const cmdReg = /\\([a-zA-Z@_]+(?::[a-zA-Z]*)?\*?)({[^{}]*})?({[^{}]*})?({[^{}]*})?/g;
        const cmds = [];
        const commandNameDuplicationDetector = new CommandNameDuplicationDetector();
        let explSyntaxOn = false;
        while (true) {
            const result = cmdReg.exec(content);
            if (result === null) {
                break;
            }
            if (result[1] === 'ExplSyntaxOn') {
                explSyntaxOn = true;
                continue;
            }
            else if (result[1] === 'ExplSyntaxOff') {
                explSyntaxOn = false;
                continue;
            }
            if (!explSyntaxOn) {
                const len = result[1].search(/[_:]/);
                if (len > -1) {
                    result[1] = result[1].slice(0, len);
                }
            }
            if (commandNameDuplicationDetector.has(result[1])) {
                continue;
            }
            const cmd = new command_1.CmdEnvSuggestion(`\\${result[1]}`, this.whichPackageProvidesCommand(result[1]), { name: result[1], args: this.getArgsFromRegResult(result) }, vscode.CompletionItemKind.Function);
            cmd.documentation = '`' + result[1] + '`';
            cmd.insertText = new vscode.SnippetString(result[1] + this.getTabStopsFromRegResult(result));
            cmd.filterText = result[1];
            if (isTriggerSuggestNeeded(result[1])) {
                cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
            }
            cmds.push(cmd);
            commandNameDuplicationDetector.add(result[1]);
        }
        const newCommandReg = /\\(?:(?:(?:re|provide)?(?:new)?command)|(?:DeclarePairedDelimiter(?:X|XPP)?)|DeclareMathOperator)\*?{?\\(\w+)}?(?:\[([1-9])\])?/g;
        while (true) {
            const result = newCommandReg.exec(content);
            if (result === null) {
                break;
            }
            if (commandNameDuplicationDetector.has(result[1])) {
                continue;
            }
            let tabStops = '';
            let args = '';
            if (result[2]) {
                const numArgs = parseInt(result[2]);
                for (let i = 1; i <= numArgs; ++i) {
                    tabStops += '{${' + i + '}}';
                    args += '{}';
                }
            }
            const cmd = new command_1.CmdEnvSuggestion(`\\${result[1]}`, 'user-defined', { name: result[1], args }, vscode.CompletionItemKind.Function);
            cmd.documentation = '`' + result[1] + '`';
            cmd.insertText = new vscode.SnippetString(result[1] + tabStops);
            cmd.filterText = result[1];
            cmds.push(cmd);
            commandNameDuplicationDetector.add(result[1]);
            this.definedCmds.set(result[1], {
                file,
                location: new vscode.Location(vscode.Uri.file(file), new vscode.Position(content.substring(0, result.index).split('\n').length - 1, 0))
            });
        }
        return cmds;
    }
    getTabStopsFromRegResult(result) {
        let text = '';
        if (result[2]) {
            text += '{${1}}';
        }
        if (result[3]) {
            text += '{${2}}';
        }
        if (result[4]) {
            text += '{${3}}';
        }
        return text;
    }
    getArgsFromRegResult(result) {
        return '{}'.repeat(result.length - 1);
    }
    /**
     * Return the name of the package providing cmdName among all the packages
     * included in the rootFile. If no package matches, return ''
     *
     * @param cmdName the name of a command (without the leading '\')
     */
    whichPackageProvidesCommand(cmdName) {
        if (this.extension.manager.rootFile !== undefined) {
            for (const file of this.extension.manager.getIncludedTeX()) {
                const cachedPkgs = this.extension.manager.getCachedContent(file)?.element.package;
                if (cachedPkgs === undefined) {
                    continue;
                }
                for (const pkg of cachedPkgs) {
                    const commands = [];
                    this.extension.completer.command.provideCmdInPkg(pkg, commands, new CommandSignatureDuplicationDetector());
                    for (const cmd of commands) {
                        const label = cmd.label.slice(1);
                        if (label.startsWith(cmdName) &&
                            ((label.length === cmdName.length) ||
                                (label.charAt(cmdName.length) === '[') ||
                                (label.charAt(cmdName.length) === '{'))) {
                            return pkg;
                        }
                    }
                }
            }
        }
        return '';
    }
}
exports.CommandFinder = CommandFinder;
class CommandSignatureDuplicationDetector {
    constructor() {
        this.cmdSignatureList = new Set();
    }
    add(cmd) {
        this.cmdSignatureList.add(cmd.signatureAsString());
    }
    has(cmd) {
        return this.cmdSignatureList.has(cmd.signatureAsString());
    }
}
exports.CommandSignatureDuplicationDetector = CommandSignatureDuplicationDetector;
class CommandNameDuplicationDetector {
    constructor(suggestions = []) {
        this.cmdSignatureList = new Set();
        this.cmdSignatureList = new Set(suggestions.map(s => s.name()));
    }
    add(cmd) {
        if (cmd instanceof command_1.CmdEnvSuggestion) {
            this.cmdSignatureList.add(cmd.name());
        }
        else if (typeof (cmd) === 'string') {
            this.cmdSignatureList.add(cmd);
        }
        else {
            throw new Error('Unaccepted argument type');
        }
    }
    has(cmd) {
        if (cmd instanceof command_1.CmdEnvSuggestion) {
            return this.cmdSignatureList.has(cmd.name());
        }
        else if (typeof (cmd) === 'string') {
            return this.cmdSignatureList.has(cmd);
        }
        else {
            throw new Error('Unaccepted argument type');
        }
    }
}
exports.CommandNameDuplicationDetector = CommandNameDuplicationDetector;
//# sourceMappingURL=commandfinder.js.map