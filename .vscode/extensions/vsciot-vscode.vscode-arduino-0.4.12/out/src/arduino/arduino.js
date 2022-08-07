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
exports.ArduinoApp = exports.BuildMode = void 0;
const fs = require("fs");
const glob = require("glob");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const constants = require("../common/constants");
const util = require("../common/util");
const logger = require("../logger/logger");
const deviceContext_1 = require("../deviceContext");
const intellisense_1 = require("./intellisense");
const vscodeSettings_1 = require("./vscodeSettings");
const outputChannel_1 = require("../common/outputChannel");
const workspace_1 = require("../common/workspace");
const serialMonitor_1 = require("../serialmonitor/serialMonitor");
const usbDetector_1 = require("../serialmonitor/usbDetector");
/**
 * Supported build modes. For further explanation see the documentation
 * of ArduinoApp.build().
 * The strings are used for status reporting within the above function.
 */
var BuildMode;
(function (BuildMode) {
    BuildMode["Verify"] = "Verifying";
    BuildMode["Analyze"] = "Analyzing";
    BuildMode["Upload"] = "Uploading";
    BuildMode["CliUpload"] = "Uploading using Arduino CLI";
    BuildMode["UploadProgrammer"] = "Uploading (programmer)";
    BuildMode["CliUploadProgrammer"] = "Uploading (programmer) using Arduino CLI";
})(BuildMode = exports.BuildMode || (exports.BuildMode = {}));
/**
 * Represent an Arduino application based on the official Arduino IDE.
 */
