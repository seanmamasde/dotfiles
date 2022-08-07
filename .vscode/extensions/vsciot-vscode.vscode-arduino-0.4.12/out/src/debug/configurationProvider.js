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
exports.ArduinoDebugConfigurationProvider = void 0;
const path = require("path");
const vscode = require("vscode");
const arduino_1 = require("../arduino/arduino");
const arduinoActivator_1 = require("../arduinoActivator");
const arduinoContext_1 = require("../arduinoContext");
const vscodeSettings_1 = require("../arduino/vscodeSettings");
const constants = require("../common/constants");
const platform = require("../common/platform");
const util = require("../common/util");
const workspace_1 = require("../common/workspace");
const deviceContext_1 = require("../deviceContext");
const Logger = require("../logger/logger");
class ArduinoDebugConfigurationProvider {
    constructor() { }
    provideDebugConfigurations(folder, token) {
        return [
            this.getDefaultDebugSettings(folder),
        ];
    }
    // Try to add all missing attributes to the debug configuration being launched.
    resolveDebugConfiguration(folder, config, token) {
        if (!config || !config.request) {
            config = this.getDefaultDebugSettings(folder);
        }
        return this.resolveDebugConfigurationAsync(config);
    }
    getDefaultDebugSettings(folder) {
        return {
            name: "Arduino",
            type: "arduino",
            request: "launch",
            program: "${file}",
            cwd: "${workspaceFolder}",
            MIMode: "gdb",
            targetArchitecture: "arm",
            miDebuggerPath: "",
            debugServerPath: "",
            debugServerArgs: "",
            customLaunchSetupCommands: [
                {
                    text: "target remote localhost:3333",
                },
                {
                    text: "file \"${file}\"",
                },
                {
                    text: "load",
                },
                {
                    text: "monitor reset halt",
                },
                {
                    text: "monitor reset init",
                },
            ],
            stopAtEntry: true,
            serverStarted: "Info\\ :\\ [\\w\\d\\.]*:\\ hardware",
            launchCompleteCommand: "exec-continue",
            filterStderr: true,
            args: [],
        };
    }
    resolveDebugConfigurationAsync(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContext_1.default.initialized) {
                yield arduinoActivator_1.default.activate();
            }
            if (vscodeSettings_1.VscodeSettings.getInstance().logLevel === constants.LogLevel.Verbose && !config.logging) {
                config = Object.assign(Object.assign({}, config), { logging: {
                        engineLogging: true,
                    } });
            }
            if (!arduinoContext_1.default.boardManager.currentBoard) {
                vscode.window.showErrorMessage("Please select a board.");
                return undefined;
            }
            if (!this.resolveOpenOcd(config)) {
                return undefined;
            }
            if (!(yield this.resolveOpenOcdOptions(config))) {
                return undefined;
            }
            if (!this.resolveDebuggerPath(config)) {
                return undefined;
            }
            if (!(yield this.resolveProgramPath(config))) {
                return undefined;
            }
            // Use the C++ debugger MIEngine as the real internal debugger
            config.type = "cppdbg";
            const dc = deviceContext_1.DeviceContext.getInstance();
            Logger.traceUserData("start-cppdbg", { board: dc.board });
            return config;
        });
    }
    resolveProgramPath(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = deviceContext_1.DeviceContext.getInstance();
            if (!config.program || config.program === "${file}") {
                const outputFolder = path.join(dc.output || `.build`);
                const outputPath = path.join(workspace_1.ArduinoWorkspace.rootPath, outputFolder);
                // if the directory was already there, clear the folder so that it's not corrupted from previous builds.
                if (util.directoryExistsSync(outputPath)) {
                    util.rmdirRecursivelySync(outputPath);
                }
                util.mkdirRecursivelySync(outputPath);
                if (!dc.sketch || !util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch))) {
                    yield dc.resolveMainSketch();
                }
                if (!dc.sketch) {
                    vscode.window.showErrorMessage("No sketch file was found. Please specify the sketch in the arduino.json file");
                    return false;
                }
                if (!util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch))) {
                    vscode.window.showErrorMessage(`Cannot find ${dc.sketch}, Please specify the sketch in the arduino.json file`);
                    return false;
                }
                config.program = path.join(outputPath, `${path.basename(dc.sketch)}.elf`);
                // always compile elf to make sure debug the right elf
                if (!(yield arduinoContext_1.default.arduinoApp.build(arduino_1.BuildMode.Verify, outputFolder))) {
                    vscode.window.showErrorMessage("Failed to verify the program, please check the output for details.");
                    return false;
                }
                config.program = config.program.replace(/\\/g, "/");
                config.customLaunchSetupCommands.forEach((obj) => {
                    if (obj.text && obj.text.indexOf("${file}") > 0) {
                        obj.text = obj.text.replace(/\$\{file\}/, config.program);
                    }
                });
            }
            if (!util.fileExistsSync(config.program)) {
                vscode.window.showErrorMessage("Cannot find the elf file.");
                return false;
            }
            return true;
        });
    }
    resolveDebuggerPath(config) {
        if (!config.miDebuggerPath) {
            config.miDebuggerPath = platform.findFile(platform.getExecutableFileName("arm-none-eabi-gdb"), path.join(arduinoContext_1.default.arduinoApp.settings.packagePath, "packages", arduinoContext_1.default.boardManager.currentBoard.getPackageName()));
        }
        if (!util.fileExistsSync(config.miDebuggerPath)) {
            config.miDebuggerPath = arduinoContext_1.default.debuggerManager.miDebuggerPath;
        }
        if (!util.fileExistsSync(config.miDebuggerPath)) {
            vscode.window.showErrorMessage("Cannot find the debugger path.");
            return false;
        }
        return true;
    }
    resolveOpenOcd(config) {
        if (!config.debugServerPath) {
            config.debugServerPath = platform.findFile(platform.getExecutableFileName("openocd"), path.join(arduinoContext_1.default.arduinoApp.settings.packagePath, "packages", arduinoContext_1.default.boardManager.currentBoard.getPackageName()));
        }
        if (!util.fileExistsSync(config.debugServerPath)) {
            config.debugServerPath = arduinoContext_1.default.debuggerManager.debugServerPath;
        }
        if (!util.fileExistsSync(config.debugServerPath)) {
            vscode.window.showErrorMessage("Cannot find the OpenOCD from the launch.json debugServerPath property." +
                "Please input the right path of OpenOCD");
            return false;
        }
        return true;
    }
    resolveOpenOcdOptions(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.debugServerPath && !config.debugServerArgs) {
                try {
                    config.debugServerArgs = yield arduinoContext_1.default.debuggerManager.resolveOpenOcdOptions(config);
                    if (!config.debugServerArgs) {
                        return false;
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage(error.message);
                    return false;
                }
            }
            return true;
        });
    }
}
exports.ArduinoDebugConfigurationProvider = ArduinoDebugConfigurationProvider;

