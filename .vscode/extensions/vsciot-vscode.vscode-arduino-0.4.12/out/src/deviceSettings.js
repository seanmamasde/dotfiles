"use strict";
// Copyright (c) Elektronik Workshop. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSettings = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const constants = require("./common/constants");
const util = require("./common/util");
const logger = require("./logger/logger");
/**
 * Generic class which provides monitoring of a specific settings value.
 * If the value is modified a flag is set and an event is emitted.
 *
 * Usually you want to specialize the setter for any given value type
 * to prevent invalid or badly formatted values to enter your settings.
 */
class Setting {
    constructor(defaultValue) {
        /** Event emitter which fires when the value is changed. */
        this._emitter = new vscode.EventEmitter();
        this.default = defaultValue;
        this._value = this.default;
    }
    /**
     * Value-setter - sets the value.
     * If modified, the modified flag is set and the modified event is
     * fired.
     */
    set value(value) {
        if (value !== this._value) {
            this._value = value;
            this._modified = true;
            this._emitter.fire(this._value);
        }
    }
    /** Value-getter - returns the internal value. */
    get value() {
        return this._value;
    }
    /**
     * Returns true, if the internal value has been modified.
     * To clear the modified flag call commit().
     */
    get modified() {
        return this._modified;
    }
    /** Returns the modified-event emitter. */
    get emitter() {
        return this._emitter;
    }
    /**
     * Returns the internal value to its default value.
     * If the default value is different from the previous value,
     * it triggers the modified event and the modified flag is set.
     */
    reset() {
        this.value = this.default;
    }
    /** Reset the modified flag (if you know what you're doing) */
    commit() {
        this._modified = false;
    }
}
/**
 * String specialization of the Setting class.
 */
class StrSetting extends Setting {
    /**
     * When we override setter (below) we have to override getter as well
     * (see JS language specs).
     */
    get value() {
        return super.value;
    }
    /**
     * Set string value. Anything else than a string will set the value to
     * its default value (undefined). White spaces at the front and back are
     * trimmed before setting the value.
     * If the setting's value is changed during this operation, the base
     * class' event emitter will fire and the modified flag will be set.
     */
    set value(value) {
        if (typeof value !== "string") {
            value = this.default;
        }
        else {
            value = value.trim();
        }
        super.value = value;
    }
}
class BuildPrefSetting extends Setting {
    get value() {
        return super.value;
    }
    set value(value) {
        if (!Array.isArray(value)) {
            super.value = super.default;
            return;
        }
        if (value.length <= 0) {
            super.value = super.default;
            return;
        }
        for (const pref of value) {
            if (!Array.isArray(pref) || pref.length !== 2) {
                super.value = super.default;
                return;
            }
            for (const i of pref) {
                if (typeof i !== "string") {
                    super.value = super.default;
                    return;
                }
            }
        }
        super.value = value;
    }
}
/**
 * This class encapsulates all device/project specific settings and
 * provides common operations on them.
 */