class ArduinoApp {
    /**
     * @param {IArduinoSettings} _settings ArduinoSetting object.
     */
    constructor(_settings) {
        this._settings = _settings;
        /**
         * Indicates if a build is currently in progress.
         * If so any call to this.build() will return false immediately.
         */
        this._building = false;
        const analysisDelayMs = 1000 * 3;
        this._analysisManager = new intellisense_1.AnalysisManager(() => this._building, () => __awaiter(this, void 0, void 0, function* () { yield this.build(BuildMode.Analyze); }), analysisDelayMs);
    }
    /**
     * Need refresh Arduino IDE's setting when starting up.
     * @param {boolean} force - Whether force initialize the arduino
     */
    initialize(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!util.fileExistsSync(this._settings.preferencePath)) {
                try {
                    // Use empty pref value to initialize preference.txt file
                    yield this.setPref("boardsmanager.additional.urls", "");
                    this._settings.reloadPreferences(); // reload preferences.
                }
                catch (ex) {
                }
            }
            if (force || !util.fileExistsSync(path.join(this._settings.packagePath, "package_index.json"))) {
                try {
                    // Use the dummy package to initialize the Arduino IDE
                    yield this.installBoard("dummy", "", "", true);
                }
                catch (ex) {
                }
            }
            if (this._settings.analyzeOnSettingChange) {
                // set up event handling for IntelliSense analysis
                const requestAnalysis = () => __awaiter(this, void 0, void 0, function* () {
                    if (intellisense_1.isCompilerParserEnabled()) {
                        yield this._analysisManager.requestAnalysis();
                    }
                });
                const dc = deviceContext_1.DeviceContext.getInstance();
                dc.onChangeBoard(requestAnalysis);
                dc.onChangeConfiguration(requestAnalysis);
                dc.onChangeSketch(requestAnalysis);
            }
        });
    }
    /**
     * Initialize the arduino library.
     * @param {boolean} force - Whether force refresh library index file
     */
    initializeLibrary(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (force || !util.fileExistsSync(path.join(this._settings.packagePath, "library_index.json"))) {
                try {
                    // Use the dummy library to initialize the Arduino IDE
                    yield this.installLibrary("dummy", "", true);
                }
                catch (ex) {
                }
            }
        });
    }
    /**
     * Set the Arduino preferences value.
     * @param {string} key - The preference key
     * @param {string} value - The preference value
     */
    setPref(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.useArduinoCli()) {
                    yield util.spawn(this._settings.commandPath, ["--build-property", `${key}=${value}`]);
                }
                else {
                    yield util.spawn(this._settings.commandPath, ["--pref", `${key}=${value}`, "--save-prefs"]);
                }
            }
            catch (ex) {
            }
        });
    }
    /**
     * Returns true if a build is currently in progress.
     */
    get building() {
        return this._building;
    }
    /**
     * Runs the arduino builder to build/compile and - if necessary - upload
     * the current sketch.
     * @param buildMode Build mode.
     *  * BuildMode.Upload: Compile and upload
     *  * BuildMode.UploadProgrammer: Compile and upload using the user
     *     selectable programmer
     *  * BuildMode.Analyze: Compile, analyze the output and generate
     *     IntelliSense configuration from it.
     *  * BuildMode.Verify: Just compile.
     * All build modes except for BuildMode.Analyze run interactively, i.e. if
     * something is missing, it tries to query the user for the missing piece
     * of information (sketch, board, etc.). Analyze runs non interactively and
     * just returns false.
     * @param buildDir Override the build directory set by the project settings
     * with the given directory.
     * @returns true on success, false if
     *  * another build is currently in progress
     *  * board- or programmer-manager aren't initialized yet
     *  * or something went wrong during the build
     */
    build(buildMode, buildDir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._boardManager || !this._programmerManager || this._building) {
                return false;
            }
            this._building = true;
            return yield this._build(buildMode, buildDir)
                .then((ret) => {
                this._building = false;
                return ret;
            })
                .catch((reason) => {
                this._building = false;
                logger.notifyUserError("ArduinoApp.build", reason, `Unhandled exception when cleaning up build "${buildMode}": ${JSON.stringify(reason)}`);
                return false;
            });
        });
    }
    // Include the *.h header files from selected library to the arduino sketch.
    includeLibrary(libraryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!workspace_1.ArduinoWorkspace.rootPath) {
                return;
            }
            const dc = deviceContext_1.DeviceContext.getInstance();
            const appPath = path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch);
            if (util.fileExistsSync(appPath)) {
                const hFiles = glob.sync(`${libraryPath}/*.h`, {
                    nodir: true,
                    matchBase: true,
                });
                const hIncludes = hFiles.map((hFile) => {
                    return `#include <${path.basename(hFile)}>`;
                }).join(os.EOL);
                // Open the sketch and bring up it to current visible view.
                const textDocument = yield vscode.workspace.openTextDocument(appPath);
                yield vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One, true);
                const activeEditor = vscode.window.visibleTextEditors.find((textEditor) => {
                    return path.resolve(textEditor.document.fileName) === path.resolve(appPath);
                });
                if (activeEditor) {
                    // Insert *.h at the beginning of the sketch code.
                    yield activeEditor.edit((editBuilder) => {
                        editBuilder.insert(new vscode.Position(0, 0), `${hIncludes}${os.EOL}${os.EOL}`);
                    });
                }
            }
        });
    }
    /**
     * Installs arduino board package.
     * (If using the aduino CLI this installs the corrosponding core.)
     * @param {string} packageName - board vendor
     * @param {string} arch - board architecture
     * @param {string} version - version of board package or core to download
     * @param {boolean} [showOutput=true] - show raw output from command
     */
    installBoard(packageName, arch = "", version = "", showOutput = true) {
        return __awaiter(this, void 0, void 0, function* () {
            outputChannel_1.arduinoChannel.show();
            const updatingIndex = packageName === "dummy" && !arch && !version;
            if (updatingIndex) {
                outputChannel_1.arduinoChannel.start(`Update package index files...`);
            }
            else {
                try {
                    const packagePath = path.join(this._settings.packagePath, "packages", packageName, arch);
                    if (util.directoryExistsSync(packagePath)) {
                        util.rmdirRecursivelySync(packagePath);
                    }
                    outputChannel_1.arduinoChannel.start(`Install package - ${packageName}...`);
                }
                catch (error) {
                    outputChannel_1.arduinoChannel.start(`Install package - ${packageName} failed under directory : ${error.path}${os.EOL}
                                      Please make sure the folder is not occupied by other procedures .`);
                    outputChannel_1.arduinoChannel.error(`Error message - ${error.message}${os.EOL}`);
                    outputChannel_1.arduinoChannel.error(`Exit with code=${error.code}${os.EOL}`);
                    return;
                }
            }
            outputChannel_1.arduinoChannel.info(`${packageName}${arch && ":" + arch}${version && ":" + version}`);
            try {
                if (this.useArduinoCli()) {
                    yield util.spawn(this._settings.commandPath, ["core", "install", `${packageName}${arch && ":" + arch}${version && "@" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : null });
                }
                else {
                    yield util.spawn(this._settings.commandPath, ["--install-boards", `${packageName}${arch && ":" + arch}${version && ":" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : null });
                }
                if (updatingIndex) {
                    outputChannel_1.arduinoChannel.end("Updated package index files.");
                }
                else {
                    outputChannel_1.arduinoChannel.end(`Installed board package - ${packageName}${os.EOL}`);
                }
            }
            catch (error) {
                // If a platform with the same version is already installed, nothing is installed and program exits with exit code 1
                if (error.code === 1) {
                    if (updatingIndex) {
                        outputChannel_1.arduinoChannel.end("Updated package index files.");
                    }
                    else {
                        outputChannel_1.arduinoChannel.end(`Installed board package - ${packageName}${os.EOL}`);
                    }
                }
                else {
                    outputChannel_1.arduinoChannel.error(`Exit with code=${error.code}${os.EOL}`);
                }
            }
        });
    }
    uninstallBoard(boardName, packagePath) {
        outputChannel_1.arduinoChannel.start(`Uninstall board package - ${boardName}...`);
        util.rmdirRecursivelySync(packagePath);
        outputChannel_1.arduinoChannel.end(`Uninstalled board package - ${boardName}${os.EOL}`);
    }
    /**
     * Downloads or updates a library
     * @param {string} libName - name of the library to download
     * @param {string} version - version of library to download
     * @param {boolean} [showOutput=true] - show raw output from command
     */
    installLibrary(libName, version = "", showOutput = true) {
        return __awaiter(this, void 0, void 0, function* () {
            outputChannel_1.arduinoChannel.show();
            const updatingIndex = (libName === "dummy" && !version);
            if (updatingIndex) {
                outputChannel_1.arduinoChannel.start("Update library index files...");
            }
            else {
                outputChannel_1.arduinoChannel.start(`Install library - ${libName}`);
            }
            try {
                if (this.useArduinoCli()) {
                    yield util.spawn(this._settings.commandPath, ["lib", "install", `${libName}${version && "@" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : undefined });
                }
                else {
                    yield util.spawn(this._settings.commandPath, ["--install-library", `${libName}${version && ":" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : undefined });
                }
                if (updatingIndex) {
                    outputChannel_1.arduinoChannel.end("Updated library index files.");
                }
                else {
                    outputChannel_1.arduinoChannel.end(`Installed library - ${libName}${os.EOL}`);
                }
            }
            catch (error) {
                // If a library with the same version is already installed, nothing is installed and program exits with exit code 1
                if (error.code === 1) {
                    if (updatingIndex) {
                        outputChannel_1.arduinoChannel.end("Updated library index files.");
                    }
                    else {
                        outputChannel_1.arduinoChannel.end(`Installed library - ${libName}${os.EOL}`);
                    }
                }
                else {
                    outputChannel_1.arduinoChannel.error(`Exit with code=${error.code}${os.EOL}`);
                }
            }
        });
    }
    uninstallLibrary(libName, libPath) {
        outputChannel_1.arduinoChannel.start(`Remove library - ${libName}`);
        util.rmdirRecursivelySync(libPath);
        outputChannel_1.arduinoChannel.end(`Removed library - ${libName}${os.EOL}`);
    }
    openExample(example) {
        function tmpName(name) {
            let counter = 0;
            let candidateName = name;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (!util.fileExistsSync(candidateName) && !util.directoryExistsSync(candidateName)) {
                    return candidateName;
                }
                counter++;
                candidateName = `${name}_${counter}`;
            }
        }
        // Step 1: Copy the example project to a temporary directory.
        const sketchPath = path.join(this._settings.sketchbookPath, "generated_examples");
        if (!util.directoryExistsSync(sketchPath)) {
            util.mkdirRecursivelySync(sketchPath);
        }
        let destExample = "";
        if (util.directoryExistsSync(example)) {
            destExample = tmpName(path.join(sketchPath, path.basename(example)));
            util.cp(example, destExample);
        }
        else if (util.fileExistsSync(example)) {
            const exampleName = path.basename(example, path.extname(example));
            destExample = tmpName(path.join(sketchPath, exampleName));
            util.mkdirRecursivelySync(destExample);
            util.cp(example, path.join(destExample, path.basename(example)));
        }
        if (destExample) {
            // Step 2: Scaffold the example project to an arduino project.
            const items = fs.readdirSync(destExample);
            const sketchFile = items.find((item) => {
                return util.isArduinoFile(path.join(destExample, item));
            });
            if (sketchFile) {
                // Generate arduino.json
                const dc = deviceContext_1.DeviceContext.getInstance();
                const arduinoJson = {
                    sketch: sketchFile,
                    // TODO EW, 2020-02-18: COM1 is Windows specific - what about OSX and Linux users?
                    port: dc.port || "COM1",
                    board: dc.board,
                    configuration: dc.configuration,
                };
                const arduinoConfigFilePath = path.join(destExample, constants.ARDUINO_CONFIG_FILE);
                util.mkdirRecursivelySync(path.dirname(arduinoConfigFilePath));
                fs.writeFileSync(arduinoConfigFilePath, JSON.stringify(arduinoJson, null, 4));
            }
            // Step 3: Open the arduino project at a new vscode window.
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(destExample), true);
        }
        return destExample;
    }
    get settings() {
        return this._settings;
    }
    get boardManager() {
        return this._boardManager;
    }
    set boardManager(value) {
        this._boardManager = value;
    }
    get libraryManager() {
        return this._libraryManager;
    }
    set libraryManager(value) {
        this._libraryManager = value;
    }
    get exampleManager() {
        return this._exampleManager;
    }
    set exampleManager(value) {
        this._exampleManager = value;
    }
    get programmerManager() {
        return this._programmerManager;
    }
    set programmerManager(value) {
        this._programmerManager = value;
    }
    /**
     * Runs the pre or post build command.
     * Usually before one of
     *  * verify
     *  * upload
     *  * upload using programmer
     * @param dc Device context prepared during one of the above actions
     * @param what "pre" if the pre-build command should be run, "post" if the
     * post-build command should be run.
     * @returns True if successful, false on error.
     */
    runPrePostBuildCommand(dc, environment, what) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmdline = what === "pre"
                ? dc.prebuild
                : dc.postbuild;
            if (!cmdline) {
                return true; // Successfully done nothing.
            }
            outputChannel_1.arduinoChannel.info(`Running ${what}-build command: "${cmdline}"`);
            let cmd;
            let args;
            // pre-/post-build commands feature full bash support on UNIX systems.
            // On Windows you have full cmd support.
            if (os.platform() === "win32") {
                args = [];
                cmd = cmdline;
            }
            else {
                args = ["-c", cmdline];
                cmd = "bash";
            }
            try {
                yield util.spawn(cmd, args, {
                    shell: os.platform() === "win32",
                    cwd: workspace_1.ArduinoWorkspace.rootPath,
                    env: Object.assign({}, environment),
                }, { channel: outputChannel_1.arduinoChannel.channel });
            }
            catch (ex) {
                const msg = ex.error
                    ? `${ex.error}`
                    : ex.code
                        ? `Exit code = ${ex.code}`
                        : JSON.stringify(ex);
                outputChannel_1.arduinoChannel.error(`Running ${what}-build command failed: ${os.EOL}${msg}`);
                return false;
            }
            return true;
        });
    }
    /**
     * Checks if the arduino cli is being used
     * @returns {bool} - true if arduino cli is being use
     */
    useArduinoCli() {
        return this._settings.useArduinoCli;
        // return VscodeSettings.getInstance().useArduinoCli;
    }
    /**
     * Checks if the line contains memory usage information
     * @param line output line to check
     * @returns {bool} true if line contains memory usage information
     */
    isMemoryUsageInformation(line) {
        return line.startsWith("Sketch uses ") || line.startsWith("Global variables use ");
    }
    /**
     * Private implementation. Not to be called directly. The wrapper build()
     * manages the build state.
     * @param buildMode See build()
     * @param buildDir See build()
     * @see https://github.com/arduino/Arduino/blob/master/build/shared/manpage.adoc
     */
    _build(buildMode, buildDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = deviceContext_1.DeviceContext.getInstance();
            const args = [];
            let restoreSerialMonitor = false;
            const verbose = vscodeSettings_1.VscodeSettings.getInstance().logLevel === constants.LogLevel.Verbose;
            if (!this.boardManager.currentBoard) {
                if (buildMode !== BuildMode.Analyze) {
                    logger.notifyUserError("boardManager.currentBoard", new Error(constants.messages.NO_BOARD_SELECTED));
                }
                return false;
            }
            const boardDescriptor = this.boardManager.currentBoard.getBuildConfig();
            if (this.useArduinoCli()) {
                args.push("-b", boardDescriptor);
            }
            else {
                args.push("--board", boardDescriptor);
            }
            if (!workspace_1.ArduinoWorkspace.rootPath) {
                vscode.window.showWarningMessage("Workspace doesn't seem to have a folder added to it yet.");
                return false;
            }
            if (!dc.sketch || !util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch))) {
                if (buildMode === BuildMode.Analyze) {
                    // Analyze runs non interactively
                    return false;
                }
                if (!(yield dc.resolveMainSketch())) {
                    vscode.window.showErrorMessage("No sketch file was found. Please specify the sketch in the arduino.json file");
                    return false;
                }
            }
            const selectSerial = () => __awaiter(this, void 0, void 0, function* () {
                const choice = yield vscode.window.showInformationMessage("Serial port is not specified. Do you want to select a serial port for uploading?", "Yes", "No");
                if (choice === "Yes") {
                    vscode.commands.executeCommand("arduino.selectSerialPort");
                }
            });
            if (buildMode === BuildMode.Upload) {
                if ((!dc.configuration || !/upload_method=[^=,]*st[^,]*link/i.test(dc.configuration)) && !dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (this.useArduinoCli()) {
                    args.push("compile", "--upload");
                }
                else {
                    args.push("--upload");
                }
                if (dc.port) {
                    args.push("--port", dc.port);
                }
            }
            else if (buildMode === BuildMode.CliUpload) {
                if ((!dc.configuration || !/upload_method=[^=,]*st[^,]*link/i.test(dc.configuration)) && !dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (!this.useArduinoCli()) {
                    outputChannel_1.arduinoChannel.error("This command is only available when using the Arduino CLI");
                    return false;
                }
                args.push("upload");
                if (dc.port) {
                    args.push("--port", dc.port);
                }
            }
            else if (buildMode === BuildMode.UploadProgrammer) {
                const programmer = this.programmerManager.currentProgrammer;
                if (!programmer) {
                    logger.notifyUserError("programmerManager.currentProgrammer", new Error(constants.messages.NO_PROGRAMMMER_SELECTED));
                    return false;
                }
                if (!dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (this.useArduinoCli()) {
                    args.push("compile", "--upload", "--programmer", programmer);
                }
                else {
                    args.push("--upload", "--useprogrammer", "--pref", `programmer=${programmer}`);
                }
                args.push("--port", dc.port);
            }
            else if (buildMode === BuildMode.CliUploadProgrammer) {
                const programmer = this.programmerManager.currentProgrammer;
                if (!programmer) {
                    logger.notifyUserError("programmerManager.currentProgrammer", new Error(constants.messages.NO_PROGRAMMMER_SELECTED));
                    return false;
                }
                if (!dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (!this.useArduinoCli()) {
                    outputChannel_1.arduinoChannel.error("This command is only available when using the Arduino CLI");
                    return false;
                }
                args.push("upload", "--programmer", programmer, "--port", dc.port);
            }
            else {
                if (this.useArduinoCli()) {
                    args.unshift("compile");
                }
                else {
                    args.push("--verify");
                }
            }
            if (dc.buildPreferences) {
                for (const pref of dc.buildPreferences) {
                    // Note: BuildPrefSetting makes sure that each preference
                    // value consists of exactly two items (key and value).
                    if (this.useArduinoCli()) {
                        args.push("--build-property", `${pref[0]}=${pref[1]}`);
                    }
                    else {
                        args.push("--pref", `${pref[0]}=${pref[1]}`);
                    }
                }
            }
            // We always build verbosely but filter the output based on the settings
            this._settings.useArduinoCli ? args.push("--verbose") : args.push("--verbose-build");
            if (verbose && !this._settings.useArduinoCli) {
                args.push("--verbose-upload");
            }
            yield vscode.workspace.saveAll(false);
            // we prepare the channel here since all following code will
            // or at leas can possibly output to it
            outputChannel_1.arduinoChannel.show();
            if (vscodeSettings_1.VscodeSettings.getInstance().clearOutputOnBuild) {
                outputChannel_1.arduinoChannel.clear();
            }
            outputChannel_1.arduinoChannel.start(`${buildMode} sketch '${dc.sketch}'`);
            if (buildDir || dc.output) {
                // 2020-02-29, EW: This whole code appears a bit wonky to me.
                //   What if the user specifies an output directory "../builds/my project"
                // the first choice of the path should be from the users explicit settings.
                if (dc.output) {
                    buildDir = path.resolve(workspace_1.ArduinoWorkspace.rootPath, dc.output);
                }
                else {
                    buildDir = path.resolve(workspace_1.ArduinoWorkspace.rootPath, buildDir);
                }
                const dirPath = path.dirname(buildDir);
                if (!util.directoryExistsSync(dirPath)) {
                    util.mkdirRecursivelySync(dirPath);
                }
                if (this.useArduinoCli()) {
                    args.push("--build-path", buildDir);
                }
                else {
                    args.push("--pref", `build.path=${buildDir}`);
                }
                outputChannel_1.arduinoChannel.info(`Please see the build logs in output path: ${buildDir}`);
            }
            else {
                const msg = "Output path is not specified. Unable to reuse previously compiled files. Build will be slower. See README.";
                outputChannel_1.arduinoChannel.warning(msg);
            }
            // Environment variables passed to pre- and post-build commands
            const env = {
                VSCA_BUILD_MODE: buildMode,
                VSCA_SKETCH: dc.sketch,
                VSCA_BOARD: boardDescriptor,
                VSCA_WORKSPACE_DIR: workspace_1.ArduinoWorkspace.rootPath,
                VSCA_LOG_LEVEL: verbose ? constants.LogLevel.Verbose : constants.LogLevel.Info,
            };
            if (dc.port) {
                env["VSCA_SERIAL"] = dc.port;
            }
            if (buildDir) {
                env["VSCA_BUILD_DIR"] = buildDir;
            }
            // TODO EW: What should we do with pre-/post build commands when running
            //   analysis? Some could use it to generate/manipulate code which could
            //   be a prerequisite for a successful build
            if (!(yield this.runPrePostBuildCommand(dc, env, "pre"))) {
                return false;
            }
            // stop serial monitor when everything is prepared and good
            // what makes restoring of its previous state easier
            if (buildMode === BuildMode.Upload ||
                buildMode === BuildMode.UploadProgrammer ||
                buildMode === BuildMode.CliUpload ||
                buildMode === BuildMode.CliUploadProgrammer) {
                restoreSerialMonitor = yield serialMonitor_1.SerialMonitor.getInstance().closeSerialMonitor(dc.port);
                usbDetector_1.UsbDetector.getInstance().pauseListening();
            }
            // Push sketch as last argument
            args.push(path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch));
            const cocopa = intellisense_1.makeCompilerParserContext(dc);
            const cleanup = (result) => __awaiter(this, void 0, void 0, function* () {
                let ret = true;
                if (result === "ok") {
                    ret = yield this.runPrePostBuildCommand(dc, env, "post");
                }
                yield cocopa.conclude();
                if (buildMode === BuildMode.Upload || buildMode === BuildMode.UploadProgrammer) {
                    usbDetector_1.UsbDetector.getInstance().resumeListening();
                    if (restoreSerialMonitor) {
                        yield serialMonitor_1.SerialMonitor.getInstance().openSerialMonitor();
                    }
                }
                return ret;
            });
            // Wrap line-oriented callbacks to accept arbitrary chunks of data.
            const wrapLineCallback = (callback) => {
                let buffer = "";
                let startIndex = 0;
                return (data) => {
                    buffer += data;
                    while (true) {
                        const pos = buffer.indexOf(os.EOL, startIndex);
                        if (pos < 0) {
                            startIndex = buffer.length;
                            break;
                        }
                        const line = buffer.substring(0, pos + os.EOL.length);
                        buffer = buffer.substring(pos + os.EOL.length);
                        startIndex = 0;
                        callback(line);
                    }
                };
            };
            const stdoutcb = wrapLineCallback((line) => {
                if (cocopa.callback) {
                    cocopa.callback(line);
                }
                if (verbose) {
                    outputChannel_1.arduinoChannel.channel.append(line);
                }
                else {
                    // Output sketch memory usage in non-verbose mode
                    if (this.isMemoryUsageInformation(line)) {
                        outputChannel_1.arduinoChannel.channel.append(line);
                    }
                }
            });
            const stderrcb = wrapLineCallback((line) => {
                if (os.platform() === "win32") {
                    line = line.trim();
                    if (line.length <= 0) {
                        return;
                    }
                    line = line.replace(/(?:\r|\r\n|\n)+/g, os.EOL);
                    line = `${line}${os.EOL}`;
                }
                if (!verbose) {
                    // Don't spill log with spurious info from the backend. This
                    // list could be fetched from a config file to accommodate
                    // messages of unknown board packages, newer backend revisions
                    const filters = [
                        /^Picked\sup\sJAVA_TOOL_OPTIONS:\s+/,
                        /^\d+\d+-\d+-\d+T\d+:\d+:\d+.\d+Z\s(?:INFO|WARN)\s/,
                        /^(?:DEBUG|TRACE|INFO)\s+/,
                        // 2022-04-09 22:48:46.204 Arduino[55373:2073803] Arg 25: '--pref'
                        /^[\d\-.:\s]*Arduino\[[\d:]*\]/,
                    ];
                    for (const f of filters) {
                        if (line.match(f)) {
                            return;
                        }
                    }
                }
                outputChannel_1.arduinoChannel.channel.append(line);
            });
            return yield util.spawn(this._settings.commandPath, args, { cwd: workspace_1.ArduinoWorkspace.rootPath }, { /*channel: arduinoChannel.channel,*/ stdout: stdoutcb, stderr: stderrcb }).then(() => __awaiter(this, void 0, void 0, function* () {
                const ret = yield cleanup("ok");
                if (ret) {
                    outputChannel_1.arduinoChannel.end(`${buildMode} sketch '${dc.sketch}'${os.EOL}`);
                }
                return ret;
            }), (reason) => __awaiter(this, void 0, void 0, function* () {
                yield cleanup("error");
                const msg = reason.code
                    ? `Exit with code=${reason.code}`
                    : JSON.stringify(reason);
                outputChannel_1.arduinoChannel.error(`${buildMode} sketch '${dc.sketch}': ${msg}${os.EOL}`);
                return false;
            }));
        });
    }
}
exports.ArduinoApp = ArduinoApp;

