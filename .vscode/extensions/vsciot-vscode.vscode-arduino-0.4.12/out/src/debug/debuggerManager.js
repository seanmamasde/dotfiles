"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
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
exports.DebuggerManager = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const platform = require("../common/platform");
const util = require("../common/util");
const deviceContext_1 = require("../deviceContext");
class DebuggerManager {
    constructor(_extensionRoot, _arduinoSettings, _boardManager) {
        this._extensionRoot = _extensionRoot;
        this._arduinoSettings = _arduinoSettings;
        this._boardManager = _boardManager;
        this._debuggerMappings = {};
        this._debuggerBoardMappings = {};
    }
    initialize() {
        const debugFileContent = fs.readFileSync(path.join(this._extensionRoot, "misc", "debuggerUsbMapping.json"), "utf8");
        const usbFileContent = fs.readFileSync(path.join(this._extensionRoot, "misc", "usbmapping.json"), "utf8");
        for (const _debugger of JSON.parse(debugFileContent)) {
            if (Array.isArray(_debugger.pid)) {
                for (const pid of _debugger.pid) {
                    this._debuggerMappings[`${pid}%${_debugger.vid}`] = Object.assign(Object.assign({}, _debugger), { pid, vid: _debugger.vid });
                }
            }
            else {
                this._debuggerMappings[`${_debugger.pid}%${_debugger.vid}`] = Object.assign(Object.assign({}, _debugger), { pid: _debugger.pid, vid: _debugger.vid });
            }
        }
        for (const config of JSON.parse(usbFileContent)) {
            for (const board of config.boards) {
                if (board.interface || board.target) {
                    this._debuggerBoardMappings[[board.package, board.architecture, board.id].join(":")] = board;
                }
            }
        }
        // For anyone looking at blame history, I doubt this import works as-is.
        // I swapped it out for the old import to remove dependency on "node-usb-native",
        // but otherwise anything that was broken before is still broken.
        this._usbDetector = require("usb-detection");
        this._debugServerPath = platform.findFile(platform.getExecutableFileName("openocd"), path.join(this._arduinoSettings.packagePath, "packages"));
        if (!util.fileExistsSync(this._debugServerPath)) {
            this._debugServerPath = "";
        }
        this._miDebuggerPath = platform.findFile(platform.getExecutableFileName("arm-none-eabi-gdb"), path.join(this._arduinoSettings.packagePath, "packages"));
        if (!util.fileExistsSync(this._miDebuggerPath)) {
            this._miDebuggerPath = "";
        }
    }
    get miDebuggerPath() {
        return this._miDebuggerPath;
    }
    get debugServerPath() {
        return this._debugServerPath;
    }
    listDebuggers() {
        return __awaiter(this, void 0, void 0, function* () {
            const usbDeviceList = yield this._usbDetector.find();
            const keys = [];
            const results = [];
            usbDeviceList.forEach((device) => {
                if (device.vendorId && device.productId) {
                    /* tslint:disable:max-line-length*/
                    const key = util.convertToHex(device.productId, 4) + "%" + util.convertToHex(device.vendorId, 4);
                    const relatedDebugger = this._debuggerMappings[key];
                    if (relatedDebugger && keys.indexOf(key) < 0) {
                        keys.push(key);
                        results.push(relatedDebugger);
                    }
                }
            });
            return results;
        });
    }
    resolveOpenOcdOptions(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const board = this._boardManager.currentBoard.key;
            const debugConfig = this._debuggerBoardMappings[board];
            const dc = deviceContext_1.DeviceContext.getInstance();
            const debuggerConfigured = dc.debugger_;
            if (!debugConfig) {
                throw new Error(`Debug for board ${this._boardManager.currentBoard.name} is not supported by now.`);
            }
            let resolvedDebugger;
            const debuggers = yield this.listDebuggers();
            if (!debuggers.length) {
                throw new Error(`No supported debuggers are connected.`);
            }
            // rule 1: if this board has debuggers, use its own debugger
            if (debugConfig.interface) {
                resolvedDebugger = debuggers.find((_debugger) => {
                    return _debugger.short_name === debugConfig.interface || _debugger.config_file === debugConfig.interface;
                });
                if (!resolvedDebugger) {
                    throw new Error(`Debug port for board ${this._boardManager.currentBoard.name} is not connected.`);
                }
            }
            // rule 2: if there is only one debugger, use the only debugger
            if (!resolvedDebugger && !debuggerConfigured && debuggers.length === 1) {
                resolvedDebugger = debuggers[0];
            }
            // rule 3: if there is any configuration about debugger, use this configuration
            if (!resolvedDebugger && debuggerConfigured) {
                resolvedDebugger = debuggers.find((_debugger) => {
                    return _debugger.short_name === debuggerConfigured || _debugger.config_file === debuggerConfigured;
                });
            }
            if (!resolvedDebugger) {
                const chosen = yield vscode.window.showQuickPick(debuggers.map((l) => {
                    return {
                        description: `(0x${l.vid}:0x${l.pid})`,
                        label: l.name,
                    };
                }).sort((a, b) => {
                    return a.label === b.label ? 0 : (a.label > b.label ? 1 : -1);
                }), { placeHolder: "Select a debugger" });
                if (chosen && chosen.label) {
                    resolvedDebugger = debuggers.find((_debugger) => _debugger.name === chosen.label);
                    if (resolvedDebugger) {
                        dc.debugger_ = resolvedDebugger.config_file;
                    }
                }
                if (!resolvedDebugger) {
                    return "";
                }
            }
            const debugServerPath = config.debugServerPath;
            let scriptsFolder = path.join(path.dirname(debugServerPath), "../scripts/");
            if (!util.directoryExistsSync(scriptsFolder)) {
                scriptsFolder = path.join(path.dirname(debugServerPath), "../share/openocd/scripts/");
            }
            if (!util.directoryExistsSync(scriptsFolder)) {
                throw new Error("Cannot find scripts folder from openocd.");
            }
            // TODO: need to config gdb port other than hard-coded 3333
            if (resolvedDebugger.config_file.includes("jlink")) {
                // only swd is supported now
                /* tslint:disable:max-line-length*/
                return `-s ${scriptsFolder} -f interface/${resolvedDebugger.config_file} -c "transport select swd" -f target/${debugConfig.target} -c "telnet_port disabled" -c "tcl_port disabled"`;
            }
            /* tslint:disable:max-line-length*/
            return `-s ${scriptsFolder} -f interface/${resolvedDebugger.config_file} -f target/${debugConfig.target} -c "telnet_port disabled" -c "tcl_port disabled"`;
        });
    }
}
exports.DebuggerManager = DebuggerManager;