class DeviceSettings {
    constructor() {
        this.port = new StrSetting();
        this.board = new StrSetting();
        this.sketch = new StrSetting();
        this.output = new StrSetting();
        this.debugger = new StrSetting();
        this.intelliSenseGen = new StrSetting();
        this.configuration = new StrSetting();
        this.prebuild = new StrSetting();
        this.postbuild = new StrSetting();
        this.programmer = new StrSetting();
        this.buildPreferences = new BuildPrefSetting();
    }
    /**
     * @returns true if any of the settings values has its modified flag
     * set.
     */
    get modified() {
        return this.port.modified ||
            this.board.modified ||
            this.sketch.modified ||
            this.output.modified ||
            this.debugger.modified ||
            this.intelliSenseGen.modified ||
            this.configuration.modified ||
            this.prebuild.modified ||
            this.postbuild.modified ||
            this.programmer.modified ||
            this.buildPreferences.modified;
    }
    /**
     * Clear modified flags of all settings values.
     */
    commit() {
        this.port.commit();
        this.board.commit();
        this.sketch.commit();
        this.output.commit();
        this.debugger.commit();
        this.intelliSenseGen.commit();
        this.configuration.commit();
        this.prebuild.commit();
        this.postbuild.commit();
        this.programmer.commit();
        this.buildPreferences.commit();
    }
    /**
     * Resets all settings values to their default values.
     * @param commit If true clear the modified flags after all values are
     * reset.
     */
    reset(commit = true) {
        this.port.reset();
        this.board.reset();
        this.sketch.reset();
        this.output.reset();
        this.debugger.reset();
        this.intelliSenseGen.reset();
        this.configuration.reset();
        this.prebuild.reset();
        this.postbuild.reset();
        this.programmer.reset();
        this.buildPreferences.reset();
        if (commit) {
            this.commit();
        }
    }
    /**
     * Load settings values from the given file.
     * If a value is changed through this operation, its event emitter will
     * fire.
     * @param file Path to the file the settings should be loaded from.
     * @param commit If true reset the modified flags after all values are read.
     * @returns true if the settings are loaded successfully.
     */
    load(file, commit = true) {
        const settings = util.tryParseJSON(fs.readFileSync(file, "utf8"));
        if (settings) {
            this.port.value = settings.port;
            this.board.value = settings.board;
            this.sketch.value = settings.sketch;
            this.configuration.value = settings.configuration;
            this.output.value = settings.output;
            this.debugger.value = settings.debugger;
            this.intelliSenseGen.value = settings.intelliSenseGen;
            this.prebuild.value = settings.prebuild;
            this.postbuild.value = settings.postbuild;
            this.programmer.value = settings.programmer;
            this.buildPreferences.value = settings.buildPreferences;
            if (commit) {
                this.commit();
            }
            return true;
        }
        else {
            logger.notifyUserError("arduinoFileError", new Error(constants.messages.ARDUINO_FILE_ERROR));
            return false;
        }
    }
    /**
     * Writes the settings to the given file if there are modified
     * values. The modification flags are reset (commit()) on successful write.
     * On write failure the modification flags are left unmodified.
     * @param file Path to file the JSON representation of the settings should
     * written to. If either the folder or the file does not exist they are
     * created.
     * @returns true on succes, false on write failure.
     */
    save(file) {
        if (!this.modified) {
            return true;
        }
        let settings = {};
        if (util.fileExistsSync(file)) {
            settings = util.tryParseJSON(fs.readFileSync(file, "utf8"));
        }
        if (!settings) {
            logger.notifyUserError("arduinoFileError", new Error(constants.messages.ARDUINO_FILE_ERROR));
            return false;
        }
        settings.sketch = this.sketch.value;
        settings.port = this.port.value;
        settings.board = this.board.value;
        settings.output = this.output.value;
        settings.debugger = this.debugger.value;
        settings.intelliSenseGen = this.intelliSenseGen.value;
        settings.configuration = this.configuration.value;
        settings.programmer = this.programmer.value;
        util.mkdirRecursivelySync(path.dirname(file));
        fs.writeFileSync(file, JSON.stringify(settings, undefined, 4));
        this.commit();
        return true;
    }
}
exports.DeviceSettings = DeviceSettings;

//# sourceMappingURL=deviceSettings.js.map