//# sourceMappingURL=configurationProvider.js.map

// SIG // Begin signature block
// SIG // MIIntQYJKoZIhvcNAQcCoIInpjCCJ6ICAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // R6pSSLTnyOCklKhqN2t3vOfagJMAJJxZEo3ZDQslXsKg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIDoA30PDTLu9TPUzKiMn
// SIG // dIsXk+8tpz01Gdaz4gTXHuCHMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEABVU/B5mzMZnZG2esPt4njwXJPAIqp4Hxie4Q
// SIG // BmzgrOAL/Mv0Xq0S8Z2J00B8eRVeSHGMcRf2uMbe42d7
// SIG // MriEJ3XzMBI/gVPknUCK6D/DaGYQaN/BM1sbvAMsz20f
// SIG // TL60FcE+Tnk4741XiRfGbRk2eMpow0LUqPTq1sHMgr/U
// SIG // dGjIhf9d5Ys6hlXqM5hMoU1bsltRfgVz3C8gxNX6eY7H
// SIG // f188dUmd3gzM0ylDZs4SmjRKct7QhLGu0Rwx8pPYW4E9
// SIG // kw4ETzmu7al92iHgi+9iP6ApH1lpP9HqxBHZ+d/Z+L69
// SIG // pBBscjvxW9PVdf0tj87yTnFtLzTlHfml6/l1Vcg8aKGC
// SIG // FxYwghcSBgorBgEEAYI3AwMBMYIXAjCCFv4GCSqGSIb3
// SIG // DQEHAqCCFu8wghbrAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBdEaQ6
// SIG // GFcIF+03ExsyI8aj2FwyJwBQNeABvqTSRMbeIQIGYmxD
// SIG // irOCGBMyMDIyMDUwMzE5MDEwOC42MDhaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjJB
// SIG // RDQtNEI5Mi1GQTAxMSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIRZTCCBxQwggT8oAMC
// SIG // AQICEzMAAAGGeOUZifgkS8wAAQAAAYYwDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjExMDI4MTkyNzM5WhcNMjMwMTI2MTkyNzM5WjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjoyQUQ0LTRC
// SIG // OTItRkEwMTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggIPADCCAgoCggIBAMCNxtlqb+geCIwH64HyaZ3Tzj2D
// SIG // tWHfPr5X6CMTFt4HQg0/syG2n4NeKTrtLdHpFEMetKez
// SIG // 2nR+Do56jSBNaupXR/Z7Y9YCHZeB6uK3RB02eiRXRNuA
// SIG // 0m1aKqkfkeCMOMNxj233NkN5H8shco/gzoZglsPxWYk1
// SIG // U5U+G3Xo8gFuq/yZ+H698S4274SE2ra9+lcss4ENGOFq
// SIG // +9x94FHC42LtKoh7rQw2+vqfsgwRpihc5zlvMFbew/rt
// SIG // lRCaBOiZStBKVS2brHUs4XnLlMCV8W9rsoAGV5bGv3x5
// SIG // cFvWJ5QajByfopvR7iuV+MfP+QeXZLiKF+ZVhoxTGw9g
// SIG // Oi7vz5lAeIStAheRtWGlLQazBO9wwCpMqZO0hJtwZSV8
// SIG // GPxq1aF1mFBhB8n65C5MLNEaBDKaCBIHm2TSqo0cp0SY
// SIG // EeHzwiqxIcBIk0wHOA1xnIuBxzpuuBENYP0gxzBaiClU
// SIG // saFG5Bm3SjSh4ZmobiKwMuMHvbO62SbJL3mWGYg5rQLQ
// SIG // bf4EKI8W2dbzvQtdUrYZK5pJEzC0H/XA85VRAXruiph1
// SIG // 9ks3uoIJ3tyOHMv+SFC5x2d6zOGaSXNLNiqRix2laxEM
// SIG // uMf5gJ+MmmH4Hh9zBAFpFY8v6kw4enAwhf4Ms902kA7b
// SIG // xZwCu9C6rWxLwT3QaXghv4ZPZdJWmM8IsshmPx6jAgMB
// SIG // AAGjggE2MIIBMjAdBgNVHQ4EFgQUGbajRQPvZnRLv4d9
// SIG // 1IRzDesIXC4wHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcw
// SIG // AoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsF
// SIG // AAOCAgEAw+5noSWN30xyguIY/sAVgfOeOLmiYjDCB54S
// SIG // vTjUzO1a2k2M8dFP03CyeoMcNbUczObrvJLMCTZRzae0
// SIG // XnbAIsL4lUGVfQC/CG2USyU8DXoQsJPgVXGNoId2RmZs
// SIG // fLmrT2a0bnsoYU0w9j7xVS638IdpYgxv3RDzSB0yo+/Q
// SIG // 5RHDyFqDglKe6dDkTMEPeZFWom6V/Pab44T5dhZtAgTt
// SIG // 6V1yYNG8naUOXQw07/6m9PlmBf7zVRFPzKDBEKpVFlrl
// SIG // xAk6sek2sibiyerlOyuUMk5EP5duCIRow83+QBGTqyDW
// SIG // M5FlcjX1DqSMZyrFkwTdoo6Wf07p+aq5qPbzSA09JaG4
// SIG // J7pWntezWhDvaIhCSR9bUN+d3YbkYvgNND0e/NYmJcxe
// SIG // SVNQ6xHxMjcfAloBEYvdCyrGIIWQQg40Nw4iY31GS6jj
// SIG // Xh6yX3Joc+f235vPmgGlD6WRXj9INCKJ3elzZOGImG1j
// SIG // xaKH3NC8HKkgC7biAMs+n93flGmWbKeNVOIQiKBo+oaA
// SIG // yLlPN/W6P5mfwIBEsBsSF7NIGVOgPtqiFHutEHQPevcF
// SIG // ks7nCjorJ4PRwkmSxdXanN0FGsK9AtFONe/OCqPb3JAB
// SIG // t2pMGLlRnLOoTP0qhIaHvYx8HuF6fNQq0wdZffhCHbpA
// SIG // mz9JMs8dFmc7Xnogzea3YokEfZgSbpYwggdxMIIFWaAD
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
// SIG // OjJBRDQtNEI5Mi1GQTAxMSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQABrtg0c1pCpY5l8kl9ZKKxy+HzJ6CBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBBQUAAgUA5htfFjAiGA8yMDIyMDUwMzE1NTgx
// SIG // NFoYDzIwMjIwNTA0MTU1ODE0WjB0MDoGCisGAQQBhFkK
// SIG // BAExLDAqMAoCBQDmG18WAgEAMAcCAQACAg3EMAcCAQAC
// SIG // AhH8MAoCBQDmHLCWAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAfW49c7UusCMm
// SIG // +N/eZRw/XUWIS+RY+BVBLb1tfKn7S4tpnLhXsxivnzm/
// SIG // JZhwG+IlxDarMW+6vroYRMCtm7FtVMTTcAb5bIKtR18C
// SIG // 8X6NaGLV2BcDAZwseX+6+iqBsgAp7YyB94k26p4XXiXg
// SIG // 6VAM4ojILsLAJ7ozRe8TJSOcgLYxggQNMIIECQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AYZ45RmJ+CRLzAABAAABhjANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCDFyccBSCsHQzw0nUrcS7Ej1lqr
// SIG // bDhw+Fg82RD/3GzGdzCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIBqZiOCyLAhUxomMn0QEe5uxWtoLsVTS
// SIG // MNe5nAIqvEJ+MIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAGGeOUZifgkS8wAAQAAAYYw
// SIG // IgQgdrE06rFJ08IWroBgFK+n0BaP2J2cgCpKLI3J6TVl
// SIG // wdIwDQYJKoZIhvcNAQELBQAEggIAFiXXQIHKVxm1PE39
// SIG // C3RavpOs4clvgC3GknesfJwQNm7F3CdBruQPYS0G9YFV
// SIG // uOlXpWK3MXshXywJspHE/jYzSDh+4kdRJgQ5r/v8Ljrr
// SIG // hpJ9w3kCqP2mQLdL+F7bWJeAQj7mjDe/7Nbu/NhDCHZW
// SIG // QWHo4OWWlPcHxv9w6nPZBfl4gK1MNRtZAIhvxZ/xuUcs
// SIG // wmxezVuRer9BruVkWGYGnz3qSO0Ilc+C2L6PMCBh4Lbb
// SIG // /EIHeUGJ0zsAVGzH3Xmn/h4VcQr4s1sI6KdVpOEdH9TO
// SIG // JamIv/iYDkdvzAasDs6wWBOT3NtXIlApsdikMqEtWoKB
// SIG // A8+ZtSmNjl8ZaR54Mipnz4lg33MjhrVNLziQZ3wNr718
// SIG // Kua4GqORbanGXJXDujPMbf64fXxX6j2VQFpA+jZa23pL
// SIG // 7rTJ/7jcVNe/gfF+7qe7DI+1pFUyQ+BgkQST41RhNVw0
// SIG // vnBbewcvJY+OCzyA+8dZ7r8TOjDZScBG44QsnOiSa+CY
// SIG // TnL0RHlLSd/4AyBMWsQIn4EAmjCvX/p59Da7BKtPrPSK
// SIG // Yw3QT1YhVlRTL9h54LwwzjsP9bo7+K8miaeU95cH1EVe
// SIG // /8FiNFUCHZSvNA4F4xyf9PE4eWlDbn7FH1owFH3QsHVR
// SIG // +17YcA0fsd1bGe0XC1a3ZCncAmqInnNBlCBy154DvKvf
// SIG // sZF3sR8=
// SIG // End signature block
