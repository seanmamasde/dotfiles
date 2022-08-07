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
exports.ExampleManager = void 0;
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const util = require("../common/util");
class ExampleManager {
    constructor(_settings, _arduinoApp) {
        this._settings = _settings;
        this._arduinoApp = _arduinoApp;
    }
    loadExamples() {
        return __awaiter(this, void 0, void 0, function* () {
            const examples = [];
            // load Built-in Examples from examples folder under arduino installation directory.
            examples.push({
                name: "Built-in Examples",
                path: this._settings.defaultExamplePath,
                children: this.parseExamples(this._settings.defaultExamplePath),
            });
            // load Examples from default libraries under arduino installation directory.
            const examplesFromDefaultLibraries = yield this.parseExamplesFromLibrary(this._settings.defaultLibPath, true);
            if (examplesFromDefaultLibraries.length) {
                examples.push({
                    name: "Examples for any board",
                    path: this._settings.defaultLibPath,
                    children: examplesFromDefaultLibraries,
                });
            }
            // load Examples from current board's firmware package directory.
            if (this._arduinoApp.boardManager.currentBoard) {
                const currentBoard = this._arduinoApp.boardManager.currentBoard;
                const currentBoardLibrariesPath = path.join(currentBoard.platform.rootBoardPath, "libraries");
                const examplesFromCurrentBoard = yield this.parseExamplesFromLibrary(currentBoardLibrariesPath, false);
                if (examplesFromCurrentBoard.length) {
                    examples.push({
                        name: `Examples for ${currentBoard.name}`,
                        path: currentBoardLibrariesPath,
                        children: examplesFromCurrentBoard,
                    });
                }
            }
            // load Examples from Custom Libraries
            const customLibrariesPath = path.join(this._settings.sketchbookPath, "libraries");
            const examplesFromCustomLibraries = yield this.parseExamplesFromLibrary(customLibrariesPath, true, true);
            if (examplesFromCustomLibraries.length) {
                examples.push({
                    name: "Examples from Custom Libraries",
                    path: customLibrariesPath,
                    children: examplesFromCustomLibraries,
                });
            }
            // load Examples from user's workspace
            const sketchesPath = path.join(this._settings.sketchbookPath, "sketches");
            const examplesFromSketches = yield this.parseExamples(sketchesPath);
            if (examplesFromSketches.length) {
                examples.push({
                    name: "Workspace",
                    path: sketchesPath,
                    children: examplesFromSketches,
                });
            }
            return examples;
        });
    }
    parseExamples(rootPath) {
        if (!util.directoryExistsSync(rootPath)) {
            return [];
        }
        const exampleFolders = glob.sync(path.join(rootPath, "**/**/"));
        // exampleFolders looks like as follows:
        // ["C:/Program Files (x86)/Arduino/examples/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/AnalogReadSerial/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/BareMinimum/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/Blink/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/DigitalReadSerial/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/Fade/",
        //  "C:/Program Files (x86)/Arduino/examples/01.Basics/ReadAnalogVoltage/",
        //  "C:/Program Files (x86)/Arduino/examples/02.Digital/",
        // ]
        const rootNode = {
            children: [],
        };
        const exampleMap = new Map();
        exampleMap.set(path.resolve(exampleFolders[0]), rootNode);
        for (let i = 1; i < exampleFolders.length; i++) {
            const currentPath = path.resolve(exampleFolders[i]);
            const parentPath = path.resolve(path.dirname(exampleFolders[i]));
            const parentExample = exampleMap.get(parentPath);
            if (parentExample && !parentExample.isLeaf) {
                const currentExample = {
                    name: path.basename(exampleFolders[i]),
                    path: currentPath,
                    // If there is *.ino files existing in current folder, then mark this folder as leaf node.
                    isLeaf: this.isExampleFolder(currentPath),
                    children: [],
                };
                exampleMap.set(currentPath, currentExample);
                parentExample.children.push(currentExample);
            }
        }
        return rootNode.children;
    }
    parseExamplesFromLibrary(rootPath, checkCompatibility, categorizeIncompatible = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const examples = [];
            const inCompatibles = [];
            if (!util.directoryExistsSync(rootPath)) {
                return [];
            }
            const libraries = util.readdirSync(rootPath, true);
            for (const library of libraries) {
                const propertiesFile = path.join(rootPath, library, "library.properties");
                if (checkCompatibility && util.fileExistsSync(propertiesFile)) {
                    const properties = yield util.parseProperties(propertiesFile);
                    const children = this.parseExamples(path.join(rootPath, library, "examples"));
                    if (children.length) {
                        // When missing architectures field in library.properties, fall it back to "*".
                        if (this.isSupported(properties.architectures || "*")) {
                            examples.push({
                                name: library,
                                path: path.join(rootPath, library),
                                children,
                            });
                        }
                        else if (categorizeIncompatible) {
                            inCompatibles.push({
                                name: library,
                                path: path.join(rootPath, library),
                                children,
                            });
                        }
                    }
                }
                else {
                    const children = this.parseExamples(path.join(rootPath, library, "examples"));
                    if (children.length) {
                        examples.push({
                            name: library,
                            path: path.join(rootPath, library),
                            children,
                        });
                    }
                }
            }
            if (categorizeIncompatible && inCompatibles.length) {
                examples.push({
                    name: "INCOMPATIBLE",
                    path: "INCOMPATIBLE",
                    children: inCompatibles,
                });
            }
            return examples;
        });
    }
    isExampleFolder(dirname) {
        const items = fs.readdirSync(dirname);
        const ino = items.find((item) => {
            return util.isArduinoFile(path.join(dirname, item));
        });
        return !!ino;
    }
    isSupported(architectures) {
        if (!architectures) {
            return false;
        }
        const currentBoard = this._arduinoApp.boardManager.currentBoard;
        if (!currentBoard) {
            return true;
        }
        const targetArch = currentBoard.platform.architecture;
        return architectures.indexOf(targetArch) >= 0 || architectures.indexOf("*") >= 0;
    }
}
exports.ExampleManager = ExampleManager;

