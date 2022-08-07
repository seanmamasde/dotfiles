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
exports.DeviceContext = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const constants = require("./common/constants");
const util = require("./common/util");
const constants_1 = require("./common/constants");
const workspace_1 = require("./common/workspace");
const deviceSettings_1 = require("./deviceSettings");
class DeviceContext {
    /**
     * @constructor
     */
    constructor() {
        this._settings = new deviceSettings_1.DeviceSettings();
        this._suppressSaveContext = false;
        if (vscode.workspace && workspace_1.ArduinoWorkspace.rootPath) {
            this._watcher = vscode.workspace.createFileSystemWatcher(path.join(workspace_1.ArduinoWorkspace.rootPath, constants_1.ARDUINO_CONFIG_FILE));
            // We only care about the deletion arduino.json in the .vscode folder:
            this._vscodeWatcher = vscode.workspace.createFileSystemWatcher(path.join(workspace_1.ArduinoWorkspace.rootPath, ".vscode"), true, true, false);
            this._watcher.onDidCreate(() => this.loadContext());
            this._watcher.onDidChange(() => this.loadContext());
            this._watcher.onDidDelete(() => this.loadContext());
            this._vscodeWatcher.onDidDelete(() => this.loadContext());
            this._sketchStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, constants.statusBarPriority.SKETCH);
            this._sketchStatusBar.command = "arduino.selectSketch";
            this._sketchStatusBar.tooltip = "Sketch File";
        }
    }
    static getInstance() {
        return DeviceContext._deviceContext;
    }
    dispose() {
        if (this._watcher) {
            this._watcher.dispose();
        }
        if (this._vscodeWatcher) {
            this._vscodeWatcher.dispose();
        }
    }
    get extensionPath() {
        return this._extensionPath;
    }
    set extensionPath(value) {
        this._extensionPath = value;
    }
    /**
     * TODO: Current we use the Arduino default settings. For future release, this dependency might be removed
     * and the setting only depends on device.json.
     * @method
     *
     * TODO EW, 2020-02-18:
     * A problem I discovered: here you try to find the config file location
     * and when you're writing below, you use a hard-coded location. When
     * resorting to "find", you have to store the file's location at least and
     * reuse it when saving.
     * But I think the intention is: load a config file from anywhere and save
     * it under .vscode/arduino.json. But then the initial load has to use find
     * and afterwards it must not use find anymore.
     */
    loadContext() {
        return vscode.workspace.findFiles(constants_1.ARDUINO_CONFIG_FILE, null, 1)
            .then((files) => {
            if (files && files.length > 0) {
                this._settings.load(files[0].fsPath);
                // on invalid configuration we continue with current settings
            }
            else {
                // No configuration file found, starting over with defaults
                this._settings.reset();
            }
            return this;
        }, (reason) => {
            // Workaround for change in API.
            // vscode.workspace.findFiles() for some reason now throws an error ehn path does not exist
            // vscode.window.showErrorMessage(reason.toString());
            // Logger.notifyUserError("arduinoFileUnhandleError", new Error(reason.toString()));
            // Workaround for change in API, populate required props for arduino.json
            this._settings.reset();
            return this;
        });
    }
    showStatusBar() {
        if (!this._settings.sketch.value) {
            return false;
        }
        this._sketchStatusBar.text = this._settings.sketch.value;
        this._sketchStatusBar.show();
    }
    get onChangePort() { return this._settings.port.emitter.event; }
    get onChangeBoard() { return this._settings.board.emitter.event; }
    get onChangeSketch() { return this._settings.sketch.emitter.event; }
    get onChangeOutput() { return this._settings.output.emitter.event; }
    get onChangeDebugger() { return this._settings.debugger.emitter.event; }
    get onChangeISAutoGen() { return this._settings.intelliSenseGen.emitter.event; }
    get onChangeConfiguration() { return this._settings.configuration.emitter.event; }
    get onChangePrebuild() { return this._settings.prebuild.emitter.event; }
    get onChangePostbuild() { return this._settings.postbuild.emitter.event; }
    get onChangeProgrammer() { return this._settings.programmer.emitter.event; }
    get port() {
        return this._settings.port.value;
    }
    set port(value) {
        this._settings.port.value = value;
        this.saveContext();
    }
    get board() {
        return this._settings.board.value;
    }
    set board(value) {
        this._settings.board.value = value;
        this.saveContext();
    }
    get sketch() {
        return this._settings.sketch.value;
    }
    set sketch(value) {
        this._settings.sketch.value = value;
        this.saveContext();
    }
    get prebuild() {
        return this._settings.prebuild.value;
    }
    get postbuild() {
        return this._settings.postbuild.value;
    }
    get output() {
        return this._settings.output.value;
    }
    set output(value) {
        this._settings.output.value = value;
        this.saveContext();
    }
    get debugger_() {
        return this._settings.debugger.value;
    }
    set debugger_(value) {
        this._settings.debugger.value = value;
        this.saveContext();
    }
    get intelliSenseGen() {
        return this._settings.intelliSenseGen.value;
    }
    set intelliSenseGen(value) {
        this._settings.intelliSenseGen.value = value;
        this.saveContext();
    }
    get configuration() {
        return this._settings.configuration.value;
    }
    set configuration(value) {
        this._settings.configuration.value = value;
        this.saveContext();
    }
    get programmer() {
        return this._settings.programmer.value;
    }
    set programmer(value) {
        this._settings.programmer.value = value;
        this.saveContext();
    }
    get suppressSaveContext() {
        return this._suppressSaveContext;
    }
    set suppressSaveContext(value) {
        this._suppressSaveContext = value;
    }
    get buildPreferences() {
        return this._settings.buildPreferences.value;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (workspace_1.ArduinoWorkspace.rootPath && util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, constants_1.ARDUINO_CONFIG_FILE))) {
                vscode.window.showInformationMessage("Arduino.json already generated.");
                return;
            }
            else {
                if (!workspace_1.ArduinoWorkspace.rootPath) {
                    vscode.window.showInformationMessage("Please open a folder first.");
                    return;
                }
                yield this.resolveMainSketch();
                if (this.sketch) {
                    yield vscode.commands.executeCommand("arduino.changeBoardType");
                    vscode.window.showInformationMessage("The workspace is initialized with the Arduino extension support.");
                }
                else {
                    vscode.window.showInformationMessage("No sketch (*.ino or *.cpp) was found or selected - initialization skipped.");
                }
            }
        });
    }
    /**
     * Note: We're using the class' setter for the sketch (i.e. this.sketch = ...)
     * to make sure that any changes are synched to the configuration file.
     */
    resolveMainSketch() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO (EW, 2020-02-18): Here you look for *.ino files but below you allow
            //  *.cpp/*.c files to be set as sketch
            yield vscode.workspace.findFiles("**/*.ino", null)
                .then((fileUris) => __awaiter(this, void 0, void 0, function* () {
                if (fileUris.length === 0) {
                    let newSketchFileName = yield vscode.window.showInputBox({
                        value: "sketch.ino",
                        prompt: "No sketch (*.ino) found in workspace, please provide a name",
                        placeHolder: "Sketch file name (*.ino or *.cpp)",
                        validateInput: (value) => {
                            if (value && /^[\w-]+\.(?:ino|cpp)$/.test(value.trim())) {
                                return null;
                            }
                            else {
                                return "Invalid sketch file name. Should be *.ino/*.cpp";
                            }
                        },
                    });
                    newSketchFileName = (newSketchFileName && newSketchFileName.trim()) || "";
                    if (newSketchFileName) {
                        const snippets = fs.readFileSync(path.join(this.extensionPath, "snippets", "sample.ino"));
                        fs.writeFileSync(path.join(workspace_1.ArduinoWorkspace.rootPath, newSketchFileName), snippets);
                        this.sketch = newSketchFileName;
                        // Set a build directory in new configurations to avoid warnings about slow builds.
                        this.output = "build";
                        // Open the new sketch file.
                        const textDocument = yield vscode.workspace.openTextDocument(path.join(workspace_1.ArduinoWorkspace.rootPath, newSketchFileName));
                        vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One, true);
                    }
                    else {
                        this.sketch = undefined;
                    }
                }
                else if (fileUris.length === 1) {
                    this.sketch = path.relative(workspace_1.ArduinoWorkspace.rootPath, fileUris[0].fsPath);
                }
                else if (fileUris.length > 1) {
                    const chosen = yield vscode.window.showQuickPick(fileUris.map((fileUri) => {
                        return {
                            label: path.relative(workspace_1.ArduinoWorkspace.rootPath, fileUri.fsPath),
                            description: fileUri.fsPath,
                        };
                    }), { placeHolder: "Select the main sketch file" });
                    if (chosen && chosen.label) {
                        this.sketch = chosen.label;
                    }
                }
            }));
            return this.sketch;
        });
    }
    saveContext() {
        if (!workspace_1.ArduinoWorkspace.rootPath) {
            return;
        }
        const deviceConfigFile = path.join(workspace_1.ArduinoWorkspace.rootPath, constants_1.ARDUINO_CONFIG_FILE);
        this._settings.save(deviceConfigFile);
    }
}
exports.DeviceContext = DeviceContext;
DeviceContext._deviceContext = new DeviceContext();