// SIG // Begin signature block
// SIG // MIInqgYJKoZIhvcNAQcCoIInmzCCJ5cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // R39wx8Mjk151xzyNyR41YvYqVE1Yx8xv8Dvn2c2IiQyg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYEw
// SIG // ghl9AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIO9wgiWLz2932qkQu2pr
// SIG // cA3pxTLct0UhuoXh2UKZY7uzMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAXDi7BrUzJ34QZozBsQVo10QsvHyvk4gDByJv
// SIG // sdvbMv5OBS5FaTQvtha7DPaWIFiyuT9c7y02n3Mj73hi
// SIG // YfNtv76UmQ7Ag1//vdpdvyvPbC4hAgIUy+r3eNGNzbxH
// SIG // YC4D6zfGNjkJOBcBuLnMeJ+UwJJbnT4lAOhqqZDAjdgc
// SIG // BHswj1YHhiB9IdXo8IR7TCR8lAtGTp1yFLnoFfOlM8Hs
// SIG // YPtFGiC8AooSE1756vPY3DMclNa3RK4MD4DeJ+JZdXSW
// SIG // fpRpG4lNA0LYpLm0sbUXUMBrkNgq3I3qvpC4a2tjZ/U/
// SIG // rgk8Jj0OA61cwmw7A3hulY4eRm/xZ8vK8wAf8RZSxqGC
// SIG // FwswghcHBgorBgEEAYI3AwMBMYIW9zCCFvMGCSqGSIb3
// SIG // DQEHAqCCFuQwghbgAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFUBgsqhkiG9w0BCRABBKCCAUMEggE/MIIBOwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBvLbAm
// SIG // hCL4eI70b/2vrjtqIfzloe+64AP0UhG4GMsQLwIGYmtU
// SIG // z4blGBIyMDIyMDUwMzE5MDEwNi41NlowBIACAfSggdSk
// SIG // gdEwgc4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsT
// SIG // IE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNv
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo4OTdBLUUz
// SIG // NTYtMTcwMTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaCCEV8wggcQMIIE+KADAgECAhMz
// SIG // AAABqwkJ76tj1OipAAEAAAGrMA0GCSqGSIb3DQEBCwUA
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIy
// SIG // MDMwMjE4NTEyOFoXDTIzMDUxMTE4NTEyOFowgc4xCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29m
// SIG // dCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQL
// SIG // Ex1UaGFsZXMgVFNTIEVTTjo4OTdBLUUzNTYtMTcwMTEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAMmdS1o5dehASUsscLqyx2wm/WirNUfqkGBymDIt
// SIG // YzEnoKtkhrd7wNsJs4g+BuM3uBX81WnO270lkrC0e1mm
// SIG // DqQt420Tmb8lwsjQKM6mEaNQIfXDronrVN3aw1lx9bAf
// SIG // 7VZEA3kHFql6YAO3kjQ6PftA4iVHX3JVv98ntjkbtqzK
// SIG // eJMaNWd8dBaAD3RCliMoajTDGbyYNKTvxBhWILyJ8WYd
// SIG // J/NBDpqPzQl+pxm6ZZVSeBQAIOubZjU0vfpECxHC5vI1
// SIG // ErrqapG+0oBhhON+gllVklPAWZv2iv0mgjCTj7YNKX7y
// SIG // L2x2TvrvHVq5GPNa5fNbpy39t5cviiYqMf1RZVZccdr+
// SIG // 2vApk5ib5a4O8SiAgPSUwYGoOwbZG1onHij0ATPLkgKU
// SIG // fgaPzFfd5JZSbRl2Xg347/LjWQLR+KjAyACFb06bqWzv
// SIG // HtQJTND8Y0j5Y2SBnSCqV2zNHSVts4+aUfkUhsKS+GAX
// SIG // S3j5XUgYA7SMNog76Nnss5l01nEX7sHDdYykYhzuQKFr
// SIG // T70XVTZeX25tSBfy3VaczYd1JSI/9wOGqbFU52NyrlsA
// SIG // 1qimxOhsuds7Pxo+jO3RjV/kC+AEOoVaXDdminsc3Ptl
// SIG // BCVh/sgYno9AUymblSRmee1gwlnlZJ0uiHKI9q2HFgZW
// SIG // M10yPG5gVt0prXnJFi1Wxmmg+BH/AgMBAAGjggE2MIIB
// SIG // MjAdBgNVHQ4EFgQUFFvO8o1eNcSCIQZMvqGfdNL+pqow
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAK
// SIG // BggrBgEFBQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAykuU
// SIG // gTc1KMszMgsHbhgjgEGv/dCHFf0by99C45SR770/udCN
// SIG // NeqlT610Ehz13xGFU6Hci+TLUPUnhvUnSuz7xkiWRru5
// SIG // RjZZmSonEVv8npa3z1QveUfngtyi0Jd6qlSykoEVJ6tD
// SIG // uR1Kw9xU9yvthZWhQs/ymyOwh+mxt0C9wbeLJ92er2vc
// SIG // 9ly12pFxbCNDJ+mQ7v520hAvreWqZ02GOJhw0R4c1iP3
// SIG // 9iNBzHOoz+DsO0sYjwhaz9HrvYMEzOD1MJdLPWfUFsZ/
// SIG // /iTd3jzEykk02WjnZNzIe2ENfmQ/KblGXHeSe8JYqimT
// SIG // Fxl5keMfLUELjAh0mhQ1vLCJZ20BwC4O57Eg7yO/YuBn
// SIG // o+4RrV0CD2gp4BO10KFW2SQ/MhvRWK7HbgS6Bzt70rkI
// SIG // eSUto7pRkHMqrnhubITcXddky6GtZsmwM3hvqXuStMeU
// SIG // 1W5NN3HA8ypjPLd/bomfGx96Huw8OrftcQvk7thdNu4J
// SIG // hAyKUXUP7dKMCJfrOdplg0j1tE0aiE+pDTSQVmPzGezC
// SIG // L42slyPJVXpu4xxE0hpACr2ua0LHv/LB6RV5C4CO4Ms/
// SIG // pfal//F3O+hJZe5ixevzKNkXXbxPOa1R+SIrW/rHZM6R
// SIG // IDLTJxTGFDM1hQDyafGu9S/a7umkvilgBHNxZfk0IYE7
// SIG // RRWJcG7oiY+FGdx1cs0wggdxMIIFWaADAgECAhMzAAAA
// SIG // FcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGI
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNy
// SIG // b3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkg
// SIG // MjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMy
// SIG // MjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGm
// SIG // TOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YB
// SIG // f2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMM
// SIG // tY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTI
// SIG // cVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+
// SIG // NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130/o5T
// SIG // z9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi9
// SIG // 47SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uD
// SIG // RedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tn
// SIG // YN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/Nme
// SIG // Rd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03
// SIG // dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5
// SIG // TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy
// SIG // 16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkL
// SIG // iWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXps
// SIG // xREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqP
// SIG // nhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsG
// SIG // AQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqn
// SIG // Uv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsG
// SIG // AQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVw
// SIG // b3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // GQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0P
// SIG // BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgw
// SIG // FoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8w
// SIG // TTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
// SIG // BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEs
// SIG // H2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfC
// SIG // cTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2Y
// SIG // urYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/
// SIG // SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRW
// SIG // qveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wX
// SIG // sFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixr
// SIG // e24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoy
// SIG // GtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8
// SIG // x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk
// SIG // 2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pF
// SIG // EUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq7
// SIG // 7EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGC
// SIG // onsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1Zyvg
// SIG // DbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7
// SIG // vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0
// SIG // HVUzWLOhcGbyoYIC0jCCAjsCAQEwgfyhgdSkgdEwgc4x
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jv
// SIG // c29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjo4OTdBLUUzNTYtMTcw
// SIG // MTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAW6h6/24WCo7W
// SIG // Zz6CEVAeLztcmD6ggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIFAOYb
// SIG // wbwwIhgPMjAyMjA1MDMxODU5MDhaGA8yMDIyMDUwNDE4
// SIG // NTkwOFowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA5hvB
// SIG // vAIBADAKAgEAAgIRXQIB/zAHAgEAAgISmzAKAgUA5h0T
// SIG // PAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBADoW2N9jFVL9Nvy5mQYcn5rvh2rP
// SIG // TD8n3FebZQU4kpQ3F9RcdkqsDccyVOGaFCpkUQuHlBE0
// SIG // om/k6KyJxxwVgkj7YmgYLdi6C+KUOX6FziiJo1wD2hsG
// SIG // BJG//fhBttebGeg7bs782i8wW90RaxlDrb5ZTDJrstoI
// SIG // boAlfKxJG5UqMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGrCQnvq2PU6KkA
// SIG // AQAAAaswDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgQ8+2wMbQ+19jJKZJwQBU4u4HxXMMROjevj1tP482
// SIG // JlIwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCAO
// SIG // HK/6sIVgEVSVD3Arvk6OyQKvRxFHKyraUzbN1/AKVzCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABqwkJ76tj1OipAAEAAAGrMCIEIB0q/hMecpln
// SIG // N2hEduCjorocnmuXf5ocGNns2h+Zf0UYMA0GCSqGSIb3
// SIG // DQEBCwUABIICALss6jDNYvX+WT0kRsFdIRvc7tOQcBCx
// SIG // QdUFZicwWHDt6p/TgfeQa/EJo0rFsHgGng9QPZrIumHS
// SIG // tuBkppnoSDsfOJ1qNfsPxpyrEZ9iTsy7Zbq2TVo/OGrY
// SIG // LGCMQl8MGKUlesH1hQwHDPo5eRU2BFGT8X9YCAzvxyIe
// SIG // /sN+7QbORhyYUA85B0cnRe8O0xVO79ghTQM0hoL2nVuu
// SIG // J0WgeLgeS96kwtmykNjwg5qIGndtdYLYsRp9MPiMW8ld
// SIG // iZMQQ80GchSsG+qPJTYc4HtJe8E0XvDkpTbv8TZqfqlN
// SIG // nNRus3k04VofjXeYGYBh5pR3lnH93MRMs322Ee+y3BA2
// SIG // MYVJe/Shja5WDyZ1WSHpr8wOcV4kEuVLoUg/zxQ7iT48
// SIG // of/wcGyDOwUqiq2/g9QhTjTTvk7QiNdmaxaR2eOWnX7c
// SIG // vpp5r5jvrZws9f0OJj73tOf7QY4BmWpAg5Fwf1ChTWSF
// SIG // ZmgB9jrXtYOLMZCEwy/phpydgkWOUUqt2UCivF+CnNs8
// SIG // Zw6StXJdf8EmeAklh+ELPdl5G2uBAgPxCiJb+ApX56er
// SIG // BFnc9fxLYPuvkCEU7lR3PO2KY7Y+tWqaAkTURZzVvEHA
// SIG // fWJPff0aSTaqtV6sgUjcmnflqbKlxsnXqnSkrgocY8A0
// SIG // doxEDKpGcOyfPbZDOeiCa2EcsYoV/mhHVX65
// SIG // End signature block