//# sourceMappingURL=exampleManager.js.map

// SIG // Begin signature block
// SIG // MIInqwYJKoZIhvcNAQcCoIInnDCCJ5gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // bi6BbHWHBdikY7s9aRPwUZoHN2t1fT5qc2K5jJyhfhyg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYIw
// SIG // ghl+AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIDqYSJAGM1Z8aq4H/2Co
// SIG // 0RRHOg3Q5DXkpLqBPBxg40wvMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAXFw/SeEt7tkruGjHaRq5dqU9Og5VrNlDLY3P
// SIG // 1NdzU04vecNOoUotYdLi8/ViMHcJ+6ATGcxu7H8gC0tY
// SIG // pXDz3ao+IF/U7KUAxnJkdwS1guaK6LpRYjmWAXLW77UG
// SIG // 2EtFitsPvwtRlRs51vznlnaP0UUiTnfNRAVOs8Ry6jQA
// SIG // pQUm/dScLiGCqoqFqbnPsQYKEOIDOqVYb7yLu/50SyOA
// SIG // aWdtzMltMPxNGH4zB3M/6lM+SjZCzFapJEH0OqMxl2vA
// SIG // XXDKi9+Tic2Gk0eh9+ej1nYvgXrTiKNVTAQ82Ke9pbXh
// SIG // iuGeLEsORwQiojpWhNKsYseE7ciSXfGQnrVWMPuoDKGC
// SIG // FwwwghcIBgorBgEEAYI3AwMBMYIW+DCCFvQGCSqGSIb3
// SIG // DQEHAqCCFuUwghbhAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCD9CpE6
// SIG // +HPTEWsg4dNpISz5p5MkpTM1BSS2pYnOPWpIoAIGYmsX
// SIG // q2KAGBMyMDIyMDUwMzE5MDEwOC4xMTNaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046NDYyRi1F
// SIG // MzE5LTNGMjAxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghFfMIIHEDCCBPigAwIBAgIT
// SIG // MwAAAaQHz+OPo7pv1gABAAABpDANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MjAzMDIxODUxMThaFw0yMzA1MTExODUxMThaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046NDYyRi1FMzE5LTNGMjAx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQDAR44A+hT8vNT1IXDiFRoeGzkmqut+GPk41toT
// SIG // RfQZZ1sSyQhLjIlemBecemEzO09WSzOjZx9MIT8qYs92
// SIG // 1WUZsIBsk1ESn1cjyfPUd1mmfxzL3ACWZwjIC/pjqcRP
// SIG // eIMECQ/6qPFKrjqwigmP33I3IcVfMjJHyKj+vR51n1tK
// SIG // 2rZPiNhmRdiEhckbbxLsSb2nCBQxZEF49x/l8vSB8zaq
// SIG // ovoOeIkIzgDerN7OvJouq6r+vg/Qz1T4NXr+sKKyNxZW
// SIG // M6zywiLp7G7WLd18N2hyjHwPkh/AleIqif3hGVD9bhSU
// SIG // +dDADzUJSMFhEWunHHElQeZjdmIB3/Mw1KkFOJNvw1sP
// SIG // teIi5MK4DZX3Wd/Fd8ZsQvZmXPWJ8BXN9sYtHMz8zdeQ
// SIG // vMImRCKgnXcW8IpnPtC7Tymp3UV5NoTH8INF6WWicQ3y
// SIG // 04L2I1VOT104AddJoVgAP2KLIGwfCs7wMVz56xJ2IN1y
// SIG // 1pIAWfpTqx76orM5RQhkAvayj1RTwgrHst+elYX3F5b8
// SIG // ACWrgJO1dJy1U4MIv+SC8h33xLmWA568emvrJ6g0xy/2
// SIG // akbAeRx6tFwaP4uwVbjF50kl5RQqNzp/CDpfCTikOAqy
// SIG // Ja4valiWDMbEiArHKLYDg6GDjuJZl5bSjgdJdCAIRF8E
// SIG // kiiA+UAGvcE6SGoHmtoc4yOklGNVvwIDAQABo4IBNjCC
// SIG // ATIwHQYDVR0OBBYEFOLQE5+s+AgS9sWUHdI4zekp4yTC
// SIG // MB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
// SIG // MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBs
// SIG // BggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAAlW
// SIG // HFDRDJck7jwwRoYmdVOePLLBeidoPUBJVhG9nGeHS9Pu
// SIG // RvO9tf4IkbUz74MUIQxeayQoxxo/JxUqjhPH52M/b4G9
// SIG // mHJWB75KCllCTg8Y4VkvktOmS0f5w0vOR3gwA9BRnbgA
// SIG // PNEO7xs5Jylto8aDR02++CkBDFolCtTNjwzfniEj1z4T
// SIG // 7nRlRi2yBAJNRqI+VY820LiyoZtk5OGttq5F5HhPfIMj
// SIG // aIx5QYR22+53sd8xgUwRpFbcLdrne6jdq3KbiYbCf7y/
// SIG // 9F2C7cjpO3kkGXX8ntE09f6o9fIklx7CFw4RzrkyqgYo
// SIG // mraKOFJ8JO7hsjNJb9/Gba/mKWo0j/qdDxDER/UXX6yk
// SIG // ZuGx1eQpjkyMwJnOPWGbeNIYZVcJQpRQODPs593Mi5hB
// SIG // sHzag+vd4Q+Vt73KZ4X98YWW1Vk1aSR9Qjxk5keMuVPZ
// SIG // McMrCvFZXwhUcGFGueuNCrICL9bSYRfS13pliDxJ7sPS
// SIG // Z8x2d4ksOXW00l6fR5nTiSM7Dvv7Y0MGVgUhap2smhr9
// SIG // 2PMNSmIkCUvHCiYcJ4RoAT28mp/hOQ/U8mPXSpWdxYpL
// SIG // LcDOISmBhFJYN7amlhIpVsGvUmjXrTcY0n4Goe/Nqs24
// SIG // 00IcA4HOiX9OxdmpNGDJzSRR7AW9TT8O+3YZqPZIvL6y
// SIG // zgfvnehptmf4w6QzkrLfMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCAtIwggI7AgEBMIH8oYHUpIHRMIHO
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQG
// SIG // A1UECxMdVGhhbGVzIFRTUyBFU046NDYyRi1FMzE5LTNG
// SIG // MjAxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVADQcKOKTa3xC
// SIG // +g1aPrcPerxiby6foIGDMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDm
// SIG // G4TBMCIYDzIwMjIwNTAzMTQzODU3WhgPMjAyMjA1MDQx
// SIG // NDM4NTdaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOYb
// SIG // hMECAQAwCgIBAAICArYCAf8wBwIBAAICEfUwCgIFAOYc
// SIG // 1kECAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGE
// SIG // WQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkq
// SIG // hkiG9w0BAQUFAAOBgQBWr80GBIFeMXv8JHsiphLavkZZ
// SIG // mDuJjKLaLCQA7EzdlegMWNQXnKvwwsNoBNmg5jtoopHn
// SIG // RFD0ZetePpAIfVzFXJaeJ2mwPqGqChJkBYlo2so7EUBb
// SIG // 65s4V0coTeUpHF5qeHcGeRpeYXaUUwdrGoU/t6mxZeZ3
// SIG // biXEe6cVccNSDzGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABpAfP44+jum/W
// SIG // AAEAAAGkMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIPBDlICX05tieQFpKKp+yfsQR8Z7dEw+GrjH5vyc
// SIG // lcLOMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // BfzgoyEmcKTASfDCd1sDAhd6jmuWBxRuieLh42rqefgw
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAaQHz+OPo7pv1gABAAABpDAiBCCkgtELsh76
// SIG // oksJLn5Vme1H+SnuDjvr+bKR5n49yBRoiDANBgkqhkiG
// SIG // 9w0BAQsFAASCAgCwBd84IZP4HWwrE00NpV84t/x1j1Ww
// SIG // v+u8xZVconmQg3DBcjd/45LqBeaBbwaLeom/Dwqs/3/A
// SIG // 5yg3ZDT0NWjgvv1UfPatOIlnO3VetuDFUJ0FOxPqTuCQ
// SIG // /Wrb+QPj3PQG78Efj+bd+kclZMrOm0lDXsHn90mViOgB
// SIG // Fgf7RgpZQLVv2UXRCHJetFMt+glfsaqy09ncslgU9P73
// SIG // 6zVz08KV9VXTFH8fhTKji+2ONneym+dgcOWtKyOZuEkm
// SIG // iTh9wnGqNqtS4MZOeUZVEU6cHwe4dZynNjGh53v+gi6/
// SIG // w1dLchuNtpnY0fbeGbTh5Zt4sU2gxRTMXO9cIgkXtDlU
// SIG // PL1VfFL0sCMQCsEUMi0Tr3eCsm+nzObnOtJRd2HRdYub
// SIG // GGItDBorxYS1UmzkVd5LVF36isTLqXNfHJ2B/ZARUptu
// SIG // T08oq5M1wqXyknBx+25KjopPkeyRtX3mZ0QFH0gv+63t
// SIG // nRCEjRwRd8ZLjG740J/blNAUcKaiTTmoZh7hm0xe94NV
// SIG // fiQD3AO3IQMFkyuvKlNX/75gB9fw7s9GPyko7HySph/+
// SIG // TX7k1W1MlOB8/F5gYxPDIy6Yzn0AW+Er0c3v83EK/ruh
// SIG // 2sezix4Hih4BIgWvcYtyOD6S2NP0CTqC7WnWpjOwjcbt
// SIG // wteQ7n7QI2lh2jkokg9/TlTw4aWyqO364Bz+Rg==
// SIG // End signature block
