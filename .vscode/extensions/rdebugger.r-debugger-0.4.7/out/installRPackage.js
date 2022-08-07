"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPackageVersion = exports.explainRPackage = exports.updateRPackage = void 0;
const utils_1 = require("./utils");
const vscode = require("vscode");
const path_1 = require("path");
const semver = require("semver");
async function updateRPackage(extensionPath, packageName = 'vscDebugger') {
    void vscode.window.showInformationMessage('Installing R Packages...');
    const url = utils_1.getRDownloadLink(packageName);
    const rPath = (await utils_1.getRStartupArguments()).path;
    const terminal = vscode.window.createTerminal('InstallRPackage');
    terminal.show();
    terminal.sendText(`${rPath} --no-restore --quiet -f "${path_1.join(extensionPath, 'R', 'install.R')}" --args "${url}"`);
}
exports.updateRPackage = updateRPackage;
function explainRPackage(writeOutput, message = '') {
    message = message + ('\n\nIt can be attempted to install this package and the dependencies (currently R6 and jsonlite) automatically.'
        + '\n\nTo do so, run the following command in the command palette (ctrl+shift+p):'
        + '\n\n\n\t\t' + 'r.debugger.updateRPackage' + '\n'
        + '\n\nThis feature is still somewhat experimental!'
        + '\n\nIf this does not work or you want to make sure you have the latest version, follow the instructions in the readme to install the package yourself.'
        + '\n\n\n');
    writeOutput(message);
}
exports.explainRPackage = explainRPackage;
function checkPackageVersion(version) {
    const checkLevel = utils_1.config().get('checkVersion', 'required');
    const rPackageVersions = utils_1.getRequiredRPackageVersion();
    const requiredVersion = rPackageVersions.required || '0.0.0';
    const recommendedVersion = rPackageVersions.recommended || '0.0.0';
    const warnIfNewerVersion = rPackageVersions.warnIfNewer || '999.99.99';
    const packageName = rPackageVersions.name || 'vscDebugger';
    let versionOk = true;
    let shortMessage = '';
    let longMessage = '';
    if (checkLevel === 'none') {
        versionOk = true;
    }
    else if (semver.gt(requiredVersion, version)) {
        versionOk = false;
        shortMessage = 'Please update the R Package!\n(See Debug Console for details)';
        longMessage = ('This version of the VSCode extension requires at least version ' +
            requiredVersion +
            ' of the R Package ' +
            packageName +
            '!\n\nCurrently installed: ' +
            version +
            '\n\nTo disable this warning, set the option "r.debugger.checkVersion"="none".\n');
    }
    else if (semver.gt(recommendedVersion, version) && checkLevel === 'recommended') {
        versionOk = false;
        shortMessage = 'Please update the R Package!\n(See Debug Console for details)';
        longMessage = ('With this version of the VSCode extension it is recommended to use at least version ' +
            recommendedVersion +
            ' of the R Package ' +
            packageName +
            '!\n\nCurrently installed: ' +
            version +
            '\n\nTo disable this warning, set the option "r.debugger.checkVersion"="none" or "r.debugger.checkVersion"="required".\n');
    }
    return {
        versionOk: versionOk,
        shortMessage: shortMessage,
        longMessage: longMessage
    };
}
exports.checkPackageVersion = checkPackageVersion;
//# sourceMappingURL=installRPackage.js.map