//# sourceMappingURL=arduino.js.map

// SIG // Begin signature block
// SIG // MIInqwYJKoZIhvcNAQcCoIInnDCCJ5gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // BXn8zb6WLbDGwUxwQco/8K4iKpa0R88nXOIvE5DTGb2g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIAHywTU7Qqn3FsGneAZV
// SIG // f7dCEwzNwZr4EPlrHeBF5FcLMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAWcwnZ2Sm04EoD+X+Gz+o2KDcOaWE/bphTTWs
// SIG // fV0RgGVoG9rbvBJ8RDUTyIhEeDEMEJPecZCX/vwR1ura
// SIG // 7qQ730uItBjjHtvKsiu8E1LdG0zBa+hFkkyRUXHYl1Ff
// SIG // k3pjys9gfMPuvNQM8pdqkbh/Vz8XZiS1swQMeO6iJU7+
// SIG // yu9Dkkwsrd2xCUWsI+GadDt7+8ya3xV8C9/dEeYJpCnZ
// SIG // JjOdBRsJxDVxjUlo9siW+p1P3ZQdqcp6qiv3umBZRDaW
// SIG // MUUQXjrateJ4GgwnH70HgMQ95ENAeOzlpOwmwh622cpU
// SIG // t/szN9ZRebAECCZeX2/QT16aifBBezY4TH5HxZDQv6GC
// SIG // FwwwghcIBgorBgEEAYI3AwMBMYIW+DCCFvQGCSqGSIb3
// SIG // DQEHAqCCFuUwghbhAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCDKu29d
// SIG // 8TjmxGIrPBEpVRVqPciacurGR1+ctIuKGvcJ5wIGYmtF
// SIG // Bz+zGBMyMDIyMDUwMzE5MDEwNy40MTRaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046MEE1Ni1F
// SIG // MzI5LTRENEQxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghFfMIIHEDCCBPigAwIBAgIT
// SIG // MwAAAac1uy7CZIVQKQABAAABpzANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MjAzMDIxODUxMjJaFw0yMzA1MTExODUxMjJaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046MEE1Ni1FMzI5LTRENEQx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQDtIzjGHVAF3nAlpuVek0aEGeIbDy3tFaegsMRY
// SIG // kwOZfOu3wGw8sZys3XwbH/9FyVV8yJHL8whEl6JJbzAw
// SIG // Q2ve0hL/grixCKKDGxQR9VnmIJi1TvU22y0rSYpTSE5k
// SIG // EEOBQeaszBLA36ZmmWTFloHTo6EkHnfVK445nLlrErJJ
// SIG // 7YmlA/1UHUHCzJ6XlBnOwkLAGKPR3CDG9R/A03Ge8gHt
// SIG // 2jmH++uj9jk+ed/+IXZyfSm6fxXw3lAFWLhHNcGZZmz3
// SIG // UWv7gseIil6bfNP+cKABkg5fL0jRcYuLplygpMFh5vBn
// SIG // g2d7TiszCHCGP+uBbaXaqTcG6hmtxpCU6BBT0eg+lydF
// SIG // sqnm2bzmYzEBHiwiSK0pxeC25JH5F+A+LHIys/dpSPS0
// SIG // bq4TD0wREOqcN4hrBD2Pia3MfwyZskFqm6TdxbJFrvcY
// SIG // YM2KGLEborAm+RSDEoYmpZcxM7pucSxOFOX7sRG8JNLm
// SIG // PWVQzVXxIYIkHnXEgHdxlr1TN+oLWMukCX4sQ+5bcI0p
// SIG // ubFWtb6AX9lmYAgt6+ERO1Z6L5amwnd5x8l7+fvFBky6
// SIG // u6kXUUEGgUF3pE/VI1Lm3DUvGWHmcCvHdnrQ/fJkiODK
// SIG // l3DMkkSlCfTmVUDVsyNy8kufgoyLLAR3b9fWjOgo10Lm
// SIG // ZJJpWTrTKpC0YNbZoYCOtchQvo8QdwIDAQABo4IBNjCC
// SIG // ATIwHQYDVR0OBBYEFB9suH8FmC4whW/hDkID8/T6WkWD
// SIG // MB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
// SIG // MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBs
// SIG // BggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAE8S
// SIG // +jHz2ToUfdQx0oZc2pewfLzglL85b21YWtFM4WX7yHGQ
// SIG // P20910120Dy5yA1pUXY0F+zxpDkYV/5qY2QguSe3w90y
// SIG // TJ/WUEPDF5ydLMd/0CSJTYD1WjqZPWJNWBKsiLTsjx69
// SIG // zpt7/6vYeX+ag5NCDFdrWqLM3tCRpTNzOc+2xpA5cvk3
// SIG // 4R/ZSNNw/xcy4481vBLb3Kpph+vEB3U7JfODVhpHdnVJ
// SIG // VRdmgVjFKa2/B/RIT1EHAXKX9dSAI/n9OMgd53EC4fj/
// SIG // j0ktpMTSy3kYPQlm5rLoKZWD9Q+cFvmh9pncgZT12TCG
// SIG // hESRb2VGcg/EXyfALBN7lNyUneNPEAQ2lw1H/eCot8BF
// SIG // 07ZfCUCLRnN4sUWFjSIIa2iOId3f/tuujgendFDNogV0
// SIG // qsM/LXY/sUkk+hu2WKsWrRM7fNOk9QQR3vbWf5q9kudl
// SIG // IyYAFUAYAkIooosTTtu4OUMuAg0veL0+J3wtpV8C5Yaw
// SIG // HDapwCSpkaivHoSOdE0yGRjjYXYRnDOcVFXh5nkcvRur
// SIG // n1Ogejm9K1ui12Nqky174Lff8f1xIdQq57lngVmvRN9O
// SIG // wG3j2gaKbvPlp1418ujdNY/wFQatU8ip0F9Z0jI1PYGd
// SIG // xGhvKEv8zTOfRyvyIZwM1nlXHQWK6v4bLvSTLwaRfmRE
// SIG // GNmVqWxCZuxC5fwrkSDwMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // A1UECxMdVGhhbGVzIFRTUyBFU046MEE1Ni1FMzI5LTRE
// SIG // NEQxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAMB+7x4pkgM3
// SIG // gyzdKs1jW9qdr0R/oIGDMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDm
// SIG // G7IvMCIYDzIwMjIwNTAzMTc1MjQ3WhgPMjAyMjA1MDQx
// SIG // NzUyNDdaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOYb
// SIG // si8CAQAwCgIBAAICCtUCAf8wBwIBAAICEd4wCgIFAOYd
// SIG // A68CAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGE
// SIG // WQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkq
// SIG // hkiG9w0BAQUFAAOBgQAx8jKFEKWgRsroATxcjTVem7de
// SIG // Tyz7xb5/cugW5LRkig6kWUU7dlo9UiCM1ueyB87wkjAJ
// SIG // gT0I5NeebguBJkasZezIGoT8ATyNXN+aTwPQ26tv5W6s
// SIG // 5GL/CNjZxYZpythvgyICCkA5LXDlhN/n9+w1JgVJ9ItP
// SIG // SJd1ZNWVNkIZyDGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABpzW7LsJkhVAp
// SIG // AAEAAAGnMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIEtF3Bb+zOCFU5K6VNXcUQr6U/TvBVXymtVQjF17
// SIG // +CAVMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // R/B/5wmVAuC9GKm897B98OZM4cCeEagpF1ysTT7ajhsw
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAac1uy7CZIVQKQABAAABpzAiBCC8Y8mY1rPC
// SIG // T+F4JJKSQZE9PZia3p1vVtCMY7TygrJMsjANBgkqhkiG
// SIG // 9w0BAQsFAASCAgBLC2zee1qUuuCZ3bbH2fHp73Bi26iO
// SIG // y4uqZbmMZWNYgnLzk4t4CTpA5tZuW20VHNuJw+J58pQl
// SIG // xEMYgY/bLvZqlbHcVhMq+S7lkbxs7TRJeltiNh6jKoxG
// SIG // aFNcnrbPdZimHgAdIXCuoIED8n1InbLn0lZIqboTpeqU
// SIG // Yh+RQZYjqzDfD37FIL+yXIs9UXAfGaTtcTTIq/gBy5Is
// SIG // VFUlVKsSW3wNTnBY8AtuUqIi1dYbNrrIvu56y625hUEm
// SIG // j24uzJp25dNtG5vh5Fve3ZTqtREa7xj+UzI4x5WI/r8I
// SIG // e0m1S5mj7uIGB7LYrme98uIDPCnh5LYqJWgaEYs3iwMg
// SIG // sBlPxp5DWcKqUXgaGwAtYQNyd3/+jBgjRw0F+juUeYSu
// SIG // JHIm9E09ouq5D3NCKT1NDmZGPHacLHxzTbZ6jyqvO4+J
// SIG // CGZyHxgM0u8Zxq5QN3HlqYZJbtrvkI1gRM1YW2PYxYBe
// SIG // c/TINPlEzqSjbb2pS2UFiIYPthYPhV3p2a4xbd5bAvSb
// SIG // EZtwdVWxMxM+28dkwbk2zS44r186XNULFPp8sx/+fiLs
// SIG // 4UtWdU7GgAztcSlJ/x1IMr9VHlpRw7GUZRNAr9Ihi4+T
// SIG // l4ryMUGXlvRW4rKybuU/eNTeuL849tFWcvfmiA0RflVr
// SIG // xOAQPdC+do+SsljUiyeaEBYlj66WR0jC/A/xoA==
// SIG // End signature block
