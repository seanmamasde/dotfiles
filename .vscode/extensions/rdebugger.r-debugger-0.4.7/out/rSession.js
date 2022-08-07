"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSession = void 0;
const child = require("child_process");
const utils_1 = require("./utils");
const net = require("net");
const logging_1 = require("./logging");
const subject_1 = require("./subject");
const kill = require("tree-kill");
class RSession {
    constructor(handleLine, handleJson, echoStdin) {
        this.restOfLine = {};
        this.ignoreOutput = false;
        this.host = 'localhost';
        this.jsonPort = -1;
        this.sinkPort = -1;
        // store line/json handlers (are called by this.handleData)
        this.handleLine = handleLine;
        this.handleJsonString = handleJson;
        this.echoStdin = echoStdin || ((text) => { });
    }
    async startR(args) {
        this.cp = spawnRProcess(args);
        if (this.cp.pid === undefined) {
            return false;
        }
        // handle output from the R-process
        this.cp.stdout.on('data', data => {
            this.handleData(data, 'stdout');
        });
        this.cp.stderr.on('data', data => {
            this.handleData(data, 'stderr');
        });
        // set up json port
        // used for protocol messages, formatted as json
        const jsonPort = args.jsonPort || 0;
        const jsonServerReady = new subject_1.Subject();
        this.jsonServer = net.createServer((socket) => {
            socket.on('data', (data) => {
                this.handleData(data, 'jsonSocket');
                logging_1.logger.log('jsonIn', data);
            });
            this.jsonSocket = socket;
        });
        this.jsonServer.listen(jsonPort, this.host, () => {
            this.jsonPort = utils_1.getPortNumber(this.jsonServer);
            jsonServerReady.notify();
        });
        // set up sink port
        // is used to capture output printed to stdout by 'normal' R commands
        // only some low level stuff (prompt/input echo) is still printed to the actual stdout
        const sinkPort = args.sinkPort || 0;
        const sinkServerReady = new subject_1.Subject();
        this.sinkServer = net.createServer((socket) => {
            socket.on('data', (data) => {
                this.handleData(data, 'sinkSocket');
                logging_1.logger.log('sink', data);
            });
            this.sinkSocket = socket;
        });
        this.sinkServer.listen(sinkPort, this.host, () => {
            this.sinkPort = utils_1.getPortNumber(this.sinkServer);
            sinkServerReady.notify();
        });
        // wait for servers to connect to port
        const timeout = utils_1.config().get('timeouts.startup', 1000);
        await jsonServerReady.wait(timeout);
        await sinkServerReady.wait(timeout);
        return true;
    }
    writeToStdin(text, checkNewLine = true) {
        var _a;
        // make sure text ends in exactly one newline
        if (checkNewLine) {
            text = text.replace(/\n*$/, '\n');
        }
        // log and write text
        this.echoStdin(text);
        logging_1.logger.log('stdin', text);
        (_a = this.cp) === null || _a === void 0 ? void 0 : _a.stdin.write(text);
        if (!this.cp) {
            logging_1.logger.error('No child process available');
        }
    }
    writeToJsonSocket(text) {
        var _a;
        (_a = this.jsonSocket) === null || _a === void 0 ? void 0 : _a.write(text);
        logging_1.logger.log('jsonOut', text);
        if (!this.jsonSocket) {
            logging_1.logger.error('No Json socket available');
        }
    }
    // Kill the child process
    killChildProcess(signal = 'SIGKILL') {
        if (!this.cp) {
            // logger.info('No child process to kill');
        }
        else if (this.cp.exitCode === null) {
            logging_1.logger.log('cpinfo', `sending signal ${signal}...`);
            kill(this.cp.pid, signal);
            logging_1.logger.log('cpinfo', 'sent signal');
        }
        else {
            logging_1.logger.log('cpinfo', `process already exited with code ${this.cp.exitCode}`);
        }
    }
    handleData(data, from) {
        let text = data.toString();
        text = text.replace(/\r/g, ''); //keep only \n as linebreak
        text = (this.restOfLine[from] || '') + text; // append to rest of line from previouse call
        const lines = text.split(/\n/); // split into lines
        // logger.debug(`data from ${from}: ${text}`);
        for (let i = 0; i < lines.length; i++) {
            // abort output handling if ignoreOutput has been set to true
            // used to avoid handling remaining output after debugging has been stopped
            if (this.ignoreOutput) {
                return;
            }
            const isLastLine = i === lines.length - 1;
            const line = lines[i];
            let restOfLine;
            if (isLastLine && line === '') {
                restOfLine = '';
            }
            else if (from === 'jsonSocket') {
                restOfLine = this.handleJsonString(line, from, !isLastLine);
            }
            else {
                restOfLine = this.handleLine(line, from, !isLastLine);
            }
            this.restOfLine[from] = restOfLine; // save unhandled part for next call
        }
    }
}
exports.RSession = RSession;
/////////////////////////////////
// Child Process
function spawnRProcess(args) {
    const options = {
        env: {
            VSCODE_DEBUG_SESSION: '1',
            ...args.env,
            ...process.env
        },
        shell: true,
        cwd: args.cwd
    };
    const rPath = args.path;
    const rArgs = args.args;
    const cp = child.spawn(rPath, rArgs, options);
    // log output
    cp.stdout.on('data', data => {
        logging_1.logger.log('stdout', data);
    });
    cp.stderr.on('data', data => {
        logging_1.logger.log('stderr', data);
    });
    cp.on('close', code => {
        logging_1.logger.log('cpinfo', `Child process exited with code: ${code}`);
    });
    cp.on('error', error => {
        logging_1.logger.log('cpinfo', `cp.error:${error.message}`);
    });
    return cp;
}
//# sourceMappingURL=rSession.js.map