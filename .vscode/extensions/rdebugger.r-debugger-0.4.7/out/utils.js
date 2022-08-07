"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSettings = exports.escapeStringForR = exports.getRequiredRPackageVersion = exports.escapeForRegex = exports.getVSCodePackageVersion = exports.getRDownloadLink = exports.getRStartupArguments = exports.timeout = exports.getPortNumber = exports.getRpath = exports.getRpathFromSystem = exports.config = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const winreg = require("winreg");
const packageJson = (require('../package.json'));
function config(onlyDebugger = true) {
    if (onlyDebugger) {
        return vscode.workspace.getConfiguration('r.debugger');
    }
    else {
        return vscode.workspace.getConfiguration('r');
    }
}
exports.config = config;
function getRfromEnvPath(platform) {
    var _a;
    let splitChar = ':';
    let fileExtension = '';
    if (platform === 'win32') {
        splitChar = ';';
        fileExtension = '.exe';
    }
    const os_paths = ((_a = process.env.PATH) === null || _a === void 0 ? void 0 : _a.split(splitChar)) || [];
    for (const os_path of os_paths) {
        const os_r_path = path.join(os_path, 'R' + fileExtension);
        if (fs.existsSync(os_r_path)) {
            return os_r_path;
        }
    }
    return '';
}
async function getRpathFromSystem() {
    let rpath = '';
    const platform = process.platform;
    rpath || (rpath = getRfromEnvPath(platform));
    if (!rpath && platform === 'win32') {
        // Find path from registry
        try {
            const key = new winreg({
                hive: winreg.HKLM,
                key: '\\Software\\R-Core\\R',
            });
            const item = await new Promise((c, e) => key.get('InstallPath', (err, result) => err === null ? c(result) : e(err)));
            rpath = path.join(item.value, 'bin', 'R.exe');
        }
        catch (e) {
            rpath = '';
        }
    }
    return rpath;
}
exports.getRpathFromSystem = getRpathFromSystem;
async function getRpath(quote = false, overwriteConfig) {
    let rpath = undefined;
    const configEntry = (process.platform === 'win32' ? 'rpath.windows' :
        process.platform === 'darwin' ? 'rpath.mac' :
            'rpath.linux');
    // try the config entry specified in the function arg:
    if (overwriteConfig) {
        rpath = config().get(overwriteConfig);
    }
    // try the os-specific config entry for the rpath:
    rpath || (rpath = config(false).get(configEntry));
    // read from path/registry:
    rpath || (rpath = await getRpathFromSystem());
    // represent all invalid paths (undefined, '', null) as '':
    rpath || (rpath = '');
    if (!rpath) {
        // inform user about missing R path:
        void vscode.window.showErrorMessage(`${process.platform} can't use R`);
    }
    else if (quote && /^[^'"].* .*[^'"]$/.exec(rpath)) {
        // if requested and rpath contains spaces, add quotes:
        rpath = `"${rpath}"`;
    }
    else if (process.platform === 'win32' && /^'.* .*'$/.exec(rpath)) {
        // replace single quotes with double quotes on windows
        rpath = rpath.replace(/^'(.*)'$/, '"$1"');
    }
    return rpath;
}
exports.getRpath = getRpath;
function getPortNumber(server) {
    const address = server === null || server === void 0 ? void 0 : server.address();
    if (typeof address === 'string' || !address) {
        return -1;
    }
    else {
        return address.port;
    }
}
exports.getPortNumber = getPortNumber;
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.timeout = timeout;
async function getRStartupArguments(launchConfig = {}) {
    const platform = process.platform;
    const rpath = await getRpath(true);
    const rArgs = [
        '--quiet',
        '--no-save',
        (platform === 'win32' ? '--ess' : '--interactive')
    ];
    // add user specified args
    const customArgs = config().get('commandLineArgs', []);
    rArgs.push(...customArgs);
    rArgs.push(...(launchConfig.commandLineArgs || []));
    const ret = {
        path: rpath,
        args: rArgs,
        cwd: undefined,
        env: launchConfig.env
    };
    if (rpath === '') {
        void vscode.window.showErrorMessage(`${process.platform} can't find R`);
    }
    return ret;
}
exports.getRStartupArguments = getRStartupArguments;
function getRDownloadLink(packageName) {
    let url = config().get('packageURL', '');
    if (url === '') {
        const platform = process.platform;
        const version = String(packageJson.version); // e.g. "0.1.2"
        const urlBase = 'https://github.com/ManuelHentschel/VSCode-R-Debugger/releases/download/v' +
            version +
            '/' +
            packageName +
            '_' +
            version;
        if (platform === 'win32') {
            url = urlBase + '.zip';
        }
        else if (platform === 'darwin') {
            url = urlBase + '.tgz';
        }
        else {
            url = urlBase + '.tar.gz';
        }
    }
    return url;
}
exports.getRDownloadLink = getRDownloadLink;
function getVSCodePackageVersion() {
    return String(packageJson.version);
}
exports.getVSCodePackageVersion = getVSCodePackageVersion;
function escapeForRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
exports.escapeForRegex = escapeForRegex;
function getRequiredRPackageVersion() {
    if (typeof packageJson.rPackageInfo === 'object') {
        return packageJson.rPackageInfo;
    }
    else {
        return {};
    }
}
exports.getRequiredRPackageVersion = getRequiredRPackageVersion;
function escapeStringForR(s, quote = '"') {
    if (s === undefined) {
        return 'NULL';
    }
    else {
        return (quote
            + s.replace(/\\/g, '\\\\')
                .replace(RegExp(quote, 'g'), `\\${quote}`)
                .replace(/\n/g, '\\n')
                // .replace(/\r/g, "\\r")
                .replace(/\r/g, '')
                .replace(/\t/g, '\\t')
                .replace(/\f/g, '\\f')
                .replace(/\v/g, '\\v')
            + quote);
    }
}
exports.escapeStringForR = escapeStringForR;
async function checkSettings() {
    const config0 = vscode.workspace.getConfiguration('rdebugger');
    const keys = Object.getOwnPropertyNames(config0);
    const deprecated = [
        'rterm',
        'timeouts',
        'checkVersion',
        'trackTerminals'
    ];
    const foundDeprecated = deprecated.filter((v) => checkDeprecated(config0, v));
    console.log(keys);
    console.log(foundDeprecated);
    if (foundDeprecated.length === 0) {
        return false;
    }
    const ret1 = 'Open Settings';
    const ret2 = 'Don\'t show again';
    const ret = await vscode.window.showInformationMessage(`Configuration for R-Debugger has moved (affects: ${foundDeprecated.map(v => 'rdebugger.' + v).join(', ')}). Open settings?`, ret1, ret2);
    if (ret === ret1) {
        void vscode.commands.executeCommand('workbench.action.openSettings', '@ext:rdebugger.r-debugger');
    }
    return ret === ret2;
}
exports.checkSettings = checkSettings;
function checkDeprecated(config, entry) {
    const info = config.inspect(entry);
    const changed = !!(info && (info.globalLanguageValue ||
        info.globalValue ||
        info.workspaceFolderLanguageValue ||
        info.workspaceFolderValue ||
        info.workspaceLanguageValue ||
        info.workspaceValue));
    return changed;
}
//# sourceMappingURL=utils.js.map