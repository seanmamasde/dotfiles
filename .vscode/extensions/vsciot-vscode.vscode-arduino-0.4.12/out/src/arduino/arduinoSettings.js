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
exports.ArduinoSettings = void 0;
const os = require("os");
const path = require("path");
const WinReg = require("winreg");
const util = require("../common/util");
const platform_1 = require("../common/platform");
const vscodeSettings_1 = require("./vscodeSettings");
class ArduinoSettings {
    constructor() {
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = os.platform();
            this._commandPath = vscodeSettings_1.VscodeSettings.getInstance().commandPath;
            this._useArduinoCli = vscodeSettings_1.VscodeSettings.getInstance().useArduinoCli;
            yield this.tryResolveArduinoPath();
            yield this.tryGetDefaultBaudRate();
            yield this.tryGetDefaultTimestampFormat();
            if (platform === "win32") {
                yield this.updateWindowsPath();
                if (this._commandPath === "") {
                    this._useArduinoCli ? this._commandPath = "arduino-cli.exe" : this._commandPath = "arduino_debug.exe";
                }
            }
            else if (platform === "linux") {
                if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                    this._packagePath = path.join(this._arduinoPath, "portable");
                }
                else {
                    this._packagePath = path.join(process.env.HOME, ".arduino15");
                }
                if (this.preferences.get("sketchbook.path")) {
                    if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                        this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
                    }
                    else {
                        this._sketchbookPath = this.preferences.get("sketchbook.path");
                    }
                }
                else {
                    this._sketchbookPath = path.join(process.env.HOME, "Arduino");
                }
                if (this._commandPath === "" && !this._useArduinoCli) {
                    this._commandPath = "arduino";
                }
            }
            else if (platform === "darwin") {
                if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                    this._packagePath = path.join(this._arduinoPath, "portable");
                }
                else {
                    this._packagePath = path.join(process.env.HOME, "Library/Arduino15");
                }
                if (this.preferences.get("sketchbook.path")) {
                    if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                        this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
                    }
                    else {
                        this._sketchbookPath = this.preferences.get("sketchbook.path");
                    }
                }
                else {
                    this._sketchbookPath = path.join(process.env.HOME, "Documents/Arduino");
                }
                if (this._commandPath === "" && !this._useArduinoCli) {
                    this._commandPath = "/Contents/MacOS/Arduino";
                }
            }
        });
    }
    get arduinoPath() {
        return this._arduinoPath;
    }
    get defaultExamplePath() {
        if (os.platform() === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), "/Contents/Java/examples");
        }
        else {
            return path.join(this._arduinoPath, "examples");
        }
    }
    get packagePath() {
        return this._packagePath;
    }
    get defaultPackagePath() {
        if (os.platform() === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), "/Contents/Java/hardware");
        }
        else { // linux and win32.
            return path.join(this._arduinoPath, "hardware");
        }
    }
    get defaultLibPath() {
        if (os.platform() === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), "/Contents/Java/libraries");
        }
        else { // linux and win32
            return path.join(this._arduinoPath, "libraries");
        }
    }
    get commandPath() {
        const platform = os.platform();
        if (platform === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), path.normalize(this._commandPath));
        }
        else {
            return path.join(this._arduinoPath, path.normalize(this._commandPath));
        }
    }
    get sketchbookPath() {
        return this._sketchbookPath;
    }
    get preferencePath() {
        return path.join(this.packagePath, "preferences.txt");
    }
    get preferences() {
        if (!this._preferences) {
            this._preferences = util.parseConfigFile(this.preferencePath);
        }
        return this._preferences;
    }
    get useArduinoCli() {
        return this._useArduinoCli;
    }
    get defaultBaudRate() {
        return this._defaultBaudRate;
    }
    get defaultTimestampFormat() {
        return this._defaultTimestampFormat;
    }
    get analyzeOnSettingChange() {
        return vscodeSettings_1.VscodeSettings.getInstance().analyzeOnSettingChange;
    }
    reloadPreferences() {
        this._preferences = util.parseConfigFile(this.preferencePath);
        if (this.preferences.get("sketchbook.path")) {
            if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
            }
            else {
                this._sketchbookPath = this.preferences.get("sketchbook.path");
            }
        }
    }
    /**
     * For Windows platform, there are two situations here:
     *  - User change the location of the default *Documents* folder.
     *  - Use the windows store Arduino app.
     */
    updateWindowsPath() {
        return __awaiter(this, void 0, void 0, function* () {
            let folder;
            try {
                folder = yield util.getRegistryValues(WinReg.HKCU, "\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders", "Personal");
            }
            catch (ex) {
            }
            if (!folder) {
                folder = path.join(process.env.USERPROFILE, "Documents");
            }
            // For some case, docFolder parsed from win32 registry looks like "%USERPROFILE%\Documents,
            // Should replace the environment variables with actual value.
            folder = folder.replace(/%([^%]+)%/g, (match, p1) => {
                return process.env[p1];
            });
            if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                this._packagePath = path.join(this._arduinoPath, "portable");
            }
            else if (util.fileExistsSync(path.join(this._arduinoPath, "AppxManifest.xml"))) {
                this._packagePath = path.join(folder, "ArduinoData");
            }
            else {
                this._packagePath = path.join(process.env.LOCALAPPDATA, "Arduino15");
            }
            if (this.preferences.get("sketchbook.path")) {
                if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                    this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
                }
                else {
                    this._sketchbookPath = this.preferences.get("sketchbook.path");
                }
            }
            else {
                this._sketchbookPath = path.join(folder, "Arduino");
            }
        });
    }
    tryResolveArduinoPath() {
        return __awaiter(this, void 0, void 0, function* () {
            // Query arduino path sequentially from the following places such as "vscode user settings", "system environment variables",
            // "usual software installation directory for each os".
            // 1. Search vscode user settings first.
            const configValue = vscodeSettings_1.VscodeSettings.getInstance().arduinoPath;
            if (!configValue || !configValue.trim()) {
                // 2 & 3. Resolve arduino path from system environment variables and usual software installation directory.
                this._arduinoPath = yield Promise.resolve(platform_1.resolveArduinoPath());
            }
            else {
                this._arduinoPath = configValue;
            }
        });
    }
    tryGetDefaultBaudRate() {
        return __awaiter(this, void 0, void 0, function* () {
            const supportBaudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000];
            const configValue = vscodeSettings_1.VscodeSettings.getInstance().defaultBaudRate;
            if (!configValue || supportBaudRates.indexOf(configValue) === -1) {
                this._defaultBaudRate = 0;
            }
            else {
                this._defaultBaudRate = configValue;
            }
        });
    }
    tryGetDefaultTimestampFormat() {
        return __awaiter(this, void 0, void 0, function* () {
            const configValue = vscodeSettings_1.VscodeSettings.getInstance().defaultTimestampFormat;
            if (!configValue) {
                this._defaultTimestampFormat = "";
            }
            else {
                this._defaultTimestampFormat = configValue;
            }
        });
    }
}
exports.ArduinoSettings = ArduinoSettings;