//# sourceMappingURL=debuggerManager.js.map

// SIG // Begin signature block
// SIG // MIIntQYJKoZIhvcNAQcCoIInpjCCJ6ICAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // zh8kEKZ6FKBVJ+RhR88lkdqahdS3n9ok2l6wmvCJwXSg
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAlKLM6r4lfM52wAA
// SIG // AAACUjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzI1OVoX
// SIG // DTIyMDkwMTE4MzI1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 0OTPj7P1+wTbr+Qf9COrqA8I9DSTqNSq1UKju4IEV3HJ
// SIG // Jck61i+MTEoYyKLtiLG2Jxeu8F81QKuTpuKHvi380gzs
// SIG // 43G+prNNIAaNDkGqsENQYo8iezbw3/NCNX1vTi++irdF
// SIG // qXNs6xoc3B3W+7qT678b0jTVL8St7IMO2E7d9eNdL6RK
// SIG // fMnwRJf4XfGcwL+OwwoCeY9c5tvebNUVWRzaejKIkBVT
// SIG // hApuAMCtpdvIvmBEdSTuCKZUx+OLr81/aEZyR2jL1s2R
// SIG // KaMz8uIzTtgw6m3DbOM4ewFjIRNT1hVQPghyPxJ+ZwEr
// SIG // wry5rkf7fKuG3PF0fECGSUEqftlOptpXTQIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFDWSWhFBi9hrsLe2TgLuHnxG
// SIG // F3nRMFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ2NzU5NzAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBABZJN7ksZExAYdTbQJewYryBLAFnYF9amfhH
// SIG // WTGG0CmrGOiIUi10TMRdQdzinUfSv5HHKZLzXBpfA+2M
// SIG // mEuJoQlDAUflS64N3/D1I9/APVeWomNvyaJO1mRTgJoz
// SIG // 0TTRp8noO5dJU4k4RahPtmjrOvoXnoKgHXpRoDSSkRy1
// SIG // kboRiriyMOZZIMfSsvkL2a5/w3YvLkyIFiqfjBhvMWOj
// SIG // wb744LfY0EoZZz62d1GPAb8Muq8p4VwWldFdE0y9IBMe
// SIG // 3ofytaPDImq7urP+xcqji3lEuL0x4fU4AS+Q7cQmLq12
// SIG // 0gVbS9RY+OPjnf+nJgvZpr67Yshu9PWN0Xd2HSY9n9xi
// SIG // au2OynVqtEGIWrSoQXoOH8Y4YNMrrdoOmjNZsYzT6xOP
// SIG // M+h1gjRrvYDCuWbnZXUcOGuOWdOgKJLaH9AqjskxK76t
// SIG // GI6BOF6WtPvO0/z1VFzan+2PqklO/vS7S0LjGEeMN3Ej
// SIG // 47jbrLy3/YAZ3IeUajO5Gg7WFg4C8geNhH7MXjKsClsA
// SIG // Pk1YtB61kan0sdqJWxOeoSXBJDIzkis97EbrqRQl91K6
// SIG // MmH+di/tolU63WvF1nrDxutjJ590/ALi383iRbgG3zkh
// SIG // EceyBWTvdlD6FxNbhIy+bJJdck2QdzLm4DgOBfCqETYb
// SIG // 4hQBEk/pxvHPLiLG2Xm9PEnmEDKo1RJpMIIHejCCBWKg
// SIG // AwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
// SIG // OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQD
// SIG // Ex9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDEx
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // q/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4Bjga
// SIG // BEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSH
// SIG // fpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpg
// SIG // GgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpc
// SIG // oRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnn
// SIG // Db6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD
// SIG // 2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLT
// SIG // swM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOE
// SIG // y/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2
// SIG // z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
// SIG // A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
// SIG // 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
// SIG // jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyim
// SIG // p31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8Hh
// SIG // hUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX
// SIG // 3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXT
// SIG // gqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMA
// SIG // dQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUw
// SIG // AwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx
// SIG // 0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4G
// SIG // CCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
// SIG // HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
// SIG // BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUF
// SIG // BwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5
// SIG // AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOS
// SIG // mUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np
// SIG // 22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r
// SIG // 4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION
// SIG // 9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWlu
// SIG // WpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiX
// SIG // mE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ
// SIG // 2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNA
// SIG // BQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPD
// SIG // XVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yH
// SIG // PgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
// SIG // XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
// SIG // oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
// SIG // GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E9
// SIG // 0Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZO
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYww
// SIG // ghmIAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHbR6O3IeBfQBjxD3Ulu
// SIG // C5WHzd6JvW7WGu9s094Xsv7oMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAA8BWlZP3IRbdPRq0zJkbNkcH9SoyWxklged9
// SIG // QkaMi6hv8qptN9jvL4FpSGZiOkA2UJ9+ARR3TQ38yp7w
// SIG // un/n60xf+eTDgdwsDQNo4ozMVIE4pSrdWMfDSpmhN2N6
// SIG // mA1yCJXHXyQM+p5DDRF7xibOnc6mxDlf55a/uNUgPbZ4
// SIG // Wpt0Hq8glV614vt7wCGT8CFYqDlmX0k8aSJ0Wd2RTCRM
// SIG // kjxSAlcRF2S3+QxAAElWyOlsbRyYh6/LeBhUlyERexSs
// SIG // RXttM4ZX51uhZlt6Xu/9wabRBWpQTjCnj/URUoKJ6d3C
// SIG // cyjlqgRZJMn7NVVWEPo1kDH4fVor6RSsipVZeXI80qGC
// SIG // FxYwghcSBgorBgEEAYI3AwMBMYIXAjCCFv4GCSqGSIb3
// SIG // DQEHAqCCFu8wghbrAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCB/3jtr
// SIG // z69+R9iPwL19uORjbdS/ihRZEF2HL03dFicuhwIGYmxK
// SIG // ouzKGBMyMDIyMDUwMzE5MDEwOC40ODRaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjE3
// SIG // OUUtNEJCMC04MjQ2MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIRZTCCBxQwggT8oAMC
// SIG // AQICEzMAAAGKPjiN0g4C+ugAAQAAAYowDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjExMDI4MTkyNzQyWhcNMjMwMTI2MTkyNzQyWjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjoxNzlFLTRC
// SIG // QjAtODI0NjElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggIPADCCAgoCggIBALf/rrehgwMgGb3oAYWoFndBqKk/
// SIG // JRRzHqaFjTizzxBKC7smuF95/iteBb5WcBZisKmqegfu
// SIG // hJCE0o5HnE0gekEQOJIr3ScnZS7yq4PLnbQbuuyyso0K
// SIG // sEcw0E0YRAsaVN9LXQRPwHsj/eZO6p3YSLvzqU+EBshi
// SIG // VIjA5ZmQIgz2ORSZIrVIBr8DAR8KICc/BVRARZ1YgFEU
// SIG // yeJAQ4lOqaW7+DyPe/r0IabKQyvvN4GsmokQt4DUxst4
// SIG // jonuj7JdN3L2CIhXACUT+DtEZHhZb/0kKKJs9ybbDHfa
// SIG // KEv1ztL0jfYdg1SjjTI2hToJzeUZOYgqsJp+qrJnvoWq
// SIG // Ef06wgUtM1417Fk4JJY1Abbde1AW1vES/vSzcN3IzyfB
// SIG // GEYJTDVwmCzOhswg1xLxPU//7AL/pNXPOLZqImQ2QagY
// SIG // K/0ry/oFbDs9xKA2UNuqk2tWxJ/56cTJl3LaGUnvEkQ6
// SIG // oCtCVFoYyl4J8mjgAxAfhbXyIvo3XFCW6T7QC+JFr1Uk
// SIG // SoqVb/DBLmES3sVxAxAYvleLXygKWYROIGtKfkAomsBy
// SIG // wWTaI91EDczOUFZhmotzJ0BW2ZIam1A8qaPb2lhHlXjt
// SIG // +SX3S1o8EYLzF91SmS+e3e45kY4lZZbl42RS8fq4SS+y
// SIG // WFabTj7RdTALTGJaejroJzqRvuFuDBh6o+2GHz9FAgMB
// SIG // AAGjggE2MIIBMjAdBgNVHQ4EFgQUI9pD2P1sGdSXrqdJ
// SIG // R4Q+MZBpJAMwHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcw
// SIG // AoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsF
// SIG // AAOCAgEAxfTBErD1w3kbXxaNX+e+Yj3xfQEVm3rrjXzO
// SIG // fNyH08X82X9nb/5ntwzYvynDTRJ0dUym2bRuy7INHMv6
// SIG // SiBEDiRtn2GlsCCCmMLsgySNkOJFYuZs21f9Aufr0ELE
// SIG // HAr37DPCuV9n34nyYu7anhtK+fAo4MHu8QWL4Lj5o1Dc
// SIG // cE1rxI2SD36Y1VKGjwpeqqrNHhVG+23C4c0xBGAZwI/D
// SIG // BDYYj+SCXeD6eZRah07aXnOu2BZhrjv7iAP04zwX3LTO
// SIG // ZFCPrs38of8iHbQzbZCM/nv8Zl0hYYkBEdLgY0aG0GVe
// SIG // nPtEzbb0TS2slOLuxHpHezmg180EdEblhmkosLTel3Pz
// SIG // 6DT9K3sxujr3MqMNajKFJFBEO6qg9EKvEBcCtAygnWUi
// SIG // bcgSjAaY1GApzVGW2L001puA1yuUWIH9t21QSVuF6OcO
// SIG // PdBx6OE41jas9ez6j8jAk5zPB3AKk5z3jBNHT2L23cMw
// SIG // zIG7psnWyWqv9OhSJpCeyl7PY8ag4hNj03mJ2o/Np+kP
// SIG // /z6mx7scSZsEDuH83ToFagBJBtVw5qaVSlv6ycQTdyMc
// SIG // la+kD/XIWNjGFWtG2wAiNnb1PkdkCZROQI6DCsuvFiNa
// SIG // ZhU9ySga62nKcuh1Ixq7Vfv9VOdm66xJQpVcuRW/PlGV
// SIG // mS6fNnLgs7STDEqlvpD+c8lQUryzPuAwggdxMIIFWaAD
// SIG // AgECAhMzAAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3
// SIG // DQEBCwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYD
// SIG // VQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBB
// SIG // dXRob3JpdHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0z
// SIG // MDA5MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
// SIG // CgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9Kp
// SIG // bE51yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5K
// SIG // Wv64NmeFRiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTz
// SIG // xXb1hlDcwUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9
// SIG // cmmvHaus9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl
// SIG // 3GoPz130/o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3K
// SIG // Ni1wjjHINSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3t
// SIG // pK56KTesy+uDRedGbsoy1cCGMFxPLOJiss254o2I5Jas
// SIG // AUq7vnGpF1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ
// SIG // 1v2lIH1+/NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHo
// SIG // vwUDo9Fzpk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz
// SIG // 1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymei
// SIG // XtcodgLiMxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8w
// SIG // dJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFd
// SIG // Etsluq9QBXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94
// SIG // q0W29R6HXtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0w
// SIG // ggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGC
// SIG // NxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1Ud
// SIG // DgQWBBSfpxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAE
// SIG // VTBTMFEGDCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIB
// SIG // FjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L0RvY3MvUmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBD
// SIG // AEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8w
// SIG // HwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQw
// SIG // VgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9v
// SIG // Q2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEB
// SIG // BE4wTDBKBggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRf
// SIG // MjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIB
// SIG // AJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEG
// SIG // k5c9MTO1OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi
// SIG // 7ulmZzpTTd2YurYeeNg2LpypglYAA7AFvonoaeC6Ce57
// SIG // 32pvvinLbtg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OO
// SIG // PcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECW
// SIG // OKz3+SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWK
// SIG // NsIdw2FzLixre24/LAl4FOmRsqlb30mjdAy87JGA0j3m
// SIG // Sj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSw
// SIG // ethQ/gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23K
// SIG // jgm9swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4
// SIG // S5pu+yFUa2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFE
// SIG // fnyhYWxz/gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+
// SIG // pTFRhLy/AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/
// SIG // Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7t
// SIG // fqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJt
// SIG // pQUQwXEGahC0HVUzWLOhcGbyoYIC1DCCAj0CAQEwggEA
// SIG // oYHYpIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYD
// SIG // VQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25z
// SIG // IExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNO
// SIG // OjE3OUUtNEJCMC04MjQ2MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQCA8PNjrxtTBQQdp/+MHlaqc1fEoaCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBBQUAAgUA5htmMDAiGA8yMDIyMDUwMzE2Mjgz
// SIG // MloYDzIwMjIwNTA0MTYyODMyWjB0MDoGCisGAQQBhFkK
// SIG // BAExLDAqMAoCBQDmG2YwAgEAMAcCAQACAhXdMAcCAQAC
// SIG // AhJOMAoCBQDmHLewAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAIFmnscVxLQuB
// SIG // /2TrOu3u+BXpDXskxn+dfGoOmvDlCy4bMdrsuM5xpMRb
// SIG // H4A+8v5hWvoI6WxlPia4i0sMGkp48IXeIY7dGbIhCj7m
// SIG // Bh86zHbQ+0lCPrOHihTYUB9EV9Qa9bweibyqIeEYU5yi
// SIG // X60WVzFe0C+FQb9oJNMeJ93MziwxggQNMIIECQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AYo+OI3SDgL66AABAAABijANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCDF4v9jdzIviQLDvGWfTTOJLlvk
// SIG // 7plGv8XIV066Gv864jCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIPS94Kt130q+fvO/fzD4MbWQhQaE7RHk
// SIG // OH6AkjlNVCm9MIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAGKPjiN0g4C+ugAAQAAAYow
// SIG // IgQg7vGIUmSyuLP25ViEAT3uTVRqbBQY2YiCcat3QcNH
// SIG // 5JwwDQYJKoZIhvcNAQELBQAEggIAQFjXrt9ZUPiiAbrM
// SIG // /aK644jYm4UW5tMztj2twCK2P+WVokCUJKiU0bHqmFCi
// SIG // U4odqzCg7q4RrzK8LysRIJbaGFNOLWlNNYAmIh/DZwPJ
// SIG // VN/U7rM1DgWnhVb2p+D9/agbTw+lA7ZdAinNEWH4qaJd
// SIG // Xp4HA5w+w6KbHojIDrJwXuZSbgDbHWi2On9wp3WrAYYG
// SIG // QtazyDzfUUuE4jKFDlR5iqi0Yy3lJeIj/RgmEKo38Z+H
// SIG // ypydGulzyEY9JjiKM6P60myzhVbku4jT1nInvWxG3OVq
// SIG // 9Iz0Mfc7gqXEtDpXAka2Py56wcKhLKwjgyZTk918MThD
// SIG // HQKqMJIun0xlkkbaiS6Fnl45sO4zSchD0DCmpfVqhEnC
// SIG // CBO7klH7eCpdJgmv7hUkfw9VZgduxahW5m8gH4X5X7As
// SIG // knooGryQhulgtQty1qMXpea4lK9agYs23L+iPOd4lDWH
// SIG // Xu4XAw0Bqnpe/DF1ghJWIjwAR2X09Aj37J74R8UPxEjA
// SIG // PPKB52ZVzaFr2CRAGgklBzoL/v9z4otw9VXHM5lisgkT
// SIG // o02G0QvnlCIJdkR5Isx8KVWbSAamxMWx0cmc16TOgnlf
// SIG // GDF5aeBppPEpxpENkTG0LXCLmUoS3dk6fkz3ggZuUX1u
// SIG // pvp/DZRY84zyQCu3o9LRyYm90/etPx6spidaJUmMIwq4
// SIG // zdsSXCo=
// SIG // End signature block
