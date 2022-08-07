"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugRuntime = void 0;
const events_1 = require("events");
const vscode = require("vscode");
const utils_1 = require("./utils");
const installRPackage_1 = require("./installRPackage");
const rSession_1 = require("./rSession");
const installRPackage_2 = require("./installRPackage");
const subject_1 = require("./subject");
const logging_1 = require("./logging");
class DebugRuntime extends events_1.EventEmitter {
    // constructor
    constructor(helpPanel, launchConfig) {
        super();
        // DEPRECATED: delimiters used when printing info from R which is meant for the debugger
        // need to occurr on the same line!
        // need to match those used in the R-package
        this.rStrings = {
            prompt: '<#v\\s\\c>',
            continue: '<##v\\s\\c>',
            startup: '<v\\s\\c\\R\\STARTUP>',
            libraryNotFound: '<v\\s\\c\\LIBRARY\\NOT\\FOUND>',
            packageName: 'vscDebugger',
        };
        // // state info about the R session
        // R session
        this.rSessionStartup = new subject_1.Subject(); // used to wait for R session to start
        this.rSessionReady = false; // is set to true after executing the first R command successfully
        // R package
        this.rPackageStartup = new subject_1.Subject(); // used to wait for package to load
        this.rPackageFound = false; // is set to true after receiving a message 'go'/calling the main() function
        this.rPackageInfo = undefined;
        this.rPackageVersionCheck = { versionOk: false, shortMessage: '', longMessage: '' };
        // output state (of R process)
        this.stdoutIsBrowserInfo = false; // set to true if rSession.stdout is currently giving browser()-details
        // output state (of this extension)
        this.outputGroupLevel = 0; // counts the nesting level of output to the debug window
        // timeouts
        this.startupTimeout = 1000; // time to wait for R and the R package to laod before throwing an error
        this.terminateTimeout = 50; // time to wait before terminating to give time for messages to appear
        // debugMode
        this.outputModes = {};
        this.writeOnPrompt = [];
        this.helpPanel = helpPanel;
        this.launchConfig = launchConfig;
    }
    async initializeRequest(response, args, request) {
        // This function initializes a debug session with the following steps:
        // 1. Handle arguments
        // 2. Launch a child process running R
        // 3. Check that the child process started 
        // 4. Load the R package vscDebugger
        // 5. Check that the R package is present and has a correct version
        var _a;
        //// (1) Handle arguments
        // update rStrings
        this.rStrings = {
            ...this.rStrings,
            ...args.rStrings
        };
        args.rStrings = this.rStrings;
        // read settings from vsc-settings
        const cfg = utils_1.config();
        this.startupTimeout = cfg.get('timeouts.startup', this.startupTimeout);
        this.terminateTimeout = cfg.get('timeouts.terminate', this.terminateTimeout);
        this.outputModes['stdout'] = cfg.get('printStdout', 'nothing');
        this.outputModes['stderr'] = cfg.get('printStderr', 'all');
        this.outputModes['stdin'] = cfg.get('printStdin', 'nothing');
        this.outputModes['sinkSocket'] = cfg.get('printSinkSocket', 'filtered');
        // start R in child process
        const rStartupArguments = await utils_1.getRStartupArguments(this.launchConfig);
        rStartupArguments.cwd = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
        if (!rStartupArguments.path) {
            const message = 'No R path was found in the settings/path/registry.\n(Can be changed in setting r.rpath.XXX)';
            await this.abortInitializeRequest(response, message);
            return false;
        }
        // print some info about the rSession
        // everything following this is printed in (collapsed) group
        logging_1.logger.info('R Startup:', rStartupArguments);
        //// (2) Launch child process
        const tmpHandleLine = (line, from, isFullLine) => {
            return this.handleLine(line, from, isFullLine);
        };
        const tmpHandleJsonString = (json, from, isFullLine = true) => {
            return this.handleJsonString(json, from, isFullLine);
        };
        const tmpEchoStdin = (text) => {
            if (this.outputModes['stdin'] === 'all') {
                setTimeout(() => this.writeOutput(text, false, 'stdout'), 0);
            }
        };
        this.rSession = new rSession_1.RSession(tmpHandleLine, tmpHandleJsonString, tmpEchoStdin);
        // check that the child process launched properly
        const successTerminal = await this.rSession.startR(rStartupArguments);
        if (!successTerminal) {
            const message = 'Failed to spawn a child process!';
            await this.abortInitializeRequest(response, message);
            return false;
        }
        // read ports that were assigned to the child process and add to initialize args
        if (this.rSession.jsonPort <= 0 || this.rSession.sinkPort <= 0) {
            const message = 'Failed to listen on port!';
            await this.abortInitializeRequest(response, message);
            return false;
        }
        else {
            args.useJsonSocket = true;
            args.jsonHost = this.rSession.host;
            args.jsonPort = this.rSession.jsonPort;
            args.useSinkSocket = true;
            args.sinkHost = this.rSession.host;
            args.sinkPort = this.rSession.sinkPort;
        }
        //// (3) CHECK IF R HAS STARTED
        // cat message from R
        const escapedStartupString = utils_1.escapeStringForR(this.rStrings.startup + '\n');
        const startupCmd = `base::cat(${escapedStartupString})`;
        this.rSession.writeToStdin(startupCmd);
        // `this.rSessionStartup` is notified when the output of the above `cat()` call is received
        await this.rSessionStartup.wait(this.startupTimeout);
        if (this.rSessionReady) {
            logging_1.logger.info('R Session ready');
        }
        else {
            const rPath = rStartupArguments.path;
            const message = 'R path not working:\n' + rPath + '\n(Can be changed in setting r.rpath.XXX)';
            const abortPromise = this.abortInitializeRequest(response, message);
            this.writeOutput(`R not responding within ${this.startupTimeout}ms!`, true, 'stderr');
            this.writeOutput(`R path:\n${rPath}`, true, 'stderr');
            this.writeOutput('If R is installed but in a different path, please adjust the setting r.rpath.windows/mac/linux.\n');
            this.writeOutput(`If R might take more than ${this.startupTimeout}ms to launch, try increasing the setting r.debugger.timeouts.startup!\n`);
            await abortPromise;
            return false;
        }
        //// (4) Load R package
        // load R package, wrapped in a try-catch-function
        // missing R package will be handled by this.handleLine()
        const escapedLibraryNotFoundString = utils_1.escapeStringForR(this.rStrings.libraryNotFound + '\n');
        const libraryCmd = `base::tryCatch(expr=base::library(${this.rStrings.packageName}), error=function(e) base::cat(${escapedLibraryNotFoundString}))`;
        this.rSession.writeToStdin(libraryCmd);
        logging_1.logger.info('Initialize Arguments:', args);
        // actually dispatch the (modified) initialize request to the R package
        request.arguments = args;
        this.dispatchRequest(request);
        //// (5) Check that the package started and has ok version
        // `rPackageStartup` is notified when the response to the initialize request is received
        await this.rPackageStartup.wait(this.startupTimeout);
        if (this.rPackageFound && this.rPackageVersionCheck.versionOk) {
            logging_1.logger.info('R Package ok');
        }
        else {
            let shortMessage = '';
            let longMessage = '';
            if (this.rPackageFound) { // but not version ok
                logging_1.logger.info('R Package version not ok');
                shortMessage = this.rPackageVersionCheck.shortMessage;
                longMessage = this.rPackageVersionCheck.longMessage || '';
            }
            else { // package completely missing
                logging_1.logger.info('R Package missing');
                shortMessage = 'Please install the R package "' + this.rStrings.packageName + '"!';
                longMessage = 'The debugger requries the R package "' + this.rStrings.packageName + '"!';
            }
            this.endOutputGroup();
            const tmpWriteOutput = (text) => {
                this.writeOutput(text, true, 'console');
            };
            installRPackage_2.explainRPackage(tmpWriteOutput, longMessage);
            await this.abortInitializeRequest(response, shortMessage, false);
            return false;
        }
        // everything ok:
        return true;
    }
    async abortInitializeRequest(response, message, endOutputGroup = true) {
        // used to abort the debug session and return an unsuccessful InitializeResponse
        logging_1.logger.error(message);
        if (endOutputGroup) {
            this.endOutputGroup();
        }
        // timeout to give messages time to appear before shutdown
        await utils_1.timeout(this.terminateTimeout);
        // prep and send response
        response.success = false;
        response.message = message;
        this.sendProtocolMessage(response);
        this.killR();
        return false;
    }
    //////////
    // Output-handlers: (for output of the R process to stdout/stderr)
    //////////
    handleLine(line, from, isFullLine) {
        // handle output from the R process line by line
        // is called by rSession.handleData()
        const line0 = line;
        const isStderr = (from === 'stderr');
        const isSink = (from === 'sinkSocket');
        const isStdout = (from === 'stdout');
        const outputMode = this.outputModes[from] || 'all';
        // only show the line to the user if it is complete & relevant
        let showLine = isFullLine && !this.stdoutIsBrowserInfo && isSink;
        if (outputMode === 'all') {
            setTimeout(() => {
                this.writeOutput(line0, isFullLine, (isStderr ? 'stderr' : 'stdout'));
            }, 0);
        }
        // differentiate data source. Is non exclusive, in case sinkServer is not used
        if (isStdout) {
            if (!this.rPackageFound && isFullLine) {
                // This message is only sent once to verify that R has started
                // Check for R-Startup message
                if (RegExp(utils_1.escapeForRegex(this.rStrings.startup)).test(line)) {
                    this.rSessionReady = true;
                    this.rSessionStartup.notify();
                }
                // This message is sent only if loading the R package throws an error
                // Check for Library-Not-Found-Message
                if (RegExp(utils_1.escapeForRegex(this.rStrings.libraryNotFound)).test(line)) {
                    this.rPackageFound = false;
                    this.rPackageStartup.notify();
                }
            }
            else {
                // Check for browser prompt
                const browserRegex = /Browse\[\d+\]> /;
                if (browserRegex.test(line)) {
                    void this.handlePrompt('browser');
                    // R has entered the browser
                    line = line.replace(browserRegex, '');
                    showLine = false;
                }
                // identify echo of browser commands sent by vsc
                if (isFullLine && /^[ncsfQ]$/.test(line)) {
                    // commands used to control the browser
                    logging_1.logger.debug('matches: [ncsfQ]');
                    showLine = false;
                }
                // check for prompt
                const promptRegex = new RegExp(utils_1.escapeForRegex(this.rStrings.prompt));
                if (promptRegex.test(line) && isFullLine) {
                    void this.handlePrompt('topLevel');
                    showLine = false;
                    line = '';
                }
                // check for continue prompt
                const continueRegex = new RegExp(utils_1.escapeForRegex(this.rStrings.continue));
                if (continueRegex.test(line) && isFullLine) {
                    logging_1.logger.debug('matches: continue prompt');
                    this.writeOutput('...');
                    showLine = false;
                }
            }
        }
        if (isSink) {
            // contains 'normal' output
            // Breakpoints set with trace() or vscDebugger::mySetBreakpoint() are preceded by this:
            const tracingInfoRegex = /Tracing (.*)step.*$/;
            if (isFullLine && tracingInfoRegex.test(line)) {
                // showLine = false;
                line = line.replace(tracingInfoRegex, '');
                this.stdoutIsBrowserInfo = true;
                // this.hitBreakpoint(true);
                showLine = false;
            }
            // filter out additional browser info:
            const browserInfoRegex = /(?:debug:|exiting from|debugging|Called from|debug at):? .*$/;
            if (isFullLine && (browserInfoRegex.test(line))) {
                // showLine = false; // part of browser-info
                line = line.replace(browserInfoRegex, '');
                this.stdoutIsBrowserInfo = true;
                showLine = false;
            }
        }
        if (isStderr) {
            showLine = true;
        }
        // determine if/what part of line is printed
        let lineOut;
        if (outputMode === 'all') {
            // lineOut = line0;
            lineOut = '';
            line = '';
            // showLine = true;
            showLine = false;
        }
        else if (showLine && outputMode === 'filtered') {
            lineOut = line;
        }
        else {
            lineOut = '';
            showLine = false;
        }
        // output line
        if (lineOut.length > 0 || showLine) {
            this.writeOutput(lineOut, isFullLine, (isStderr ? 'stderr' : 'stdout'));
        }
        // if line is shown it counts as handled
        if (showLine) {
            line = '';
        }
        return line;
    }
    async handlePrompt(which, text) {
        var _a;
        logging_1.logger.debug(`matches prompt: ${which}`);
        // wait for timeout to give json socket time to catch up
        // might be useful to avoid async issues
        const timeout = utils_1.config().get('timeouts.prompt', 0);
        if (timeout > 0) {
            await new Promise(resolve => setTimeout(resolve, timeout));
        }
        logging_1.logger.debug(`handling prompt: ${which}`);
        // input prompt is last part of browser-info
        // toggle after delay, to give sink-socket time to arrive
        this.stdoutIsBrowserInfo = false;
        const wop = this.writeOnPrompt.shift();
        if (wop) {
            const matchesPrompt = (wop.which === 'prompt' || wop.which === which);
            if (matchesPrompt && wop.count > 0) {
                this.writeToStdin(wop.text);
                wop.count -= 1;
                if (wop.count > 0) {
                    this.writeOnPrompt.unshift(wop);
                }
            }
            else if (matchesPrompt && wop.count < 0) {
                this.writeToStdin(wop.text);
                this.writeOnPrompt.unshift(wop);
            }
            else {
                logging_1.logger.error('invalid writeOnPrompt entry');
            }
        }
        else {
            const cmdListen = `${this.rStrings.packageName}::.vsc.listenForJSON(timeout = -1)`;
            (_a = this.rSession) === null || _a === void 0 ? void 0 : _a.writeToStdin(cmdListen);
            this.sendShowingPromptRequest(which, text);
        }
    }
    sendShowingPromptRequest(which, text) {
        const request = {
            command: 'custom',
            arguments: {
                reason: 'showingPrompt',
                which: which,
                text: text
            },
            seq: 0,
            type: 'request'
        };
        this.dispatchRequest(request);
    }
    handleJsonString(json, from, isFullLine = true) {
        if (!isFullLine) {
            return json;
        }
        else {
            const j = JSON.parse(json);
            this.handleJson(j);
            return '';
        }
    }
    handleJson(json) {
        var _a;
        if (json.type === 'response') {
            if (json.command === 'initialize') {
                this.rPackageFound = true;
                this.rPackageInfo = (json.packageInfo ||
                    //0.1.1 is last version that does not return packageInfo:
                    { Version: '0.1.1', Package: this.rStrings.packageName });
                const versionCheck = installRPackage_1.checkPackageVersion(this.rPackageInfo.Version);
                this.rPackageVersionCheck = versionCheck;
                this.rPackageStartup.notify();
                if (versionCheck.versionOk) {
                    this.sendProtocolMessage(json);
                }
            }
            else {
                this.sendProtocolMessage(json);
            }
        }
        else if (json.type === 'event') {
            if (json.event === 'custom') {
                const body = json.body;
                if (body.reason === 'writeToStdin') {
                    this.handleWriteToStdinEvent(json.body);
                }
                else if (body.reason === 'viewHelp' && body.requestPath) {
                    (_a = this.helpPanel) === null || _a === void 0 ? void 0 : _a.showHelpForPath(body.requestPath);
                }
            }
            else {
                this.sendProtocolMessage(json);
            }
        }
        else {
            logging_1.logger.error('Unknown message:');
            logging_1.logger.error(json);
        }
    }
    // send DAP message to the debugSession
    sendProtocolMessage(message) {
        this.emit('protocolMessage', message);
    }
    handleWriteToStdinEvent(args) {
        let count = 0;
        if (args.count !== 0) {
            count = args.count || 1;
        }
        const when = args.when || 'now';
        let text = args.text;
        if (args.addNewLine && args.text.slice(-1) !== '\n') {
            text = text + '\n';
        }
        if (when === 'now') {
            for (let i = 0; i < count; i++) {
                this.writeToStdin(args.text);
            }
        }
        else {
            let which = 'prompt';
            if (when === 'browserPrompt') {
                which = 'browser';
            }
            else if (when === 'topLevelPrompt') {
                which = 'topLevel';
            }
            const newWriteOnPrompt = {
                text: text,
                which: which,
                count: count
            };
            if (args.stack && count === 0) {
                // ignore
            }
            else if (args.stack) {
                this.writeOnPrompt.push(newWriteOnPrompt);
            }
            else if (count === 0) {
                this.writeOnPrompt = [];
            }
            else {
                this.writeOnPrompt = [newWriteOnPrompt];
            }
        }
    }
    writeToStdin(text) {
        var _a;
        if (text) {
            logging_1.logger.debug('Writing to stdin: ', text);
            (_a = this.rSession) === null || _a === void 0 ? void 0 : _a.writeToStdin(text);
            return true;
        }
        else {
            return false;
        }
    }
    // REQUESTS
    // This version dispatches requests to the tcp connection instead of stdin
    dispatchRequest(request, usePort = true) {
        var _a, _b;
        const json = JSON.stringify(request);
        if (!((_a = this.rSession) === null || _a === void 0 ? void 0 : _a.jsonSocket)) {
            const escapedJson = utils_1.escapeStringForR(json);
            const cmdJson = `${this.rStrings.packageName}::.vsc.handleJson(json=${escapedJson})`;
            (_b = this.rSession) === null || _b === void 0 ? void 0 : _b.writeToStdin(cmdJson);
            // console.log(cmdJson);
            // this.rSession.callFunction('.vsc.handleJson', {json: json});
        }
        else {
            this.rSession.writeToJsonSocket(json + '\n');
        }
    }
    //////////////////////////////////////////////
    // OUTPUT
    writeOutput(text, addNewline = false, category = 'stdout', line = 1, group, data = {}) {
        // writes output to the debug console (of the vsc instance runnning the R code)
        // used during start up to print info about errors/progress
        if (text.slice(-1) !== '\n' && addNewline) {
            text = text + '\n';
        }
        if (group === 'end' && this.outputGroupLevel <= 0) {
            // no more output groups to close -> abort
            return false;
        }
        else if (group === 'start' || group === 'startCollapsed') {
            this.outputGroupLevel += 1;
        }
        else if (group === 'end') {
            this.outputGroupLevel -= 1;
        }
        const event = {
            event: 'output',
            seq: 0,
            type: 'event',
            body: {
                category: category,
                output: text,
                group: group,
                line: line,
                column: 1,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                data: data
            }
        };
        this.sendProtocolMessage(event);
        return true; // output event was sent
    }
    startOutputGroup(text = '', collapsed = false, addNewline = false, toStderr = false, line = 1) {
        const group = (collapsed ? 'startCollapsed' : 'start');
        this.writeOutput(text, addNewline, (toStderr ? 'stderr' : 'stdout'), line, group);
    }
    endOutputGroup() {
        this.writeOutput('', false, 'stdout', 1, 'end');
    }
    killR(signal = 'SIGKILL') {
        if (this.rSession) {
            this.rSession.ignoreOutput = true;
            this.rSession.killChildProcess(signal);
        }
    }
}
exports.DebugRuntime = DebugRuntime;
//# sourceMappingURL=debugRuntime.js.map