//# sourceMappingURL=arduinoSettings.js.map

// SIG // Begin signature block
// SIG // MIInqAYJKoZIhvcNAQcCoIInmTCCJ5UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // wbQnccAPPQAtVxoDNaKU6xcPLUqs95hZE2zznmLA+K6g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGX8w
// SIG // ghl7AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHgCVF8WqrnJqLr+wlXB
// SIG // ljfeoxtaDWZ5QZxLFfAk4XzcMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAy92EQLG8Q8Jht3Xdca25jxUuh1gkICGX5yWb
// SIG // hw0K4VQzSJ0FY2FOK3Y326pMYwqPk71sBgVsveh8bW2X
// SIG // 94XBlDU/rh+sHWWsbbI2KbLiMhecBKdDoud7i542K3ui
// SIG // OfoPhRa0ZyhhhNCwZtNg/3Wv8TbC3B2p4HZiYrVr01W0
// SIG // XxGpmotJZmKi47wUUl41daXIzxpnXVAeNzeNHvGRJPSh
// SIG // 14I6I7E2+zkry/+YzigWnNXZld7m7PhrYIG9eIKfFRP8
// SIG // gqeZWPHorUXFhP4XMcPS41vEKJyymPB0Nhc1qiKqsHo6
// SIG // +TSCmH1Kei5h9MLLeLeYeSbsmvRk+fJoEDoU1IBLqaGC
// SIG // FwkwghcFBgorBgEEAYI3AwMBMYIW9TCCFvEGCSqGSIb3
// SIG // DQEHAqCCFuIwghbeAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCCuEIg7
// SIG // 9coTA5PfN1iK85udFtaGopG4JZ2BosW5wtjZmwIGYmtH
// SIG // bAUbGBMyMDIyMDUwMzE5MDEwNy42OTlaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RjdBNi1F
// SIG // MjUxLTE1MEExJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghFcMIIHEDCCBPigAwIBAgIT
// SIG // MwAAAaUA3gjEQAdxTgABAAABpTANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MjAzMDIxODUxMTlaFw0yMzA1MTExODUxMTlaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046RjdBNi1FMjUxLTE1MEEx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQC6sYboIGpIvMLqDjDHe67BEJ5gIbVfIlNWNIrb
// SIG // B6t9E3QlyQ5r2Y2mfMrzh2BVYU8g9W+SRibcGY1s9X4J
// SIG // QqrMeagcT9VsdQmZ7ENbYkbEVkHNdlZBE5pGPMeOjIB7
// SIG // BsgJoTz6bIEZ5JRmoux6kBQd9cf0I5Me62wJa+j25QeL
// SIG // TpmkdZysZeFSILLQ8H53imqBBMOIjf8U3c7WY8MhomOY
// SIG // Taem3nrZHIs4CRTt/8kR2IdILZPm0RIa5iIG2q664G8+
// SIG // zLJwO7ZSrxnDvYh3OvtrMpqwFctws0OCDDTxXE08fME2
// SIG // fpKb+pRbNXhvMZX7LtjQ1irIazJSh9iaWM1gFtXwjg+Y
// SIG // q17BOCzr4sWUL253kBOvohnyEMGm4/n0XaLgFNgIhPom
// SIG // jbCA2qXSmm/Fi8c+lT0WxC/jOjBZHLKIrihx6LIQqeyY
// SIG // ZmfYjNMqxMdl3mzoWv10N+NirERrNodNoKV+sAcsk/Hg
// SIG // 9zCVSMUkZuDCyIpb1nKXfTd66KGsGy1OoHZO4KClkuvf
// SIG // sNo7aLlwhGLeiD32avJXYtC/wsGG7b+5mx5iGfTnNCRC
// SIG // XOm/YHFQ36D4npjCnM9eQS3qcse56UNjIgyiLHDqioV7
// SIG // mSPj2XqzTh4Yv77MtvxY/ZQepCazGEn1dBdn67wUgVzA
// SIG // e8Y7/KYKl+UF1HvJ08W+FHydHAwLwQIDAQABo4IBNjCC
// SIG // ATIwHQYDVR0OBBYEFF+mjwMAl66urXDu+9xZF0toqRrf
// SIG // MB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
// SIG // MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBs
// SIG // BggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAJab
// SIG // CxflMDCihEdqdFiZ6OBuhhhp34N6ow3Wh3Obr12LRuip
// SIG // h66gH/2Kh5JjaLUq+mRBJ5RgiWEe1t7ifuW6b49N8Bah
// SIG // nn70LCiEdvquk686M7z+DbKHVk0+UlafwukxAxriwvZj
// SIG // kCgOLci+NB01u7cW9HAHX4J8hxaCPwbGaPxWl3s0PITu
// SIG // MVI4Q6cjTXielmL1+TQvh7/Z5k8s46shIPy9nFwDpsRF
// SIG // r3zwENZX8b67VMBu+YxnlGnsJIcLc2pwpz95emI8CRSg
// SIG // ep+/017a34pNcWNZIHr9ScEOWlHT8cEnQ5hhOF0zdrOq
// SIG // TzovCDtffTn+gBL4eNXg8Uc/tdVVHKbhp+7SVHkk1Eh7
// SIG // L80PBAjo+cO+zL+efxfIVrtO3oJxvEq1o+fkxcTTwqcf
// SIG // wBTb88/qHU0U2XeC1rqJnDB1JixYlBjgHXrRekqHxxuR
// SIG // HBZ9A0w9WqQWcwj/MbBkHGYMFaqO6L9t/7iCZTAiwMk2
// SIG // GVfSEwj9PXIlCWygVQkDaxhJ0P1yxTvZsrMsg0a7x4VO
// SIG // bhj3V8+Cbdv2TeyUGEblTUrgqTcKCtCa9bOnIg7xxHi8
// SIG // onM8aCHvRh90sn2x8er/6YSPohNw1qNUwiu+RC+qbepO
// SIG // Yt+v5J9rklV3Ux+OGVZId/4oVd7xMLO/Lhpb7IjHKygY
// SIG // KaNx3XIwx4h6FrFH+BiMMIIHcTCCBVmgAwIBAgITMwAA
// SIG // ABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgz
// SIG // MjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOTh
// SIG // pkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2
// SIG // AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYj
// SIG // DLWNE893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFE
// SIG // yHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2
// SIG // vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6O
// SIG // U8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUo
// SIG // veO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvr
// SIG // g0XnRm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdb
// SIG // Z2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZ
// SIG // nkXftnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZN
// SIG // N3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEz
// SIG // OUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMY
// SIG // ctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5
// SIG // C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6
// SIG // bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17a
// SIG // j54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkr
// SIG // BgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQq
// SIG // p1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cV
// SIG // XQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwr
// SIG // BgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1Jl
// SIG // cG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
// SIG // DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQY
// SIG // MBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRP
// SIG // ME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYI
// SIG // KwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3h
// SIG // LB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnX
// SIG // wnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03d
// SIG // mLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27Y
// SIG // P0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfak
// SIG // Vqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8
// SIG // F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4s
// SIG // a3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6
// SIG // MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1A
// SIG // PMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lU
// SIG // ZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtq
// SIG // RRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4K
// SIG // u+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLB
// SIG // gqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr
// SIG // 4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvp
// SIG // e784cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQ
// SIG // tB1VM1izoXBm8qGCAs8wggI4AgEBMIH8oYHUpIHRMIHO
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQG
// SIG // A1UECxMdVGhhbGVzIFRTUyBFU046RjdBNi1FMjUxLTE1
// SIG // MEExJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVALPJcNtFs5sQ
// SIG // yojdS4Ye5mVl7rSooIGDMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDm
// SIG // G7SLMCIYDzIwMjIwNTAzMTgwMjUxWhgPMjAyMjA1MDQx
// SIG // ODAyNTFaMHQwOgYKKwYBBAGEWQoEATEsMCowCgIFAOYb
// SIG // tIsCAQAwBwIBAAICELkwBwIBAAICErswCgIFAOYdBgsC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQA14LFUIBLHAq2OiUvmnTWdBRtu5WJE
// SIG // 3IuIrLNGAzDvAG9x7ZHSmTiqvIceKfCeANrUHnJp/Orm
// SIG // 5ATQrlFEMvXnef8OwtIB74Vlx9Oqn1QpMYivHGWleUry
// SIG // U5K26mvpmD6RL1LD+NZtertIXIyaJgmUwoWyCY4Q0bhc
// SIG // y+6izYzGLDGCBA0wggQJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABpQDeCMRAB3FOAAEA
// SIG // AAGlMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IDewmTlAPUO0tmaw0N0SE6FODlp6fx/1Ssaz3vgvMp5s
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQguAo4
// SIG // cX5mBLGgrdgFPNyoYfuiR5cpNwe9L3zBzJQS3FwwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAaUA3gjEQAdxTgABAAABpTAiBCCxasnc2785Sh0s
// SIG // WRLLRS6vo+icQ91TWxJvaFXPRVNIgDANBgkqhkiG9w0B
// SIG // AQsFAASCAgAN3Od3x7/VMA3bMDuGsIphRJo3AZFVXW4y
// SIG // XXBapWhR2HQdkpFdiqLKoH/OZdHms9j8Qosi3gtPiYDq
// SIG // 4vGgHqw1grV2Rq9eX3DiSeGujApovS9ws0l+nr2Y2URw
// SIG // HIauhqRll0/dWSobdN0KzdLWH4GOUCDbao1KL8N7JJpk
// SIG // StvAj06EM9+f4bUOA2RqnZLzAuTEU5/4B9ygKcfEBVyx
// SIG // sWvzIIiqV3laAeSYtJUci9loqQplGSzGqpNz5qm45Bau
// SIG // ayf6xK7eUxuoV3x2MAGuHQ7TC72MiyQdg6iebvHDkAsn
// SIG // n96w172wAowhEEN5mo4ff4dbdQFMy9lILZp+eC1yDPwc
// SIG // v2S74XgtJshdTi0pzMhDQjs3pSfV4uGbmfUtN1+CJ0yi
// SIG // JoQhAnVl5eFqbFoPP2+0Wtvkf01iyFr3UIFinuFIjUl0
// SIG // ve/boiX9qJTO0iO28vSo7+tvQJhRz232RXrHotvQn3+v
// SIG // gjIf4Rb9T/V7RH8QMMP9YqgvaJUZrcDwPFnYZBlWL51v
// SIG // E9T5Ii+tU6AloUusCSDFeIDiCAtB1exVwxkdHQFVsMKs
// SIG // /sNseGRMefMRXmbYE0FVX7pP41qumEQAWswt3Ie+sKye
// SIG // S9mxQ1h1TDMesz0duexiSRpSt2oVjELaTUNdQiWhffvw
// SIG // 1Stp76mtcBJW15uvH2F3DJjrlvvk8VoKIA==
// SIG // End signature block