//# sourceMappingURL=deviceContext.js.map

// SIG // Begin signature block
// SIG // MIIntQYJKoZIhvcNAQcCoIInpjCCJ6ICAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4CjRt6xPbwlUccu2uwMKOa8YXmM1lVplcqIsoBxWviWg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIJ5KRC9SaQsJNrnNRdCS
// SIG // iZC02abKIuMhgO9wkmcYC3VfMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAtHcJMsdPkT1g3ntBGGrLZy8QmTO/fWDh/OqA
// SIG // hEtfBfKthDqmOPh2jjJ7BZeuvHX0Ye44bYi5ELg0u4/F
// SIG // cTL9qMYC4whsB4o5Ip8elzxkBMk/5Vp7SdXwV2yZvFn3
// SIG // oS8Y8LzHzM7DF2zJOG+sw+I7g5U4xV1OeV6fA3wBbxod
// SIG // xAw+BxduERO1zzBg4TbipyYzSxXUsc3kHDkDnhrTxAED
// SIG // ydwDOabZ2mpg2nqPiYnc7tjsawX1yzYlpXfIPizW/sDx
// SIG // XEM5tb3U9AfJSap3eyPam2cPYW1jQfy4elMT6ym6a+0o
// SIG // EPhjAoZ5XzWjD9xNYCcOD6b2Rvt5Wy2omlAWcENijaGC
// SIG // FxYwghcSBgorBgEEAYI3AwMBMYIXAjCCFv4GCSqGSIb3
// SIG // DQEHAqCCFu8wghbrAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCAMPijG
// SIG // BJuAc93u2BP4/RYxmI4hxE636DOgjOjrnzEhewIGYmxD
// SIG // irOSGBMyMDIyMDUwMzE5MDEwOC44MjlaMASAAgH0oIHY
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
// SIG // CSqGSIb3DQEJBDEiBCC1C4vB2uMRIDPm+OAcmgqNLDGO
// SIG // OCRUnFNq2pM+ayFTCzCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIBqZiOCyLAhUxomMn0QEe5uxWtoLsVTS
// SIG // MNe5nAIqvEJ+MIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAGGeOUZifgkS8wAAQAAAYYw
// SIG // IgQgdrE06rFJ08IWroBgFK+n0BaP2J2cgCpKLI3J6TVl
// SIG // wdIwDQYJKoZIhvcNAQELBQAEggIABpydB7KaBzJjnYT+
// SIG // L/tyb4rIJfKWOt5aVgrdHvr2BgYWlu0XI4snR9RzDoU8
// SIG // qSnf6Cx8EIqHRTZkNgAlVpyPzS5outmvEStc2Krq5OJa
// SIG // xvV71Ng9kx27emjuLbU4on3t6VJ/U3SRbUQfxq/ffSMQ
// SIG // 9vHNB+JcG10WsWDhml8FbrLtZ+TaA4fNESZtHuG9cPol
// SIG // ATmWw7lhr/7oWOj2AoAsD8y5LuNYto5bHt8WkuZmFJcd
// SIG // aGy/uQK/qCBE4s8DvNeQ/K+mkdERGWTdVL3TMDc1axPC
// SIG // aKcQcVA6zcMFyi+OfI0ABd1o9l2slAaQaBPe0TmkN/hc
// SIG // X5x5X3gpRqHyYRleKgQLe6ERvIF0rwI+mzlUUXW6yTdl
// SIG // HFzlT7TXHPeGT16yUfJ2kq4BXHSiYwYX0OEgJuXfC/Tp
// SIG // BduZjG9U2PH7kCuNuFc2ft+RaKLbXd6sAX8yD69cAWUR
// SIG // rKi1Y/4u5qqZRDARrcc1xQqNnFWmAWkp9YFJzBAHqUUm
// SIG // /IYqriJas+bG+uP5XLnvVlMY3amd/BVcnCDHt2dMA4+o
// SIG // EApIZwvJuyNdNpf/ofPCmTD62/HDz8JZG8VrT7eRuMKi
// SIG // OgeQPgyOcrhOOee2ZUMhusGYuPePdj9nsBi01iiXEPO1
// SIG // txNStsTQKygVIieceH5FwQdGo5tbvWr3ME3n2sKvakN3
// SIG // KeJP7+Q=
// SIG // End signature block
