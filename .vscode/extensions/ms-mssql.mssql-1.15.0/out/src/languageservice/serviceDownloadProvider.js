"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const tmp = require("tmp");
const platform_1 = require("../models/platform");
const interfaces_1 = require("./interfaces");
const Constants = require("../constants/constants");
const fs = require("fs/promises");
/*
* Service Download Provider class which handles downloading the SQL Tools service.
*/
class ServiceDownloadProvider {
    constructor(_config, _logger, _statusView, _httpClient, _decompressProvider) {
        this._config = _config;
        this._logger = _logger;
        this._statusView = _statusView;
        this._httpClient = _httpClient;
        this._decompressProvider = _decompressProvider;
        // Ensure our temp files get cleaned up in case of error.
        tmp.setGracefulCleanup();
    }
    /**
     * Returns the download url for given platform
     */
    getDownloadFileName(platform) {
        let fileNamesJson = this._config.getSqlToolsConfigValue('downloadFileNames');
        let fileName = fileNamesJson[platform.toString()];
        if (fileName === undefined) {
            if (process.platform === 'linux') {
                throw new Error('Unsupported linux distribution');
            }
            else {
                throw new Error(`Unsupported platform: ${process.platform}`);
            }
        }
        return fileName;
    }
    /**
     * Returns SQL tools service installed folder, creating it if it doesn't exist.
     */
    getOrMakeInstallDirectory(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            let basePath = this.getInstallDirectoryRoot();
            let versionFromConfig = this._config.getSqlToolsPackageVersion();
            basePath = basePath.replace('{#version#}', versionFromConfig);
            basePath = basePath.replace('{#platform#}', platform_1.getRuntimeDisplayName(platform));
            try {
                yield fs.mkdir(basePath, { recursive: true });
            }
            catch (_a) {
                // Best effort to make the folder, if it already exists (expected scenario) or something else happens
                // then just carry on
            }
            return basePath;
        });
    }
    /**
     * Returns SQL tools service installed folder root.
     */
    getInstallDirectoryRoot() {
        let installDirFromConfig = this._config.getSqlToolsInstallDirectory();
        let basePath;
        if (path.isAbsolute(installDirFromConfig)) {
            basePath = installDirFromConfig;
        }
        else {
            // The path from config is relative to the out folder
            basePath = path.join(__dirname, '../../' + installDirFromConfig);
        }
        return basePath;
    }
    getGetDownloadUrl(fileName) {
        let baseDownloadUrl = this._config.getSqlToolsServiceDownloadUrl();
        let version = this._config.getSqlToolsPackageVersion();
        baseDownloadUrl = baseDownloadUrl.replace('{#version#}', version);
        baseDownloadUrl = baseDownloadUrl.replace('{#fileName#}', fileName);
        return baseDownloadUrl;
    }
    /**
     * Downloads the SQL tools service and decompress it in the install folder.
     */
    installSQLToolsService(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            const proxy = this._config.getWorkspaceConfig('http.proxy');
            const strictSSL = this._config.getWorkspaceConfig('http.proxyStrictSSL', true);
            const authorization = this._config.getWorkspaceConfig('http.proxyAuthorization');
            const fileName = this.getDownloadFileName(platform);
            const installDirectory = yield this.getOrMakeInstallDirectory(platform);
            this._logger.appendLine(`${Constants.serviceInstallingTo} ${installDirectory}.`);
            const urlString = this.getGetDownloadUrl(fileName);
            const isZipFile = path.extname(fileName) === '.zip';
            this._logger.appendLine(`${Constants.serviceDownloading} ${urlString}`);
            let pkg = {
                installPath: installDirectory,
                url: urlString,
                tmpFile: undefined,
                isZipFile: isZipFile
            };
            const tmpResult = yield this.createTempFile(pkg);
            pkg.tmpFile = tmpResult;
            try {
                yield this._httpClient.downloadFile(pkg.url, pkg, this._logger, this._statusView, proxy, strictSSL, authorization);
                this._logger.logDebug(`Downloaded to ${pkg.tmpFile.name}...`);
                this._logger.appendLine(' Done!');
                yield this.install(pkg);
            }
            catch (err) {
                this._logger.appendLine(`[ERROR] ${err}`);
                throw err;
            }
            return true;
        });
    }
    createTempFile(pkg) {
        return new Promise((resolve, reject) => {
            tmp.file({ prefix: 'package-' }, (err, filePath, fd, cleanupCallback) => {
                if (err) {
                    return reject(new interfaces_1.PackageError('Error from tmp.file', pkg, err));
                }
                resolve({ name: filePath, fd: fd, removeCallback: cleanupCallback });
            });
        });
    }
    install(pkg) {
        this._logger.appendLine('Installing ...');
        this._statusView.installingService();
        return new Promise((resolve, reject) => {
            this._decompressProvider.decompress(pkg, this._logger).then(_ => {
                this._statusView.serviceInstalled();
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }
}
exports.default = ServiceDownloadProvider;

//# sourceMappingURL=serviceDownloadProvider.js.map
