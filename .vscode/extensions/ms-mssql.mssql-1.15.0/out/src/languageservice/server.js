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
const fs = require("fs/promises");
/*
* Service Provider class finds the SQL tools service executable file or downloads it if doesn't exist.
*/
class ServerProvider {
    constructor(_downloadProvider, _config, _statusView) {
        this._downloadProvider = _downloadProvider;
        this._config = _config;
        this._statusView = _statusView;
    }
    /**
     * Given a file path, returns the path to the SQL Tools service file.
     */
    findServerPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield fs.lstat(filePath);
            // If a file path was passed, assume its the launch file.
            if (stats.isFile()) {
                return filePath;
            }
            // Otherwise, search the specified folder.
            if (this._config !== undefined) {
                let executableFiles = this._config.getSqlToolsExecutableFiles();
                for (const executableFile of executableFiles) {
                    const executablePath = path.join(filePath, executableFile);
                    try {
                        if (yield fs.stat(executablePath)) {
                            return executablePath;
                        }
                    }
                    catch (err) {
                        // no-op, the exe files list has all possible options and so depending on the platform we expect some
                        // to always fail
                    }
                }
            }
            return undefined;
        });
    }
    /**
     * Download the SQL tools service if doesn't exist and returns the file path.
     */
    getOrDownloadServer(runtime) {
        return __awaiter(this, void 0, void 0, function* () {
            // Attempt to find launch file path first from options, and then from the default install location.
            // If SQL tools service can't be found, download it.
            const serverPath = yield this.getServerPath(runtime);
            if (serverPath === undefined) {
                return this.downloadServerFiles(runtime);
            }
            else {
                return serverPath;
            }
        });
    }
    /**
     * Returns the path of the installed service if it exists, or undefined if not
     */
    getServerPath(runtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const installDirectory = yield this._downloadProvider.getOrMakeInstallDirectory(runtime);
            return this.findServerPath(installDirectory);
        });
    }
    /**
     * Downloads the service and returns the path of the installed service if it exists
     */
    downloadServerFiles(runtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const installDirectory = yield this._downloadProvider.getOrMakeInstallDirectory(runtime);
            try {
                yield this._downloadProvider.installSQLToolsService(runtime);
                return this.findServerPath(installDirectory);
            }
            catch (err) {
                this._statusView.serviceInstallationFailed();
                throw err;
            }
        });
    }
}
exports.default = ServerProvider;

//# sourceMappingURL=server.js.map
