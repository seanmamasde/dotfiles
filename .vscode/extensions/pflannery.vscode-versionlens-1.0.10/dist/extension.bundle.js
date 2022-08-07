module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/activate.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../package.json":
/*!**********************************!*\
  !*** external "../package.json" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("../package.json");

/***/ }),

/***/ "./src/activate.ts":
/*!*************************!*\
  !*** ./src/activate.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
async function activate(context) {
    presentation_extension_1.configureContainer(context)
        .then(container => {
        const { version } = __webpack_require__(/*! ../package.json */ "../package.json");
        const { logger, loggingOptions, textEditorEvents, } = container.cradle;
        // log general start up info
        logger.info('version: %s', version);
        logger.info('log level: %s', loggingOptions.level);
        logger.info('log path: %s', context.logPath);
        // resolve commands
        container.resolve('iconCommands');
        container.resolve('suggestionCommands');
        // ensure icons are shown if editor is already active
        textEditorEvents.onDidChangeActiveTextEditor(vscode_1.window.activeTextEditor);
    });
}
exports.activate = activate;


/***/ }),

/***/ "./src/core.clients/index.ts":
/*!***********************************!*\
  !*** ./src/core.clients/index.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlHelpers = void 0;
__exportStar(__webpack_require__(/*! ./src/definitions/clientResponses */ "./src/core.clients/src/definitions/clientResponses.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eCachingContributions */ "./src/core.clients/src/definitions/eCachingContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eHttpContributions */ "./src/core.clients/src/definitions/eHttpContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eHttpClientRequestMethods */ "./src/core.clients/src/definitions/eHttpClientRequestMethods.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iHttpOptions */ "./src/core.clients/src/definitions/iHttpOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iCachingOptions */ "./src/core.clients/src/definitions/iCachingOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iJsonHttpClient */ "./src/core.clients/src/definitions/iJsonHttpClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iHttpClient */ "./src/core.clients/src/definitions/iHttpClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iProcessClient */ "./src/core.clients/src/definitions/iProcessClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tHttpRequestOptions */ "./src/core.clients/src/definitions/tHttpRequestOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/caching/expiryCacheMap */ "./src/core.clients/src/caching/expiryCacheMap.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/options/cachingOptions */ "./src/core.clients/src/options/cachingOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/options/httpOptions */ "./src/core.clients/src/options/httpOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/requests/abstractCachedRequest */ "./src/core.clients/src/requests/abstractCachedRequest.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/requests/jsonHttpClient */ "./src/core.clients/src/requests/jsonHttpClient.ts"), exports);
exports.UrlHelpers = __webpack_require__(/*! ./src/helpers/urlHelpers */ "./src/core.clients/src/helpers/urlHelpers.ts");


/***/ }),

/***/ "./src/core.clients/src/caching/expiryCacheMap.ts":
/*!********************************************************!*\
  !*** ./src/core.clients/src/caching/expiryCacheMap.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiryCacheMap = void 0;
class ExpiryCacheMap {
    constructor(cachingOpts) {
        this.cachingOpts = cachingOpts;
        this.cacheMap = {};
    }
    clear() {
        this.cacheMap = {};
    }
    hasExpired(key) {
        const entry = this.cacheMap[key];
        if (!entry)
            return true;
        return Date.now() > entry.expiryTime;
    }
    expire(key) {
        const entry = this.cacheMap[key];
        if (entry)
            delete this.cacheMap[key];
        return entry.data;
    }
    get(key) {
        const entry = this.cacheMap[key];
        return entry && entry.data;
    }
    set(key, data) {
        const expiryTime = Date.now() + this.cachingOpts.duration;
        const newEntry = {
            expiryTime,
            data
        };
        this.cacheMap[key] = newEntry;
        return newEntry.data;
    }
}
exports.ExpiryCacheMap = ExpiryCacheMap;


/***/ }),

/***/ "./src/core.clients/src/definitions/clientResponses.ts":
/*!*************************************************************!*\
  !*** ./src/core.clients/src/definitions/clientResponses.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientResponseSource = void 0;
var ClientResponseSource;
(function (ClientResponseSource) {
    ClientResponseSource["remote"] = "remote";
    ClientResponseSource["cache"] = "cache";
    ClientResponseSource["local"] = "local";
})(ClientResponseSource = exports.ClientResponseSource || (exports.ClientResponseSource = {}));


/***/ }),

/***/ "./src/core.clients/src/definitions/eCachingContributions.ts":
/*!*******************************************************************!*\
  !*** ./src/core.clients/src/definitions/eCachingContributions.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingContributions = void 0;
var CachingContributions;
(function (CachingContributions) {
    CachingContributions["CacheDuration"] = "duration";
})(CachingContributions = exports.CachingContributions || (exports.CachingContributions = {}));


/***/ }),

/***/ "./src/core.clients/src/definitions/eHttpClientRequestMethods.ts":
/*!***********************************************************************!*\
  !*** ./src/core.clients/src/definitions/eHttpClientRequestMethods.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientRequestMethods = void 0;
var HttpClientRequestMethods;
(function (HttpClientRequestMethods) {
    HttpClientRequestMethods["get"] = "GET";
    HttpClientRequestMethods["head"] = "HEAD";
})(HttpClientRequestMethods = exports.HttpClientRequestMethods || (exports.HttpClientRequestMethods = {}));


/***/ }),

/***/ "./src/core.clients/src/definitions/eHttpContributions.ts":
/*!****************************************************************!*\
  !*** ./src/core.clients/src/definitions/eHttpContributions.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpContributions = void 0;
var HttpContributions;
(function (HttpContributions) {
    HttpContributions["StrictSSL"] = "strictSSL";
})(HttpContributions = exports.HttpContributions || (exports.HttpContributions = {}));


/***/ }),

/***/ "./src/core.clients/src/definitions/iCachingOptions.ts":
/*!*************************************************************!*\
  !*** ./src/core.clients/src/definitions/iCachingOptions.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.clients/src/definitions/iHttpClient.ts":
/*!*********************************************************!*\
  !*** ./src/core.clients/src/definitions/iHttpClient.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.clients/src/definitions/iHttpOptions.ts":
/*!**********************************************************!*\
  !*** ./src/core.clients/src/definitions/iHttpOptions.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.clients/src/definitions/iJsonHttpClient.ts":
/*!*************************************************************!*\
  !*** ./src/core.clients/src/definitions/iJsonHttpClient.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.clients/src/definitions/iProcessClient.ts":
/*!************************************************************!*\
  !*** ./src/core.clients/src/definitions/iProcessClient.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.clients/src/definitions/tHttpRequestOptions.ts":
/*!*****************************************************************!*\
  !*** ./src/core.clients/src/definitions/tHttpRequestOptions.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.clients/src/helpers/urlHelpers.ts":
/*!****************************************************!*\
  !*** ./src/core.clients/src/helpers/urlHelpers.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureEndSlash = exports.createUrl = exports.getProtocolFromUrl = exports.RegistryProtocols = void 0;
var RegistryProtocols;
(function (RegistryProtocols) {
    RegistryProtocols["file"] = "file:";
    RegistryProtocols["http"] = "http:";
    RegistryProtocols["https"] = "https:";
})(RegistryProtocols = exports.RegistryProtocols || (exports.RegistryProtocols = {}));
function getProtocolFromUrl(url) {
    const { parse } = __webpack_require__(/*! url */ "url");
    const sourceUrl = parse(url);
    const registryProtocol = sourceUrl.protocol === null ?
        RegistryProtocols.file :
        RegistryProtocols[sourceUrl.protocol.substr(0, sourceUrl.protocol.length - 1)];
    return registryProtocol || RegistryProtocols.file;
}
exports.getProtocolFromUrl = getProtocolFromUrl;
function createUrl(baseUrl, queryParams) {
    const query = buildQueryParams(queryParams);
    const slashedUrl = query.length > 0 ?
        stripEndSlash(baseUrl) :
        baseUrl;
    return slashedUrl + query;
}
exports.createUrl = createUrl;
function buildQueryParams(queryParams) {
    let query = '';
    if (queryParams) {
        query = Object.keys(queryParams)
            .map(key => `${key}=${queryParams[key]}`)
            .join('&');
        query = (query.length > 0) ? '?' + query : '';
    }
    return query;
}
function stripEndSlash(url) {
    return url.endsWith('/') ? url.substr(url.length - 1) : url;
}
function ensureEndSlash(url) {
    return url.endsWith('/') ? url : url + '/';
}
exports.ensureEndSlash = ensureEndSlash;


/***/ }),

/***/ "./src/core.clients/src/options/cachingOptions.ts":
/*!********************************************************!*\
  !*** ./src/core.clients/src/options/cachingOptions.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingOptions = void 0;
const core_configuration_1 = __webpack_require__(/*! core.configuration */ "./src/core.configuration/index.ts");
const eCachingContributions_1 = __webpack_require__(/*! ../definitions/eCachingContributions */ "./src/core.clients/src/definitions/eCachingContributions.ts");
class CachingOptions extends core_configuration_1.OptionsWithFallback {
    constructor(config, section, fallbackSection = null) {
        super(config, section, fallbackSection);
    }
    get duration() {
        const durationMin = this.getOrDefault(eCachingContributions_1.CachingContributions.CacheDuration, 0);
        // convert to milliseconds
        return durationMin * 60000;
    }
}
exports.CachingOptions = CachingOptions;


/***/ }),

/***/ "./src/core.clients/src/options/httpOptions.ts":
/*!*****************************************************!*\
  !*** ./src/core.clients/src/options/httpOptions.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpOptions = void 0;
const core_configuration_1 = __webpack_require__(/*! core.configuration */ "./src/core.configuration/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class HttpOptions extends core_configuration_1.OptionsWithFallback {
    constructor(config, section, fallbackSection = null) {
        super(config, section, fallbackSection);
    }
    get strictSSL() {
        return this.getOrDefault(core_clients_1.HttpContributions.StrictSSL, true);
    }
}
exports.HttpOptions = HttpOptions;


/***/ }),

/***/ "./src/core.clients/src/requests/abstractCachedRequest.ts":
/*!****************************************************************!*\
  !*** ./src/core.clients/src/requests/abstractCachedRequest.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCachedRequest = void 0;
const expiryCacheMap_1 = __webpack_require__(/*! ../caching/expiryCacheMap */ "./src/core.clients/src/caching/expiryCacheMap.ts");
const clientResponses_1 = __webpack_require__(/*! ../definitions/clientResponses */ "./src/core.clients/src/definitions/clientResponses.ts");
class AbstractCachedRequest {
    constructor(cachingOpts) {
        this.cache = new expiryCacheMap_1.ExpiryCacheMap(cachingOpts);
    }
    createCachedResponse(cacheKey, status, data, rejected = false, source = clientResponses_1.ClientResponseSource.remote) {
        const cacheEnabled = this.cache.cachingOpts.duration > 0;
        if (cacheEnabled) {
            //  cache reponse (don't return, keep immutable)
            this.cache.set(cacheKey, {
                source: clientResponses_1.ClientResponseSource.cache,
                status,
                data,
                rejected
            });
        }
        // return original fetched data
        return {
            source,
            status,
            data,
            rejected
        };
    }
}
exports.AbstractCachedRequest = AbstractCachedRequest;


/***/ }),

/***/ "./src/core.clients/src/requests/jsonHttpClient.ts":
/*!*********************************************************!*\
  !*** ./src/core.clients/src/requests/jsonHttpClient.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonHttpClient = void 0;
class JsonHttpClient {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async request(method, url, query = {}, headers = {}) {
        return this.httpClient.request(method, url, query, headers)
            .then(function (response) {
            return {
                source: response.source,
                status: response.status,
                data: JSON.parse(response.data),
            };
        });
    }
}
exports.JsonHttpClient = JsonHttpClient;


/***/ }),

/***/ "./src/core.configuration/index.ts":
/*!*****************************************!*\
  !*** ./src/core.configuration/index.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/definitions/iConfig */ "./src/core.configuration/src/definitions/iConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iOptions */ "./src/core.configuration/src/definitions/iOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/options */ "./src/core.configuration/src/options.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/optionsWithFallback */ "./src/core.configuration/src/optionsWithFallback.ts"), exports);


/***/ }),

/***/ "./src/core.configuration/src/definitions/iConfig.ts":
/*!***********************************************************!*\
  !*** ./src/core.configuration/src/definitions/iConfig.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.configuration/src/definitions/iOptions.ts":
/*!************************************************************!*\
  !*** ./src/core.configuration/src/definitions/iOptions.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.configuration/src/options.ts":
/*!***********************************************!*\
  !*** ./src/core.configuration/src/options.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
class Options {
    constructor(config, section) {
        this.config = config;
        this.section = (section.length > 0) ? section + '.' : '';
    }
    get(key) {
        return this.config.get(`${this.section}${key}`);
    }
    defrost() {
        this.config.defrost();
    }
}
exports.Options = Options;


/***/ }),

/***/ "./src/core.configuration/src/optionsWithFallback.ts":
/*!***********************************************************!*\
  !*** ./src/core.configuration/src/optionsWithFallback.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsWithFallback = void 0;
const core_configuration_1 = __webpack_require__(/*! core.configuration */ "./src/core.configuration/index.ts");
class OptionsWithFallback extends core_configuration_1.Options {
    constructor(config, section, fallbackSection = null) {
        super(config, section);
        this.fallbackSection = fallbackSection;
    }
    get(key) {
        // attempt to get the section value
        const sectionValue = this.config.get(`${this.section}${key}`);
        // return section value
        if (sectionValue !== null && sectionValue !== undefined)
            return sectionValue;
        // attempt to get fallback section value
        let fallbackSectionValue;
        if (this.fallbackSection !== null) {
            fallbackSectionValue = this.config.get(`${this.fallbackSection}.${key}`);
        }
        // return fallback key value
        return fallbackSectionValue;
    }
    getOrDefault(key, defaultValue) {
        // attempt to get the section value
        const value = this.get(key);
        // return key value
        if (value !== null && value !== undefined)
            return value;
        // return default value
        return defaultValue;
    }
}
exports.OptionsWithFallback = OptionsWithFallback;


/***/ }),

/***/ "./src/core.logging/index.ts":
/*!***********************************!*\
  !*** ./src/core.logging/index.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/definitions/eLogLevelTypes */ "./src/core.logging/src/definitions/eLogLevelTypes.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iLoggingOptions */ "./src/core.logging/src/definitions/iLoggingOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iLogger */ "./src/core.logging/src/definitions/iLogger.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tChildLoggerOptions */ "./src/core.logging/src/definitions/tChildLoggerOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/loggingOptions */ "./src/core.logging/src/loggingOptions.ts"), exports);


/***/ }),

/***/ "./src/core.logging/src/definitions/eLogLevelTypes.ts":
/*!************************************************************!*\
  !*** ./src/core.logging/src/definitions/eLogLevelTypes.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevelTypes = void 0;
var LogLevelTypes;
(function (LogLevelTypes) {
    LogLevelTypes["Error"] = "error";
    LogLevelTypes["Info"] = "info";
    LogLevelTypes["Debug"] = "debug";
})(LogLevelTypes = exports.LogLevelTypes || (exports.LogLevelTypes = {}));


/***/ }),

/***/ "./src/core.logging/src/definitions/iLogger.ts":
/*!*****************************************************!*\
  !*** ./src/core.logging/src/definitions/iLogger.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.logging/src/definitions/iLoggingOptions.ts":
/*!*************************************************************!*\
  !*** ./src/core.logging/src/definitions/iLoggingOptions.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.logging/src/definitions/tChildLoggerOptions.ts":
/*!*****************************************************************!*\
  !*** ./src/core.logging/src/definitions/tChildLoggerOptions.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.logging/src/loggingOptions.ts":
/*!************************************************!*\
  !*** ./src/core.logging/src/loggingOptions.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingOptions = exports.LoggingContributions = void 0;
const core_configuration_1 = __webpack_require__(/*! core.configuration */ "./src/core.configuration/index.ts");
var LoggingContributions;
(function (LoggingContributions) {
    LoggingContributions["LoggingLevel"] = "level";
})(LoggingContributions = exports.LoggingContributions || (exports.LoggingContributions = {}));
class LoggingOptions extends core_configuration_1.Options {
    constructor(config, section) {
        super(config, section);
    }
    get level() {
        return super.get(LoggingContributions.LoggingLevel);
    }
    get timestampFormat() { return 'YYYY-MM-DD HH:mm:ss'; }
}
exports.LoggingOptions = LoggingOptions;


/***/ }),

/***/ "./src/core.packages/index.ts":
/*!************************************!*\
  !*** ./src/core.packages/index.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionHelpers = exports.ResponseFactory = exports.RequestFactory = exports.DocumentFactory = void 0;
__exportStar(__webpack_require__(/*! ./src/definitions/ePackageResponseErrors */ "./src/core.packages/src/definitions/ePackageResponseErrors.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/ePackageSourceTypes */ "./src/core.packages/src/definitions/ePackageSourceTypes.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/ePackageVersionTypes */ "./src/core.packages/src/definitions/ePackageVersionTypes.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iPackageClient */ "./src/core.packages/src/definitions/iPackageClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iPackageDependency */ "./src/core.packages/src/definitions/iPackageDependency.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tPackageDependencyRange */ "./src/core.packages/src/definitions/tPackageDependencyRange.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tPackageDocument */ "./src/core.packages/src/definitions/tPackageDocument.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tPackageIdentifier */ "./src/core.packages/src/definitions/tPackageIdentifier.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tPackageNameVersion */ "./src/core.packages/src/definitions/tPackageNameVersion.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tPackageRequest */ "./src/core.packages/src/definitions/tPackageRequest.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tPackageResponseStatus */ "./src/core.packages/src/definitions/tPackageResponseStatus.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tSemverSpec */ "./src/core.packages/src/definitions/tSemverSpec.ts"), exports);
exports.DocumentFactory = __webpack_require__(/*! ./src/factories/packageDocumentFactory */ "./src/core.packages/src/factories/packageDocumentFactory.ts");
exports.RequestFactory = __webpack_require__(/*! ./src/factories/packageRequestFactory */ "./src/core.packages/src/factories/packageRequestFactory.ts");
exports.ResponseFactory = __webpack_require__(/*! ./src/factories/packageResponseFactory */ "./src/core.packages/src/factories/packageResponseFactory.ts");
exports.VersionHelpers = __webpack_require__(/*! ./src/helpers/versionHelpers */ "./src/core.packages/src/helpers/versionHelpers.ts");
__exportStar(__webpack_require__(/*! ./src/models/packageResponse */ "./src/core.packages/src/models/packageResponse.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/parsers/jsonPackageParser */ "./src/core.packages/src/parsers/jsonPackageParser.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/parsers/yamlPackageParser */ "./src/core.packages/src/parsers/yamlPackageParser.ts"), exports);


/***/ }),

/***/ "./src/core.packages/src/definitions/ePackageResponseErrors.ts":
/*!*********************************************************************!*\
  !*** ./src/core.packages/src/definitions/ePackageResponseErrors.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageResponseErrors = void 0;
var PackageResponseErrors;
(function (PackageResponseErrors) {
    PackageResponseErrors[PackageResponseErrors["None"] = 0] = "None";
    PackageResponseErrors[PackageResponseErrors["NotFound"] = 1] = "NotFound";
    PackageResponseErrors[PackageResponseErrors["NotSupported"] = 2] = "NotSupported";
    PackageResponseErrors[PackageResponseErrors["GitNotFound"] = 3] = "GitNotFound";
    PackageResponseErrors[PackageResponseErrors["InvalidVersion"] = 4] = "InvalidVersion";
    PackageResponseErrors[PackageResponseErrors["Unexpected"] = 5] = "Unexpected";
})(PackageResponseErrors = exports.PackageResponseErrors || (exports.PackageResponseErrors = {}));
;


/***/ }),

/***/ "./src/core.packages/src/definitions/ePackageSourceTypes.ts":
/*!******************************************************************!*\
  !*** ./src/core.packages/src/definitions/ePackageSourceTypes.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageSourceTypes = void 0;
var PackageSourceTypes;
(function (PackageSourceTypes) {
    PackageSourceTypes["Directory"] = "directory";
    PackageSourceTypes["File"] = "file";
    PackageSourceTypes["Git"] = "git";
    PackageSourceTypes["Github"] = "github";
    PackageSourceTypes["Registry"] = "registry";
})(PackageSourceTypes = exports.PackageSourceTypes || (exports.PackageSourceTypes = {}));


/***/ }),

/***/ "./src/core.packages/src/definitions/ePackageVersionTypes.ts":
/*!*******************************************************************!*\
  !*** ./src/core.packages/src/definitions/ePackageVersionTypes.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageVersionTypes = void 0;
var PackageVersionTypes;
(function (PackageVersionTypes) {
    PackageVersionTypes["Version"] = "version";
    PackageVersionTypes["Range"] = "range";
    PackageVersionTypes["Tag"] = "tag";
    PackageVersionTypes["Alias"] = "alias";
    PackageVersionTypes["Committish"] = "committish";
})(PackageVersionTypes = exports.PackageVersionTypes || (exports.PackageVersionTypes = {}));


/***/ }),

/***/ "./src/core.packages/src/definitions/iPackageClient.ts":
/*!*************************************************************!*\
  !*** ./src/core.packages/src/definitions/iPackageClient.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/iPackageDependency.ts":
/*!*****************************************************************!*\
  !*** ./src/core.packages/src/definitions/iPackageDependency.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
;


/***/ }),

/***/ "./src/core.packages/src/definitions/tPackageDependencyRange.ts":
/*!**********************************************************************!*\
  !*** ./src/core.packages/src/definitions/tPackageDependencyRange.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/tPackageDocument.ts":
/*!***************************************************************!*\
  !*** ./src/core.packages/src/definitions/tPackageDocument.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/tPackageIdentifier.ts":
/*!*****************************************************************!*\
  !*** ./src/core.packages/src/definitions/tPackageIdentifier.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/tPackageNameVersion.ts":
/*!******************************************************************!*\
  !*** ./src/core.packages/src/definitions/tPackageNameVersion.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/tPackageRequest.ts":
/*!**************************************************************!*\
  !*** ./src/core.packages/src/definitions/tPackageRequest.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/tPackageResponseStatus.ts":
/*!*********************************************************************!*\
  !*** ./src/core.packages/src/definitions/tPackageResponseStatus.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/definitions/tSemverSpec.ts":
/*!**********************************************************!*\
  !*** ./src/core.packages/src/definitions/tSemverSpec.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.packages/src/factories/packageDocumentFactory.ts":
/*!*******************************************************************!*\
  !*** ./src/core.packages/src/factories/packageDocumentFactory.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createFixed = exports.createNoMatch = exports.createInvalidVersion = exports.create = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const ePackageSourceTypes_1 = __webpack_require__(/*! ../definitions/ePackageSourceTypes */ "./src/core.packages/src/definitions/ePackageSourceTypes.ts");
function create(source, request, response, suggestions) {
    const { providerName, package: requested } = request;
    return {
        providerName,
        source,
        type: null,
        requested,
        resolved: null,
        response,
        suggestions
    };
}
exports.create = create;
function createInvalidVersion(providerName, requested, response, type) {
    const source = ePackageSourceTypes_1.PackageSourceTypes.Registry;
    const suggestions = [
        core_suggestions_1.SuggestionFactory.createInvalid(''),
        core_suggestions_1.SuggestionFactory.createLatest(),
    ];
    return {
        providerName,
        source,
        type,
        requested,
        response,
        resolved: null,
        suggestions
    };
}
exports.createInvalidVersion = createInvalidVersion;
function createNoMatch(providerName, source, type, requested, response, latestVersion) {
    const suggestions = [
        core_suggestions_1.SuggestionFactory.createNoMatch(),
        core_suggestions_1.SuggestionFactory.createLatest(latestVersion),
    ];
    return {
        providerName,
        source,
        type,
        requested,
        response,
        resolved: null,
        suggestions
    };
}
exports.createNoMatch = createNoMatch;
function createFixed(providerName, source, requested, response, type, fixedVersion) {
    const suggestions = [
        core_suggestions_1.SuggestionFactory.createFixedStatus(fixedVersion)
    ];
    return {
        providerName,
        source,
        type,
        requested,
        response,
        resolved: null,
        suggestions
    };
}
exports.createFixed = createFixed;


/***/ }),

/***/ "./src/core.packages/src/factories/packageRequestFactory.ts":
/*!******************************************************************!*\
  !*** ./src/core.packages/src/factories/packageRequestFactory.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.executePackageRequest = exports.executeDependencyRequests = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
async function executeDependencyRequests(packagePath, client, clientData, dependencies) {
    const { providerName } = client.config;
    const results = [];
    const promises = dependencies.map(function (dependency) {
        // build the client request
        const { name, version } = dependency.packageInfo;
        const clientRequest = {
            providerName,
            clientData,
            dependency,
            package: {
                name,
                version,
                path: packagePath,
            },
            attempt: 0
        };
        // execute request
        const promisedDependency = core_packages_1.RequestFactory.executePackageRequest(client, clientRequest);
        // flatten responses
        return promisedDependency.then(function (responses) {
            if (Array.isArray(responses))
                results.push(...responses);
            else
                results.push(responses);
        });
    });
    return Promise.all(promises).then(_ => results);
}
exports.executeDependencyRequests = executeDependencyRequests;
async function executePackageRequest(client, request) {
    client.logger.debug(`Queued package: %s`, request.package.name);
    return client.fetchPackage(request)
        .then(function (response) {
        client.logger.info('Fetched %s package from %s: %s@%s', response.providerName, response.response.source, request.package.name, request.package.version);
        return core_packages_1.ResponseFactory.createSuccess(request, response);
    })
        .catch(function (error) {
        client.logger.error(`%s caught an exception.\n Package: %j\n Error: %j`, executePackageRequest.name, request.package, error);
        return Promise.reject(error);
    });
}
exports.executePackageRequest = executePackageRequest;


/***/ }),

/***/ "./src/core.packages/src/factories/packageResponseFactory.ts":
/*!*******************************************************************!*\
  !*** ./src/core.packages/src/factories/packageResponseFactory.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccess = exports.createResponseStatus = void 0;
function createResponseStatus(source, status) {
    return {
        source,
        status
    };
}
exports.createResponseStatus = createResponseStatus;
function createSuccess(request, response) {
    // map the documents to responses
    return response.suggestions.map(function (suggestion, order) {
        return {
            providerName: response.providerName,
            source: response.source,
            type: response.type,
            nameRange: request.dependency.nameRange,
            versionRange: request.dependency.versionRange,
            order,
            requested: response.requested,
            resolved: response.resolved,
            suggestion,
        };
    });
}
exports.createSuccess = createSuccess;


/***/ }),

/***/ "./src/core.packages/src/helpers/versionHelpers.ts":
/*!*********************************************************!*\
  !*** ./src/core.packages/src/helpers/versionHelpers.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.formatWithExistingLeading = exports.semverLeadingChars = exports.extractSymbolFromVersionRegex = exports.filterSemverVersions = exports.filterPrereleasesGtMinRange = exports.parseSemver = exports.friendlifyPrereleaseName = exports.isFourSegmentedVersion = exports.isFixedVersion = exports.removeFourSegmentVersionsFromArray = exports.lteFromArray = exports.splitReleasesFromArray = exports.extractTaggedVersions = exports.extractVersionsFromMap = exports.filterPrereleasesFromDistTags = exports.loosePrereleases = exports.formatTagNameRegex = void 0;
const ePackageVersionTypes_1 = __webpack_require__(/*! ../definitions/ePackageVersionTypes */ "./src/core.packages/src/definitions/ePackageVersionTypes.ts");
exports.formatTagNameRegex = /^[^0-9\-]*/;
exports.loosePrereleases = { loose: true, includePrerelease: true };
function filterPrereleasesFromDistTags(distTags) {
    const { prerelease } = __webpack_require__(/*! semver */ "semver");
    const prereleases = [];
    Object.keys(distTags)
        .forEach((key) => {
        if (prerelease(distTags[key]))
            prereleases.push(distTags[key]);
    });
    return prereleases;
}
exports.filterPrereleasesFromDistTags = filterPrereleasesFromDistTags;
function extractVersionsFromMap(versions) {
    return versions.map(function (pnv) {
        return pnv.version;
    });
}
exports.extractVersionsFromMap = extractVersionsFromMap;
function extractTaggedVersions(versions) {
    const { prerelease } = __webpack_require__(/*! semver */ "semver");
    const results = [];
    versions.forEach(function (version) {
        const prereleaseComponents = prerelease(version);
        const isPrerelease = !!prereleaseComponents && prereleaseComponents.length > 0;
        if (isPrerelease) {
            const regexResult = exports.formatTagNameRegex.exec(prereleaseComponents[0]);
            let name = regexResult[0].toLowerCase();
            // capture cases like x.x.x-x.x.x
            if (!name)
                name = prereleaseComponents.join('.');
            results.push({
                name,
                version
            });
        }
    });
    return results;
}
exports.extractTaggedVersions = extractTaggedVersions;
function splitReleasesFromArray(versions) {
    const { prerelease } = __webpack_require__(/*! semver */ "semver");
    const releases = [];
    const prereleases = [];
    versions.forEach(function (version) {
        if (prerelease(version))
            prereleases.push(version);
        else
            releases.push(version);
    });
    return { releases, prereleases };
}
exports.splitReleasesFromArray = splitReleasesFromArray;
function lteFromArray(versions, version) {
    const { lte } = __webpack_require__(/*! semver */ "semver");
    return versions.filter(function (testVersion) {
        return lte(testVersion, version);
    });
}
exports.lteFromArray = lteFromArray;
function removeFourSegmentVersionsFromArray(versions) {
    return versions.filter(function (version) {
        return isFourSegmentedVersion(version) === false;
    });
}
exports.removeFourSegmentVersionsFromArray = removeFourSegmentVersionsFromArray;
function isFixedVersion(versionToCheck) {
    const { Range, valid } = __webpack_require__(/*! semver */ "semver");
    const testRange = new Range(versionToCheck, exports.loosePrereleases);
    return valid(versionToCheck) !== null && testRange.set[0][0].operator === "";
}
exports.isFixedVersion = isFixedVersion;
const isfourSegmentVersionRegex = /^(\d+\.)(\d+\.)(\d+\.)(\*|\d+)$/g;
function isFourSegmentedVersion(versionToCheck) {
    return isfourSegmentVersionRegex.test(versionToCheck);
}
exports.isFourSegmentedVersion = isFourSegmentedVersion;
const commonReleaseIdentities = [
    ['legacy'],
    ['alpha', 'preview', 'a'],
    ['beta', 'b'],
    ['next'],
    ['milestone', 'm'],
    ['rc', 'cr'],
    ['snapshot'],
    ['release', 'final', 'ga'],
    ['sp']
];
function friendlifyPrereleaseName(prereleaseName) {
    const filteredNames = [];
    commonReleaseIdentities.forEach(function (group) {
        return group.forEach(commonName => {
            const exp = new RegExp(`(.+-)${commonName}`, 'i');
            if (exp.test(prereleaseName.toLowerCase())) {
                filteredNames.push(commonName);
            }
        });
    });
    return (filteredNames.length === 0) ?
        null :
        filteredNames[0];
}
exports.friendlifyPrereleaseName = friendlifyPrereleaseName;
function parseSemver(packageVersion) {
    const { valid, validRange } = __webpack_require__(/*! semver */ "semver");
    const isVersion = valid(packageVersion, exports.loosePrereleases);
    const isRange = validRange(packageVersion, exports.loosePrereleases);
    return {
        rawVersion: packageVersion,
        type: !!isVersion ?
            ePackageVersionTypes_1.PackageVersionTypes.Version :
            !!isRange ? ePackageVersionTypes_1.PackageVersionTypes.Range :
                null,
    };
}
exports.parseSemver = parseSemver;
function filterPrereleasesGtMinRange(versionRange, prereleases) {
    const { SemVer, gt, maxSatisfying, minVersion, validRange, } = __webpack_require__(/*! semver */ "semver");
    const prereleaseGroupMap = {};
    // for each prerelease version;
    // group prereleases by x.x.x-{name}*.x
    prereleases.forEach(function (prereleaseVersion) {
        const spec = new SemVer(prereleaseVersion, exports.loosePrereleases);
        const prereleaseKey = friendlifyPrereleaseName(prereleaseVersion) ||
            spec.prerelease[0];
        prereleaseGroupMap[prereleaseKey] = prereleaseGroupMap[prereleaseKey] || [];
        prereleaseGroupMap[prereleaseKey].push(prereleaseVersion);
    });
    // check we have a valid range (handles non-semver errors)
    const isValidRange = validRange(versionRange, exports.loosePrereleases) !== null;
    const minVersionFromRange = isValidRange ?
        minVersion(versionRange, exports.loosePrereleases) :
        versionRange;
    const gtfn = isValidRange ? gt : maxSatisfying;
    // for each group;
    // extract versions that are greater than the min-range (one from each group)
    const filterPrereleases = [];
    Object.keys(prereleaseGroupMap)
        .forEach(function (prereleaseKey) {
        const versions = prereleaseGroupMap[prereleaseKey];
        const testMaxVersion = versions[versions.length - 1];
        const isPrereleaseGt = gtfn(testMaxVersion, minVersionFromRange, exports.loosePrereleases);
        if (isPrereleaseGt)
            filterPrereleases.push(testMaxVersion);
    });
    return filterPrereleases;
}
exports.filterPrereleasesGtMinRange = filterPrereleasesGtMinRange;
function filterSemverVersions(versions) {
    const { validRange } = __webpack_require__(/*! semver */ "semver");
    const semverVersions = [];
    versions.forEach(version => {
        if (validRange(version, exports.loosePrereleases))
            semverVersions.push(version);
    });
    return semverVersions;
}
exports.filterSemverVersions = filterSemverVersions;
exports.extractSymbolFromVersionRegex = /^([^0-9]*)?.*$/;
exports.semverLeadingChars = ['^', '~', '<', '<=', '>', '>=', '~>'];
function formatWithExistingLeading(existingVersion, newVersion) {
    const regExResult = exports.extractSymbolFromVersionRegex.exec(existingVersion);
    const leading = regExResult && regExResult[1];
    if (!leading || !exports.semverLeadingChars.includes(leading))
        return newVersion;
    return `${leading}${newVersion}`;
}
exports.formatWithExistingLeading = formatWithExistingLeading;


/***/ }),

/***/ "./src/core.packages/src/models/packageResponse.ts":
/*!*********************************************************!*\
  !*** ./src/core.packages/src/models/packageResponse.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageResponse = void 0;
class PackageResponse {
}
exports.PackageResponse = PackageResponse;


/***/ }),

/***/ "./src/core.packages/src/parsers/jsonPackageParser.ts":
/*!************************************************************!*\
  !*** ./src/core.packages/src/parsers/jsonPackageParser.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFromNodes = exports.extractPackageDependenciesFromJson = void 0;
function extractPackageDependenciesFromJson(json, filterPropertyNames) {
    const jsonErrors = [];
    const jsonParser = __webpack_require__(/*! jsonc-parser */ "jsonc-parser");
    const jsonTree = jsonParser.parseTree(json, jsonErrors);
    if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0)
        return [];
    return extractFromNodes(jsonTree.children, filterPropertyNames);
}
exports.extractPackageDependenciesFromJson = extractPackageDependenciesFromJson;
function extractFromNodes(topLevelNodes, includePropertyNames) {
    const collector = [];
    topLevelNodes.forEach(function (node) {
        const [keyEntry, valueEntry] = node.children;
        if (includePropertyNames.includes(keyEntry.value) === false)
            return;
        collectDependencyNodes(valueEntry.children, null, '', collector);
    });
    return collector;
}
exports.extractFromNodes = extractFromNodes;
function collectDependencyNodes(nodes, parentKey, filterName, collector = []) {
    nodes.forEach(function (node) {
        const [keyEntry, valueEntry] = node.children;
        if (valueEntry.type == "string" &&
            (filterName.length === 0 || keyEntry.value === filterName)) {
            const dependencyLens = createFromProperty(parentKey || keyEntry, valueEntry);
            collector.push(dependencyLens);
        }
        else if (valueEntry.type == "object") {
            collectDependencyNodes(valueEntry.children, keyEntry, 'version', collector);
        }
    });
}
function createFromProperty(keyEntry, valueEntry) {
    const nameRange = {
        start: keyEntry.offset,
        end: keyEntry.offset,
    };
    // +1 and -1 to be inside quotes
    const versionRange = {
        start: valueEntry.offset + 1,
        end: valueEntry.offset + valueEntry.length - 1,
    };
    const packageInfo = {
        name: keyEntry.value,
        version: valueEntry.value
    };
    return {
        nameRange,
        versionRange,
        packageInfo
    };
}


/***/ }),

/***/ "./src/core.packages/src/parsers/yamlPackageParser.ts":
/*!************************************************************!*\
  !*** ./src/core.packages/src/parsers/yamlPackageParser.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createDependencyLensFromPlainType = exports.createDependencyLensFromMapType = exports.extractDependenciesFromNodes = exports.extractPackageDependenciesFromYaml = void 0;
function extractPackageDependenciesFromYaml(yaml, filterPropertyNames) {
    const { Document, parseCST } = __webpack_require__(/*! yaml */ "yaml");
    // verbose parsing to handle CRLF scenarios
    const cst = parseCST(yaml);
    // create and parse the document
    const yamlDoc = new Document({ keepCstNodes: true }).parse(cst[0]);
    if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0)
        return [];
    const opts = {
        hasCrLf: yaml.indexOf('\r\n') > 0,
        filterPropertyNames,
        yaml,
    };
    return extractDependenciesFromNodes(yamlDoc.contents.items, opts);
}
exports.extractPackageDependenciesFromYaml = extractPackageDependenciesFromYaml;
function extractDependenciesFromNodes(topLevelNodes, opts) {
    const collector = [];
    topLevelNodes.forEach(function (pair) {
        if (opts.filterPropertyNames.includes(pair.key.value) === false)
            return;
        if (pair.value === null)
            return;
        collectDependencyNodes(pair.value.items, opts, collector);
    });
    return collector;
}
exports.extractDependenciesFromNodes = extractDependenciesFromNodes;
function collectDependencyNodes(nodes, opts, collector) {
    nodes.forEach(function (pair) {
        // node may be in the form "no_version_dep:", which we will indicate as the latest
        if (!pair.value || (pair.value.type === 'PLAIN' && !pair.value.value)) {
            const keyRange = getRangeFromCstNode(pair.key.cstNode, opts);
            pair.value = {
                range: [
                    keyRange.end + 2,
                    keyRange.end + 2,
                ],
                value: '',
                type: null
            };
        }
        if (pair.value.type === 'MAP') {
            createDependencyLensFromMapType(pair.value.items, pair.key, opts, collector);
        }
        else if (typeof pair.value.value === 'string') {
            const dependencyLens = createDependencyLensFromPlainType(pair, opts);
            collector.push(dependencyLens);
        }
    });
}
function createDependencyLensFromMapType(nodes, parentKey, opts, collector) {
    nodes.forEach(function (pair) {
        // ignore empty entries
        if (!pair.value)
            return;
        if (pair.key.value === "version") {
            const keyRange = getRangeFromCstNode(parentKey.cstNode, opts);
            const nameRange = createRange(keyRange.start, keyRange.start, null);
            const valueRange = getRangeFromCstNode(pair.value.cstNode, opts);
            const versionRange = createRange(valueRange.start, valueRange.end, pair.value.type);
            const packageInfo = {
                name: parentKey.value,
                version: pair.value.value
            };
            collector.push({
                nameRange,
                versionRange,
                packageInfo
            });
        }
    });
}
exports.createDependencyLensFromMapType = createDependencyLensFromMapType;
function createDependencyLensFromPlainType(pair, opts) {
    const keyRange = getRangeFromCstNode(pair.key.cstNode, opts);
    const nameRange = createRange(keyRange.start, keyRange.start, null);
    let valueRange;
    if (pair.value.cstNode) {
        valueRange = getRangeFromCstNode(pair.value.cstNode, opts);
    }
    else {
        // handle blank values
        const start = pair.value.range[0];
        valueRange = { start, end: start };
    }
    const versionRange = createRange(valueRange.start, valueRange.end, pair.value.type);
    const packageInfo = {
        name: pair.key.value,
        version: pair.value.value
    };
    return {
        nameRange,
        versionRange,
        packageInfo
    };
}
exports.createDependencyLensFromPlainType = createDependencyLensFromPlainType;
function createRange(start, end, valueType) {
    // +1 and -1 to be inside quotes
    const quoted = valueType === "QUOTE_SINGLE" || valueType === "QUOTE_DOUBLE";
    return {
        start: start + (quoted ? 1 : 0),
        end: end - (quoted ? 1 : 0),
    };
}
function getRangeFromCstNode(cstNode, opts) {
    const crLfLineOffset = opts.hasCrLf ?
        cstNode.rangeAsLinePos.start.line : 0;
    const start = cstNode.range.start + crLfLineOffset;
    const end = cstNode.range.end + crLfLineOffset;
    return { start, end };
}


/***/ }),

/***/ "./src/core.providers/index.ts":
/*!*************************************!*\
  !*** ./src/core.providers/index.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/definitions/iProviderConfig */ "./src/core.providers/src/definitions/iProviderConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eProviderSupport */ "./src/core.providers/src/definitions/eProviderSupport.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tProviderFileMatcher */ "./src/core.providers/src/definitions/tProviderFileMatcher.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iProviderModule */ "./src/core.providers/src/definitions/iProviderModule.ts"), exports);


/***/ }),

/***/ "./src/core.providers/src/definitions/eProviderSupport.ts":
/*!****************************************************************!*\
  !*** ./src/core.providers/src/definitions/eProviderSupport.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderSupport = void 0;
var ProviderSupport;
(function (ProviderSupport) {
    ProviderSupport["Releases"] = "releases";
    ProviderSupport["Prereleases"] = "prereleases";
    ProviderSupport["InstalledStatuses"] = "installedStatuses";
})(ProviderSupport = exports.ProviderSupport || (exports.ProviderSupport = {}));


/***/ }),

/***/ "./src/core.providers/src/definitions/iProviderConfig.ts":
/*!***************************************************************!*\
  !*** ./src/core.providers/src/definitions/iProviderConfig.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.providers/src/definitions/iProviderModule.ts":
/*!***************************************************************!*\
  !*** ./src/core.providers/src/definitions/iProviderModule.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.providers/src/definitions/tProviderFileMatcher.ts":
/*!********************************************************************!*\
  !*** ./src/core.providers/src/definitions/tProviderFileMatcher.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.suggestions/index.ts":
/*!***************************************!*\
  !*** ./src/core.suggestions/index.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionFactory = void 0;
__exportStar(__webpack_require__(/*! ./src/definitions/eSuggestionFlags */ "./src/core.suggestions/src/definitions/eSuggestionFlags.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eSuggestionStatus */ "./src/core.suggestions/src/definitions/eSuggestionStatus.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iSuggestionProvider */ "./src/core.suggestions/src/definitions/iSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tSuggestion */ "./src/core.suggestions/src/definitions/tSuggestion.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/tSuggestionReplaceFunction */ "./src/core.suggestions/src/definitions/tSuggestionReplaceFunction.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/suggestionUtils */ "./src/core.suggestions/src/suggestionUtils.ts"), exports);
exports.SuggestionFactory = __webpack_require__(/*! ./src/suggestionFactory */ "./src/core.suggestions/src/suggestionFactory.ts");


/***/ }),

/***/ "./src/core.suggestions/src/definitions/eSuggestionFlags.ts":
/*!******************************************************************!*\
  !*** ./src/core.suggestions/src/definitions/eSuggestionFlags.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionFlags = void 0;
var SuggestionFlags;
(function (SuggestionFlags) {
    // bitwise
    SuggestionFlags[SuggestionFlags["status"] = 1] = "status";
    SuggestionFlags[SuggestionFlags["release"] = 2] = "release";
    SuggestionFlags[SuggestionFlags["prerelease"] = 4] = "prerelease";
    SuggestionFlags[SuggestionFlags["tag"] = 8] = "tag";
})(SuggestionFlags = exports.SuggestionFlags || (exports.SuggestionFlags = {}));


/***/ }),

/***/ "./src/core.suggestions/src/definitions/eSuggestionStatus.ts":
/*!*******************************************************************!*\
  !*** ./src/core.suggestions/src/definitions/eSuggestionStatus.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionStatus = void 0;
var SuggestionStatus;
(function (SuggestionStatus) {
    SuggestionStatus["BadRequest"] = "400 bad request";
    SuggestionStatus["NotAuthorized"] = "401 not authorized";
    SuggestionStatus["Forbidden"] = "403 forbidden";
    SuggestionStatus["NotFound"] = "package not found";
    SuggestionStatus["InternalServerError"] = "500 internal server error";
    SuggestionStatus["NotSupported"] = "not supported";
    SuggestionStatus["ConnectionRefused"] = "connection refused";
    SuggestionStatus["Invalid"] = "invalid entry";
    SuggestionStatus["NoMatch"] = "no match";
    SuggestionStatus["Satisfies"] = "satisfies";
    SuggestionStatus["Latest"] = "latest";
    SuggestionStatus["LatestIsPrerelease"] = "latest prerelease";
    SuggestionStatus["Fixed"] = "fixed";
})(SuggestionStatus = exports.SuggestionStatus || (exports.SuggestionStatus = {}));


/***/ }),

/***/ "./src/core.suggestions/src/definitions/iSuggestionProvider.ts":
/*!*********************************************************************!*\
  !*** ./src/core.suggestions/src/definitions/iSuggestionProvider.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.suggestions/src/definitions/tSuggestion.ts":
/*!*************************************************************!*\
  !*** ./src/core.suggestions/src/definitions/tSuggestion.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.suggestions/src/definitions/tSuggestionReplaceFunction.ts":
/*!****************************************************************************!*\
  !*** ./src/core.suggestions/src/definitions/tSuggestionReplaceFunction.ts ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/core.suggestions/src/suggestionFactory.ts":
/*!*******************************************************!*\
  !*** ./src/core.suggestions/src/suggestionFactory.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuggestion = exports.createFixedStatus = exports.createSatisifiesLatest = exports.createMatchesLatest = exports.createLatest = exports.createNoMatch = exports.createNotSupported = exports.createInvalid = exports.createBadRequest = exports.createNotAuthorized = exports.createForbidden = exports.createConnectionRefused = exports.createInternalServerError = exports.createNotFound = exports.createFromHttpStatus = exports.createSuggestions = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
function createSuggestions(versionRange, releases, prereleases, suggestedLatestVersion = null) {
    const { maxSatisfying, compareLoose } = __webpack_require__(/*! semver */ "semver");
    const suggestions = [];
    // check for a release
    let satisfiesVersion = maxSatisfying(releases, versionRange, core_packages_1.VersionHelpers.loosePrereleases);
    if (!satisfiesVersion && versionRange.indexOf('-') > -1) {
        // lookup prereleases
        satisfiesVersion = maxSatisfying(prereleases, versionRange, core_packages_1.VersionHelpers.loosePrereleases);
    }
    // get the latest release
    const latestVersion = suggestedLatestVersion || releases[releases.length - 1];
    const isLatest = latestVersion === satisfiesVersion;
    const noSuggestionNeeded = versionRange.includes(satisfiesVersion) ||
        versionRange.includes(suggestedLatestVersion);
    if (releases.length === 0 && prereleases.length === 0)
        // no match
        suggestions.push(createNoMatch());
    else if (!satisfiesVersion)
        // no match
        suggestions.push(createNoMatch(), 
        // suggest latestVersion
        createLatest(latestVersion));
    else if (isLatest && noSuggestionNeeded)
        // latest
        suggestions.push(createMatchesLatest(versionRange));
    else if (isLatest)
        suggestions.push(
        // satisfies latest
        createSatisifiesLatest(), 
        // suggest latestVersion
        createLatest(latestVersion));
    else if (satisfiesVersion && core_packages_1.VersionHelpers.isFixedVersion(versionRange))
        suggestions.push(
        // fixed
        createFixedStatus(versionRange), 
        // suggest latestVersion
        createLatest(latestVersion));
    else if (satisfiesVersion)
        suggestions.push(
        // satisfies >x.y.z <x.y.z
        createSuggestion(core_suggestions_1.SuggestionStatus.Satisfies, satisfiesVersion, noSuggestionNeeded ?
            core_suggestions_1.SuggestionFlags.status :
            core_suggestions_1.SuggestionFlags.release), 
        // suggest latestVersion
        createLatest(latestVersion));
    // roll up prereleases
    const maxSatisfyingPrereleases = core_packages_1.VersionHelpers.filterPrereleasesGtMinRange(versionRange, prereleases).sort(compareLoose);
    // group prereleases (latest first)
    const taggedVersions = core_packages_1.VersionHelpers.extractTaggedVersions(maxSatisfyingPrereleases);
    for (let index = taggedVersions.length - 1; index > -1; index--) {
        const pvn = taggedVersions[index];
        if (pvn.name === 'latest')
            break;
        if (pvn.version === satisfiesVersion)
            break;
        if (pvn.version === latestVersion)
            break;
        if (versionRange.includes(pvn.version))
            break;
        suggestions.push({
            name: pvn.name,
            version: pvn.version,
            flags: core_suggestions_1.SuggestionFlags.prerelease
        });
    }
    return suggestions;
}
exports.createSuggestions = createSuggestions;
function createFromHttpStatus(status) {
    if (status == 400)
        return core_suggestions_1.SuggestionFactory.createBadRequest();
    else if (status == 401)
        return core_suggestions_1.SuggestionFactory.createNotAuthorized();
    else if (status == 403)
        return core_suggestions_1.SuggestionFactory.createForbidden();
    else if (status == 404)
        return core_suggestions_1.SuggestionFactory.createNotFound();
    else if (status == 500)
        return core_suggestions_1.SuggestionFactory.createInternalServerError();
    return null;
}
exports.createFromHttpStatus = createFromHttpStatus;
function createNotFound() {
    return {
        name: core_suggestions_1.SuggestionStatus.NotFound,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createNotFound = createNotFound;
function createInternalServerError() {
    return {
        name: core_suggestions_1.SuggestionStatus.InternalServerError,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createInternalServerError = createInternalServerError;
function createConnectionRefused() {
    return {
        name: core_suggestions_1.SuggestionStatus.ConnectionRefused,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createConnectionRefused = createConnectionRefused;
function createForbidden() {
    return {
        name: core_suggestions_1.SuggestionStatus.Forbidden,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createForbidden = createForbidden;
function createNotAuthorized() {
    return {
        name: core_suggestions_1.SuggestionStatus.NotAuthorized,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createNotAuthorized = createNotAuthorized;
function createBadRequest() {
    return {
        name: core_suggestions_1.SuggestionStatus.BadRequest,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createBadRequest = createBadRequest;
function createInvalid(requestedVersion) {
    return {
        name: core_suggestions_1.SuggestionStatus.Invalid,
        version: requestedVersion,
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createInvalid = createInvalid;
function createNotSupported() {
    return {
        name: core_suggestions_1.SuggestionStatus.NotSupported,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createNotSupported = createNotSupported;
function createNoMatch() {
    return {
        name: core_suggestions_1.SuggestionStatus.NoMatch,
        version: '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createNoMatch = createNoMatch;
function createLatest(requestedVersion) {
    const isPrerelease = requestedVersion && requestedVersion.indexOf('-') !== -1;
    const name = isPrerelease ?
        core_suggestions_1.SuggestionStatus.LatestIsPrerelease :
        core_suggestions_1.SuggestionStatus.Latest;
    // treats requestedVersion as latest version
    // if no requestedVersion then uses the 'latest' tag instead
    return {
        name,
        version: requestedVersion || 'latest',
        flags: isPrerelease ?
            core_suggestions_1.SuggestionFlags.prerelease :
            requestedVersion ?
                core_suggestions_1.SuggestionFlags.release :
                core_suggestions_1.SuggestionFlags.tag
    };
}
exports.createLatest = createLatest;
function createMatchesLatest(latestVersion) {
    const isPrerelease = latestVersion && latestVersion.indexOf('-') !== -1;
    const name = isPrerelease ?
        core_suggestions_1.SuggestionStatus.LatestIsPrerelease :
        core_suggestions_1.SuggestionStatus.Latest;
    return {
        name,
        version: isPrerelease ? latestVersion : '',
        flags: core_suggestions_1.SuggestionFlags.status
    };
}
exports.createMatchesLatest = createMatchesLatest;
function createSatisifiesLatest() {
    return createSuggestion(core_suggestions_1.SuggestionStatus.Satisfies, 'latest', core_suggestions_1.SuggestionFlags.status);
}
exports.createSatisifiesLatest = createSatisifiesLatest;
function createFixedStatus(version) {
    return createSuggestion(core_suggestions_1.SuggestionStatus.Fixed, version, core_suggestions_1.SuggestionFlags.status);
}
exports.createFixedStatus = createFixedStatus;
function createSuggestion(name, version, flags) {
    return { name, version, flags };
}
exports.createSuggestion = createSuggestion;


/***/ }),

/***/ "./src/core.suggestions/src/suggestionUtils.ts":
/*!*****************************************************!*\
  !*** ./src/core.suggestions/src/suggestionUtils.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.filtersProvidersByFileName = exports.defaultReplaceFn = void 0;
const path_1 = __webpack_require__(/*! path */ "path");
const minimatch = __webpack_require__(/*! minimatch */ "minimatch");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
function defaultReplaceFn(packageResponse, newVersion) {
    return core_packages_1.VersionHelpers.formatWithExistingLeading(packageResponse.requested.version, newVersion);
}
exports.defaultReplaceFn = defaultReplaceFn;
function filtersProvidersByFileName(fileName, providers) {
    const filename = path_1.basename(fileName);
    const filtered = providers.filter(provider => minimatch(filename, provider.config.fileMatcher.pattern));
    if (filtered.length === 0)
        return [];
    return filtered;
}
exports.filtersProvidersByFileName = filtersProvidersByFileName;


/***/ }),

/***/ "./src/infrastructure.clients/index.ts":
/*!*********************************************!*\
  !*** ./src/infrastructure.clients/index.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/definitions/iXhrResponse */ "./src/infrastructure.clients/src/definitions/iXhrResponse.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iPromiseSpawn */ "./src/infrastructure.clients/src/definitions/iPromiseSpawn.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/httpClient */ "./src/infrastructure.clients/src/httpClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/httpClientFactory */ "./src/infrastructure.clients/src/httpClientFactory.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/processClient */ "./src/infrastructure.clients/src/processClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/processClientFactory */ "./src/infrastructure.clients/src/processClientFactory.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.clients/src/definitions/iPromiseSpawn.ts":
/*!*********************************************************************!*\
  !*** ./src/infrastructure.clients/src/definitions/iPromiseSpawn.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.clients/src/definitions/iXhrResponse.ts":
/*!********************************************************************!*\
  !*** ./src/infrastructure.clients/src/definitions/iXhrResponse.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.clients/src/httpClient.ts":
/*!******************************************************!*\
  !*** ./src/infrastructure.clients/src/httpClient.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class HttpClient extends core_clients_1.AbstractCachedRequest {
    constructor(xhr, requestOptions, requestLogger) {
        super(requestOptions.caching);
        this.logger = requestLogger;
        this.options = requestOptions;
        this.xhr = xhr;
    }
    async request(method, baseUrl, query = {}, headers = {}) {
        const url = core_clients_1.UrlHelpers.createUrl(baseUrl, query);
        const cacheKey = method + '_' + url;
        if (this.cache.cachingOpts.duration > 0 &&
            this.cache.hasExpired(cacheKey) === false) {
            const cachedResp = this.cache.get(cacheKey);
            if (cachedResp.rejected)
                return Promise.reject(cachedResp);
            return Promise.resolve(cachedResp);
        }
        return this.xhr({
            url,
            type: method,
            headers,
            strictSSL: this.options.http.strictSSL
        })
            .then((response) => {
            return this.createCachedResponse(cacheKey, response.status, response.responseText, false);
        })
            .catch((response) => {
            const result = this.createCachedResponse(cacheKey, response.status, response.responseText, true);
            return Promise.reject(result);
        });
    }
}
exports.HttpClient = HttpClient;


/***/ }),

/***/ "./src/infrastructure.clients/src/httpClientFactory.ts":
/*!*************************************************************!*\
  !*** ./src/infrastructure.clients/src/httpClientFactory.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createJsonClient = exports.createHttpClient = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const httpClient_1 = __webpack_require__(/*! ./httpClient */ "./src/infrastructure.clients/src/httpClient.ts");
function createHttpClient(options, logger) {
    return new httpClient_1.HttpClient(__webpack_require__(/*! request-light */ "request-light").xhr, options, logger);
}
exports.createHttpClient = createHttpClient;
function createJsonClient(options, logger) {
    return new core_clients_1.JsonHttpClient(createHttpClient(options, logger));
}
exports.createJsonClient = createJsonClient;


/***/ }),

/***/ "./src/infrastructure.clients/src/processClient.ts":
/*!*********************************************************!*\
  !*** ./src/infrastructure.clients/src/processClient.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessClient = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class ProcessClient extends core_clients_1.AbstractCachedRequest {
    constructor(promiseSpawnFn, processOpts, processLogger) {
        super(processOpts);
        this.logger = processLogger;
        this.promiseSpawn = promiseSpawnFn;
    }
    async request(cmd, args, cwd) {
        const cacheKey = `${cmd} ${args.join(' ')}`;
        if (this.cache.cachingOpts.duration > 0 &&
            this.cache.hasExpired(cacheKey) === false) {
            this.logger.debug('cached - %s', cacheKey);
            const cachedResp = this.cache.get(cacheKey);
            if (cachedResp.rejected)
                return Promise.reject(cachedResp);
            return Promise.resolve(cachedResp);
        }
        this.logger.debug('executing - %s', cacheKey);
        return this.promiseSpawn(cmd, args, { cwd, stdioString: true })
            .then(result => {
            return this.createCachedResponse(cacheKey, result.code, result.stdout, false, core_clients_1.ClientResponseSource.local);
        }).catch(error => {
            const result = this.createCachedResponse(cacheKey, error.code, error.message, true, core_clients_1.ClientResponseSource.local);
            return Promise.reject(result);
        });
    }
}
exports.ProcessClient = ProcessClient;


/***/ }),

/***/ "./src/infrastructure.clients/src/processClientFactory.ts":
/*!****************************************************************!*\
  !*** ./src/infrastructure.clients/src/processClientFactory.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcessClient = void 0;
const processClient_1 = __webpack_require__(/*! ./processClient */ "./src/infrastructure.clients/src/processClient.ts");
function createProcessClient(cachingOpts, logger) {
    return new processClient_1.ProcessClient(__webpack_require__(/*! @npmcli/promise-spawn */ "@npmcli/promise-spawn"), cachingOpts, logger);
}
exports.createProcessClient = createProcessClient;


/***/ }),

/***/ "./src/infrastructure.configuration/index.ts":
/*!***************************************************!*\
  !*** ./src/infrastructure.configuration/index.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/definitions/iVsCodeConfig */ "./src/infrastructure.configuration/src/definitions/iVsCodeConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/vscodeConfig */ "./src/infrastructure.configuration/src/vscodeConfig.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.configuration/src/definitions/iVsCodeConfig.ts":
/*!***************************************************************************!*\
  !*** ./src/infrastructure.configuration/src/definitions/iVsCodeConfig.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.configuration/src/vscodeConfig.ts":
/*!**************************************************************!*\
  !*** ./src/infrastructure.configuration/src/vscodeConfig.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.VsCodeConfig = void 0;
// allows vscode configuration to be defrosted
// Useful for accessing hot changing values from settings.json
// Stays frozen until defrost() is called and then refrosts
class VsCodeConfig {
    constructor(workspace, section) {
        this.workspace = workspace;
        this.section = section;
        this.frozen = null;
    }
    get repo() {
        return this.workspace.getConfiguration(this.section);
    }
    get(key) {
        if (this.frozen === null) {
            this.frozen = this.repo;
        }
        return this.frozen.get(key);
    }
    defrost() {
        this.frozen = null;
    }
}
exports.VsCodeConfig = VsCodeConfig;


/***/ }),

/***/ "./src/infrastructure.logging/index.ts":
/*!*********************************************!*\
  !*** ./src/infrastructure.logging/index.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/loggerFactory */ "./src/infrastructure.logging/src/loggerFactory.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/transports/iLoggerTransport */ "./src/infrastructure.logging/src/transports/iLoggerTransport.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/transports/outputChannelTransport */ "./src/infrastructure.logging/src/transports/outputChannelTransport.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.logging/src/loggerFactory.ts":
/*!*********************************************************!*\
  !*** ./src/infrastructure.logging/src/loggerFactory.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createWinstonLogger = void 0;
const { loggers, format, transports } = __webpack_require__(/*! winston */ "winston");
function createWinstonLogger(loggerTransport, defaultMeta) {
    const logTransports = [
        // capture errors in the console
        new transports.Console({ level: 'error' }),
        // send info to the transport
        loggerTransport
    ];
    const logFormat = format.combine(format.timestamp({ format: loggerTransport.logging.timestampFormat }), format.simple(), format.splat(), format.printf(loggerFormatter));
    return loggers.add(loggerTransport.name, {
        format: logFormat,
        defaultMeta,
        transports: logTransports,
    });
}
exports.createWinstonLogger = createWinstonLogger;
function loggerFormatter(entry) {
    return `[${entry.timestamp}] [${entry.namespace}] [${entry.level}] ${entry.message}`;
}


/***/ }),

/***/ "./src/infrastructure.logging/src/transports/iLoggerTransport.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.logging/src/transports/iLoggerTransport.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.logging/src/transports/outputChannelTransport.ts":
/*!*****************************************************************************!*\
  !*** ./src/infrastructure.logging/src/transports/outputChannelTransport.ts ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputChannelTransport = void 0;
const { Transport } = __webpack_require__(/*! winston */ "winston");
const MESSAGE = Symbol.for('message');
class OutputChannelTransport extends Transport {
    constructor(outputChannel, logging) {
        super({ level: logging.level });
        this.outputChannel = outputChannel;
        this.logging = logging;
    }
    get name() {
        return this.outputChannel.name;
    }
    log(entry, callback) {
        setImmediate(() => {
            this.emit('logged', entry);
            this.outputChannel.appendLine(`${entry[MESSAGE]}`);
        });
        callback();
    }
    updateLevel() {
        this.logging.defrost();
        super.level = this.logging.level;
    }
}
exports.OutputChannelTransport = OutputChannelTransport;


/***/ }),

/***/ "./src/infrastructure.providers sync recursive ^\\.\\/.*\\/index$":
/*!***********************************************************!*\
  !*** ./src/infrastructure.providers sync ^\.\/.*\/index$ ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./composer/index": "./src/infrastructure.providers/composer/index.ts",
	"./dotnet/index": "./src/infrastructure.providers/dotnet/index.ts",
	"./dub/index": "./src/infrastructure.providers/dub/index.ts",
	"./jspm/index": "./src/infrastructure.providers/jspm/index.ts",
	"./maven/index": "./src/infrastructure.providers/maven/index.ts",
	"./npm/index": "./src/infrastructure.providers/npm/index.ts",
	"./pub/index": "./src/infrastructure.providers/pub/index.ts"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./src/infrastructure.providers sync recursive ^\\.\\/.*\\/index$";

/***/ }),

/***/ "./src/infrastructure.providers/composer/index.ts":
/*!********************************************************!*\
  !*** ./src/infrastructure.providers/composer/index.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/composerSuggestionProvider */ "./src/infrastructure.providers/composer/src/composerSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/composerConfig */ "./src/infrastructure.providers/composer/src/composerConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/composerClient */ "./src/infrastructure.providers/composer/src/composerClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/composerContainer */ "./src/infrastructure.providers/composer/src/composerContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/composer/src/composerClient.ts":
/*!*********************************************************************!*\
  !*** ./src/infrastructure.providers/composer/src/composerClient.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.readComposerSelections = exports.ComposerClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class ComposerClient {
    constructor(config, client, logger) {
        this.config = config;
        this.client = client;
        this.logger = logger;
    }
    async fetchPackage(request) {
        const semverSpec = core_packages_1.VersionHelpers.parseSemver(request.package.version);
        const url = `${this.config.apiUrl}${request.package.name}.json`;
        return this.createRemotePackageDocument(url, request, semverSpec)
            .catch((error) => {
            this.logger.debug("Caught exception from %s: %O", core_packages_1.PackageSourceTypes.Registry, error);
            const suggestion = core_suggestions_1.SuggestionFactory.createFromHttpStatus(error.status);
            if (suggestion != null) {
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Registry, request, error, [suggestion]);
            }
            return Promise.reject(error);
        });
    }
    async createRemotePackageDocument(url, request, semverSpec) {
        const query = {};
        const headers = {};
        return this.client.request(core_clients_1.HttpClientRequestMethods.get, url, query, headers)
            .then(function (httpResponse) {
            const packageInfo = httpResponse.data.packages[request.package.name];
            const { providerName } = request;
            const versionRange = semverSpec.rawVersion;
            const requested = request.package;
            const resolved = {
                name: requested.name,
                version: versionRange,
            };
            const response = {
                source: httpResponse.source,
                status: httpResponse.status,
            };
            const rawVersions = Object.keys(packageInfo);
            // extract semver versions only
            const semverVersions = core_packages_1.VersionHelpers.filterSemverVersions(rawVersions);
            // seperate versions to releases and prereleases
            const { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(core_packages_1.VersionHelpers.filterSemverVersions(semverVersions));
            // analyse suggestions
            const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases);
            return {
                providerName,
                source: core_packages_1.PackageSourceTypes.Registry,
                response,
                type: semverSpec.type,
                requested,
                resolved,
                suggestions,
            };
        });
    }
}
exports.ComposerClient = ComposerClient;
function readComposerSelections(filePath) {
    return new Promise(function (resolve, reject) {
        const fs = __webpack_require__(/*! fs */ "fs");
        if (fs.existsSync(filePath) === false) {
            reject(null);
            return;
        }
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const selectionsJson = JSON.parse(data.toString());
            resolve(selectionsJson);
        });
    });
}
exports.readComposerSelections = readComposerSelections;


/***/ }),

/***/ "./src/infrastructure.providers/composer/src/composerConfig.ts":
/*!*********************************************************************!*\
  !*** ./src/infrastructure.providers/composer/src/composerConfig.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerConfig = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const eComposerContributions_1 = __webpack_require__(/*! ./definitions/eComposerContributions */ "./src/infrastructure.providers/composer/src/definitions/eComposerContributions.ts");
class ComposerConfig {
    constructor(config, caching, http) {
        this.providerName = 'composer';
        this.supports = [
            core_providers_1.ProviderSupport.Releases,
            core_providers_1.ProviderSupport.Prereleases,
            core_providers_1.ProviderSupport.InstalledStatuses,
        ];
        this.fileMatcher = {
            language: 'json',
            scheme: 'file',
            pattern: '**/composer.json',
        };
        this.config = config;
        this.caching = caching;
        this.http = http;
    }
    get dependencyProperties() {
        return this.config.get(eComposerContributions_1.ComposerContributions.DependencyProperties);
    }
    get apiUrl() {
        return core_clients_1.UrlHelpers.ensureEndSlash(this.config.get(eComposerContributions_1.ComposerContributions.ApiUrl));
    }
}
exports.ComposerConfig = ComposerConfig;


/***/ }),

/***/ "./src/infrastructure.providers/composer/src/composerContainer.ts":
/*!************************************************************************!*\
  !*** ./src/infrastructure.providers/composer/src/composerContainer.ts ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const eComposerContributions_1 = __webpack_require__(/*! ./definitions/eComposerContributions */ "./src/infrastructure.providers/composer/src/definitions/eComposerContributions.ts");
const composerSuggestionProvider_1 = __webpack_require__(/*! ./composerSuggestionProvider */ "./src/infrastructure.providers/composer/src/composerSuggestionProvider.ts");
const composerConfig_1 = __webpack_require__(/*! ./composerConfig */ "./src/infrastructure.providers/composer/src/composerConfig.ts");
const composerClient_1 = __webpack_require__(/*! ./composerClient */ "./src/infrastructure.providers/composer/src/composerClient.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        composerCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, eComposerContributions_1.ComposerContributions.Caching, 'caching')).singleton(),
        composerHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, eComposerContributions_1.ComposerContributions.Http, 'http')).singleton(),
        // config
        composerConfig: awilix_1.asFunction((rootConfig, composerCachingOpts, composerHttpOpts) => new composerConfig_1.ComposerConfig(rootConfig, composerCachingOpts, composerHttpOpts)).singleton(),
        // clients
        composerJsonClient: awilix_1.asFunction((composerCachingOpts, composerHttpOpts, logger) => infrastructure_clients_1.createJsonClient({
            caching: composerCachingOpts,
            http: composerHttpOpts
        }, logger.child({ namespace: 'composer request' }))).singleton(),
        composerClient: awilix_1.asFunction((composerConfig, composerJsonClient, logger) => new composerClient_1.ComposerClient(composerConfig, composerJsonClient, logger.child({ namespace: 'composer client' }))).singleton(),
        // provider
        composerProvider: awilix_1.asFunction((composerClient, logger) => new composerSuggestionProvider_1.ComposerSuggestionProvider(composerClient, logger.child({ namespace: 'composer provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.composerProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/composer/src/composerSuggestionProvider.ts":
/*!*********************************************************************************!*\
  !*** ./src/infrastructure.providers/composer/src/composerSuggestionProvider.ts ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerSuggestionProvider = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
class ComposerSuggestionProvider {
    constructor(client, logger) {
        this.client = client;
        this.config = client.config;
        this.logger = logger;
        this.suggestionReplaceFn = core_suggestions_1.defaultReplaceFn;
    }
    parseDependencies(packageText) {
        const packageDependencies = core_packages_1.extractPackageDependenciesFromJson(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        const clientData = null;
        return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.client, clientData, packageDependencies);
    }
}
exports.ComposerSuggestionProvider = ComposerSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/composer/src/definitions/eComposerContributions.ts":
/*!*****************************************************************************************!*\
  !*** ./src/infrastructure.providers/composer/src/definitions/eComposerContributions.ts ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerContributions = void 0;
var ComposerContributions;
(function (ComposerContributions) {
    ComposerContributions["Caching"] = "composer.caching";
    ComposerContributions["Http"] = "composer.http";
    ComposerContributions["DependencyProperties"] = "composer.dependencyProperties";
    ComposerContributions["ApiUrl"] = "composer.apiUrl";
})(ComposerContributions = exports.ComposerContributions || (exports.ComposerContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/index.ts":
/*!******************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/index.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/clients/dotnetCli */ "./src/infrastructure.providers/dotnet/src/clients/dotnetCli.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/clients/nugetPackageClient */ "./src/infrastructure.providers/dotnet/src/clients/nugetPackageClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/clients/nugetResourceClient */ "./src/infrastructure.providers/dotnet/src/clients/nugetResourceClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/dotnet */ "./src/infrastructure.providers/dotnet/src/definitions/dotnet.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/nuget */ "./src/infrastructure.providers/dotnet/src/definitions/nuget.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iNugetOptions */ "./src/infrastructure.providers/dotnet/src/definitions/iNugetOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dotnetConfig */ "./src/infrastructure.providers/dotnet/src/dotnetConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dotnetSuggestionProvider */ "./src/infrastructure.providers/dotnet/src/dotnetSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dotnetUtils */ "./src/infrastructure.providers/dotnet/src/dotnetUtils.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dotnetXmlParserFactory */ "./src/infrastructure.providers/dotnet/src/dotnetXmlParserFactory.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/options/nugetOptions */ "./src/infrastructure.providers/dotnet/src/options/nugetOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dotnetContainer */ "./src/infrastructure.providers/dotnet/src/dotnetContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/clients/dotnetCli.ts":
/*!**********************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/clients/dotnetCli.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetCli = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class DotNetCli {
    constructor(config, client, logger) {
        this.config = config;
        this.client = client;
        this.logger = logger;
    }
    async fetchSources(cwd) {
        const promisedCli = this.client.request('dotnet', ['nuget', 'list', 'source', '--format', 'short'], cwd);
        return await promisedCli.then(result => {
            const { data } = result;
            // reject when data contains "error"
            if (data.indexOf("error") > -1)
                return Promise.reject(result);
            // check we have some data
            if (data.length === 0 || data.indexOf('E') === -1) {
                return [];
            }
            // extract sources
            const hasCrLf = data.indexOf(crLf) > 0;
            const splitChar = hasCrLf ? crLf : '\n';
            let lines = data.split(splitChar);
            // pop any blank entries
            if (lines[lines.length - 1] === '')
                lines.pop();
            return parseSourcesArray(lines).filter(s => s.enabled);
        }).then(sources => {
            // combine the sources where feed take precedent
            const feedSources = convertFeedsToSources(this.config.nuget.sources);
            return [
                ...feedSources,
                ...sources
            ];
        }).catch(error => {
            // return the fallback source for dotnet clients < 5.5
            return [
                {
                    enabled: true,
                    machineWide: false,
                    protocol: core_clients_1.UrlHelpers.RegistryProtocols.https,
                    url: this.config.fallbackNugetSource,
                }
            ];
        });
    }
}
exports.DotNetCli = DotNetCli;
const crLf = '\r\n';
function parseSourcesArray(lines) {
    return lines.map(function (line) {
        const enabled = line.substring(0, 1) === 'E';
        const machineWide = line.substring(1, 2) === 'M';
        const offset = machineWide ? 3 : 2;
        const url = line.substring(offset);
        const protocol = core_clients_1.UrlHelpers.getProtocolFromUrl(url);
        return {
            enabled,
            machineWide,
            url,
            protocol
        };
    });
}
function convertFeedsToSources(feeds) {
    return feeds.map(function (url) {
        const protocol = core_clients_1.UrlHelpers.getProtocolFromUrl(url);
        const machineWide = (protocol === core_clients_1.UrlHelpers.RegistryProtocols.file);
        return {
            enabled: true,
            machineWide,
            url,
            protocol
        };
    });
}


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/clients/nugetPackageClient.ts":
/*!*******************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/clients/nugetPackageClient.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NuGetPackageClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const dotnetUtils_1 = __webpack_require__(/*! ../dotnetUtils */ "./src/infrastructure.providers/dotnet/src/dotnetUtils.ts");
class NuGetPackageClient {
    constructor(config, client, logger) {
        this.config = config;
        this.client = client;
        this.logger = logger;
    }
    async fetchPackage(request) {
        const dotnetSpec = dotnetUtils_1.parseVersionSpec(request.package.version);
        return this.fetchPackageRetry(request, dotnetSpec);
    }
    async fetchPackageRetry(request, dotnetSpec) {
        const urls = request.clientData.serviceUrls;
        const autoCompleteUrl = urls[request.attempt];
        return this.createRemotePackageDocument(autoCompleteUrl, request, dotnetSpec)
            .catch((error) => {
            this.logger.debug("Caught exception from %s: %O", core_packages_1.PackageSourceTypes.Registry, error);
            // increase the attempt number
            request.attempt++;
            // only retry if 404 and we have more urls to try
            if (error.status === 404 && request.attempt < urls.length) {
                // retry
                return this.fetchPackageRetry(request, dotnetSpec);
            }
            const suggestion = core_suggestions_1.SuggestionFactory.createFromHttpStatus(error.status);
            if (suggestion != null) {
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Registry, request, error, [suggestion]);
            }
            // unexpected
            return Promise.reject(error);
        });
    }
    async createRemotePackageDocument(url, request, dotnetSpec) {
        const query = {};
        const headers = {};
        const packageUrl = core_clients_1.UrlHelpers.ensureEndSlash(url) + `${request.package.name.toLowerCase()}/index.json`;
        return this.client.request(core_clients_1.HttpClientRequestMethods.get, packageUrl, query, headers)
            .then(function (httpResponse) {
            const { data } = httpResponse;
            const source = core_packages_1.PackageSourceTypes.Registry;
            const { providerName } = request;
            const requested = request.package;
            const packageInfo = data;
            const response = {
                source: httpResponse.source,
                status: httpResponse.status,
            };
            // sanitize to semver only versions
            const rawVersions = core_packages_1.VersionHelpers.filterSemverVersions(packageInfo.versions);
            // seperate versions to releases and prereleases
            const { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(rawVersions);
            // four segment is not supported
            if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Registry, request, httpResponse, []);
            }
            // no match if null type
            if (dotnetSpec.type === null) {
                return core_packages_1.DocumentFactory.createNoMatch(providerName, source, core_packages_1.PackageVersionTypes.Version, requested, core_packages_1.ResponseFactory.createResponseStatus(httpResponse.source, 404), 
                // suggest the latest release if available
                releases.length > 0 ? releases[releases.length - 1] : null);
            }
            const versionRange = dotnetSpec.resolvedVersion;
            const resolved = {
                name: requested.name,
                version: versionRange,
            };
            // analyse suggestions
            const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases);
            return {
                providerName,
                source,
                response,
                type: dotnetSpec.type,
                requested,
                resolved,
                suggestions,
            };
        });
    }
}
exports.NuGetPackageClient = NuGetPackageClient;


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/clients/nugetResourceClient.ts":
/*!********************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/clients/nugetResourceClient.ts ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NuGetResourceClient = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class NuGetResourceClient {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async fetchResource(source) {
        const query = {};
        const headers = {};
        this.logger.debug("Requesting PackageBaseAddressService from %s", source.url);
        return await this.client.request(core_clients_1.HttpClientRequestMethods.get, source.url, query, headers)
            .then((response) => {
            const packageBaseAddressServices = response.data.resources
                .filter(res => res["@type"].indexOf('PackageBaseAddress') > -1);
            // just take one service for now
            const foundPackageBaseAddressServices = packageBaseAddressServices[0]["@id"];
            this.logger.debug("Resolved PackageBaseAddressService endpoint: %O", foundPackageBaseAddressServices);
            return foundPackageBaseAddressServices;
        })
            .catch((error) => {
            this.logger.error("Could not resolve nuget service index. %O", error);
            return "";
        });
    }
}
exports.NuGetResourceClient = NuGetResourceClient;


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/definitions/dotnet.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/definitions/dotnet.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/definitions/eDotNetContributions.ts":
/*!*************************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/definitions/eDotNetContributions.ts ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetContributions = void 0;
var DotNetContributions;
(function (DotNetContributions) {
    DotNetContributions["Caching"] = "dotnet.caching";
    DotNetContributions["Http"] = "dotnet.http";
    DotNetContributions["Nuget"] = "dotnet.nuget";
    DotNetContributions["DependencyProperties"] = "dotnet.dependencyProperties";
    DotNetContributions["TagFilter"] = "dotnet.tagFilter";
})(DotNetContributions = exports.DotNetContributions || (exports.DotNetContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/definitions/eNugetContributions.ts":
/*!************************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/definitions/eNugetContributions.ts ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NugetContributions = void 0;
var NugetContributions;
(function (NugetContributions) {
    NugetContributions["Sources"] = "sources";
})(NugetContributions = exports.NugetContributions || (exports.NugetContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/definitions/iNugetOptions.ts":
/*!******************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/definitions/iNugetOptions.ts ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/definitions/nuget.ts":
/*!**********************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/definitions/nuget.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/dotnetConfig.ts":
/*!*****************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/dotnetConfig.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetConfig = void 0;
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const eDotNetContributions_1 = __webpack_require__(/*! ./definitions/eDotNetContributions */ "./src/infrastructure.providers/dotnet/src/definitions/eDotNetContributions.ts");
class DotNetConfig {
    constructor(config, dotnetCachingOpts, dotnetHttpOpts, nugetOpts) {
        this.providerName = 'dotnet';
        this.supports = [
            core_providers_1.ProviderSupport.Releases,
            core_providers_1.ProviderSupport.Prereleases,
        ];
        this.fileMatcher = {
            language: 'xml',
            scheme: 'file',
            pattern: '**/*.{csproj,fsproj,targets,props}',
        };
        this.config = config;
        this.caching = dotnetCachingOpts;
        this.http = dotnetHttpOpts;
        this.nuget = nugetOpts;
    }
    get dependencyProperties() {
        return this.config.get(eDotNetContributions_1.DotNetContributions.DependencyProperties);
    }
    get tagFilter() {
        return this.config.get(eDotNetContributions_1.DotNetContributions.TagFilter);
    }
    get fallbackNugetSource() {
        return 'https://api.nuget.org/v3/index.json';
    }
}
exports.DotNetConfig = DotNetConfig;


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/dotnetContainer.ts":
/*!********************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/dotnetContainer.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const eDotNetContributions_1 = __webpack_require__(/*! ./definitions/eDotNetContributions */ "./src/infrastructure.providers/dotnet/src/definitions/eDotNetContributions.ts");
const nugetOptions_1 = __webpack_require__(/*! ./options/nugetOptions */ "./src/infrastructure.providers/dotnet/src/options/nugetOptions.ts");
const dotnetCli_1 = __webpack_require__(/*! ./clients/dotnetCli */ "./src/infrastructure.providers/dotnet/src/clients/dotnetCli.ts");
const nugetResourceClient_1 = __webpack_require__(/*! ./clients/nugetResourceClient */ "./src/infrastructure.providers/dotnet/src/clients/nugetResourceClient.ts");
const nugetPackageClient_1 = __webpack_require__(/*! ./clients/nugetPackageClient */ "./src/infrastructure.providers/dotnet/src/clients/nugetPackageClient.ts");
const dotnetSuggestionProvider_1 = __webpack_require__(/*! ./dotnetSuggestionProvider */ "./src/infrastructure.providers/dotnet/src/dotnetSuggestionProvider.ts");
const dotnetConfig_1 = __webpack_require__(/*! ./dotnetConfig */ "./src/infrastructure.providers/dotnet/src/dotnetConfig.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        nugetOpts: awilix_1.asFunction(rootConfig => new nugetOptions_1.NugetOptions(rootConfig, eDotNetContributions_1.DotNetContributions.Nuget)).singleton(),
        dotnetCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, eDotNetContributions_1.DotNetContributions.Caching, 'caching')).singleton(),
        dotnetHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, eDotNetContributions_1.DotNetContributions.Http, 'http')).singleton(),
        // config
        dotnetConfig: awilix_1.asFunction((rootConfig, dotnetCachingOpts, dotnetHttpOpts, nugetOpts) => new dotnetConfig_1.DotNetConfig(rootConfig, dotnetCachingOpts, dotnetHttpOpts, nugetOpts)).singleton(),
        // cli
        dotnetProcess: awilix_1.asFunction((dotnetCachingOpts, logger) => infrastructure_clients_1.createProcessClient(dotnetCachingOpts, logger.child({ namespace: 'dotnet process' }))).singleton(),
        dotnetCli: awilix_1.asFunction((dotnetConfig, dotnetProcess, logger) => new dotnetCli_1.DotNetCli(dotnetConfig, dotnetProcess, logger.child({ namespace: 'dotnet cli' }))).singleton(),
        // clients
        dotnetJsonClient: awilix_1.asFunction((dotnetCachingOpts, dotnetHttpOpts, logger) => infrastructure_clients_1.createJsonClient({
            caching: dotnetCachingOpts,
            http: dotnetHttpOpts
        }, logger.child({ namespace: 'dotnet request' }))).singleton(),
        nugetClient: awilix_1.asFunction((dotnetConfig, dotnetJsonClient, logger) => new nugetPackageClient_1.NuGetPackageClient(dotnetConfig, dotnetJsonClient, logger.child({ namespace: 'dotnet client' }))).singleton(),
        nugetResClient: awilix_1.asFunction((dotnetJsonClient, logger) => new nugetResourceClient_1.NuGetResourceClient(dotnetJsonClient, logger.child({ namespace: 'dotnet resource service' }))).singleton(),
        // provider
        dotnetProvider: awilix_1.asFunction((dotnetCli, nugetClient, nugetResClient, logger) => new dotnetSuggestionProvider_1.DotNetSuggestionProvider(dotnetCli, nugetClient, nugetResClient, logger.child({ namespace: 'dotnet provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.dotnetProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/dotnetSuggestionProvider.ts":
/*!*****************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/dotnetSuggestionProvider.ts ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetSuggestionProvider = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const dotnetXmlParserFactory_1 = __webpack_require__(/*! ./dotnetXmlParserFactory */ "./src/infrastructure.providers/dotnet/src/dotnetXmlParserFactory.ts");
class DotNetSuggestionProvider {
    constructor(dotnetCli, nugetClient, nugetResClient, logger) {
        this.dotnetClient = dotnetCli;
        this.nugetPackageClient = nugetClient;
        this.nugetResClient = nugetResClient;
        this.config = nugetClient.config;
        this.logger = logger;
        this.suggestionReplaceFn = core_suggestions_1.defaultReplaceFn;
    }
    parseDependencies(packageText) {
        const packageDependencies = dotnetXmlParserFactory_1.createDependenciesFromXml(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        // ensure latest nuget sources from settings
        this.config.nuget.defrost();
        // get each service index source from the dotnet cli
        const sources = await this.dotnetClient.fetchSources(packagePath);
        // remote sources only
        const remoteSources = sources.filter(s => s.protocol === core_clients_1.UrlHelpers.RegistryProtocols.https ||
            s.protocol === core_clients_1.UrlHelpers.RegistryProtocols.http);
        // resolve each service url
        const promised = remoteSources.map(async (remoteSource) => {
            return await this.nugetResClient.fetchResource(remoteSource);
        });
        const serviceUrls = (await Promise.all(promised))
            .filter(url => url.length > 0);
        if (serviceUrls.length === 0) {
            this.logger.error("Could not resolve any nuget service urls");
            return null;
        }
        const clientData = { serviceUrls: serviceUrls };
        return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.nugetPackageClient, clientData, packageDependencies);
    }
}
exports.DotNetSuggestionProvider = DotNetSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/dotnetUtils.ts":
/*!****************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/dotnetUtils.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVersionSpec = exports.parseVersionSpec = exports.expandShortVersion = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
function expandShortVersion(value) {
    if (!value ||
        value.indexOf('[') !== -1 ||
        value.indexOf('(') !== -1 ||
        value.indexOf(',') !== -1 ||
        value.indexOf(')') !== -1 ||
        value.indexOf(']') !== -1 ||
        value.indexOf('*') !== -1)
        return value;
    let dotCount = 0;
    for (let i = 0; i < value.length; i++) {
        const c = value[i];
        if (c === '.')
            dotCount++;
        else if (isNaN(parseInt(c)))
            return value;
    }
    let fmtValue = '';
    if (dotCount === 0)
        fmtValue = value + '.0.0';
    else if (dotCount === 1)
        fmtValue = value + '.0';
    else
        return value;
    return fmtValue;
}
exports.expandShortVersion = expandShortVersion;
function parseVersionSpec(rawVersion) {
    const spec = buildVersionSpec(rawVersion);
    let version;
    let isValidVersion = false;
    let isValidRange = false;
    if (spec && !spec.hasFourSegments) {
        // convert spec to semver
        const { valid, validRange } = __webpack_require__(/*! semver */ "semver");
        version = convertVersionSpecToString(spec);
        isValidVersion = valid(version, core_packages_1.VersionHelpers.loosePrereleases);
        isValidRange = !isValidVersion && validRange(version, core_packages_1.VersionHelpers.loosePrereleases) !== null;
    }
    const type = isValidVersion ?
        core_packages_1.PackageVersionTypes.Version :
        isValidRange ? core_packages_1.PackageVersionTypes.Range : null;
    const resolvedVersion = spec ? version : '';
    return {
        type,
        rawVersion,
        resolvedVersion,
        spec
    };
}
exports.parseVersionSpec = parseVersionSpec;
function buildVersionSpec(value) {
    let formattedValue = expandShortVersion(value.trim());
    if (!formattedValue)
        return null;
    // test if the version is in semver format
    const semver = __webpack_require__(/*! semver */ "semver");
    const parsedSemver = semver.parse(formattedValue, { includePrereleases: true });
    if (parsedSemver) {
        return {
            version: formattedValue,
            isMinInclusive: true,
            isMaxInclusive: true,
            hasFourSegments: false,
        };
    }
    try {
        // test if the version is a semver range format
        const parsedNodeRange = semver.validRange(formattedValue, { includePrereleases: true });
        if (parsedNodeRange) {
            return {
                version: parsedNodeRange,
                isMinInclusive: true,
                isMaxInclusive: true,
                hasFourSegments: false,
            };
        }
    }
    catch { }
    // fail if the string is too short
    if (formattedValue.length < 3)
        return null;
    const versionSpec = {};
    // first character must be [ or (
    const first = formattedValue[0];
    if (first === '[')
        versionSpec.isMinInclusive = true;
    else if (first === '(')
        versionSpec.isMinInclusive = false;
    else if (core_packages_1.VersionHelpers.isFourSegmentedVersion(formattedValue))
        return { hasFourSegments: true };
    else
        return null;
    // last character must be ] or )
    const last = formattedValue[formattedValue.length - 1];
    if (last === ']')
        versionSpec.isMaxInclusive = true;
    else if (last === ')')
        versionSpec.isMaxInclusive = false;
    // remove any [] or ()
    formattedValue = formattedValue.substr(1, formattedValue.length - 2);
    // split by comma
    const parts = formattedValue.split(',');
    // more than 2 is invalid
    if (parts.length > 2)
        return null;
    else if (parts.every(x => !x))
        // must be (,]
        return null;
    // if only one entry then use it for both min and max
    const minVersion = parts[0];
    const maxVersion = (parts.length == 2) ? parts[1] : parts[0];
    // parse the min version
    if (minVersion) {
        const parsedVersion = buildVersionSpec(minVersion);
        if (!parsedVersion)
            return null;
        versionSpec.minVersionSpec = parsedVersion;
        versionSpec.hasFourSegments = parsedVersion.hasFourSegments;
    }
    // parse the max version
    if (maxVersion) {
        const parsedVersion = buildVersionSpec(maxVersion);
        if (!parsedVersion)
            return null;
        versionSpec.maxVersionSpec = parsedVersion;
        versionSpec.hasFourSegments = parsedVersion.hasFourSegments;
    }
    return versionSpec;
}
exports.buildVersionSpec = buildVersionSpec;
function convertVersionSpecToString(versionSpec) {
    // x.x.x cases
    if (versionSpec.version
        && versionSpec.isMinInclusive
        && versionSpec.isMaxInclusive)
        return versionSpec.version;
    // [x.x.x] cases
    if (versionSpec.minVersionSpec
        && versionSpec.maxVersionSpec
        && versionSpec.minVersionSpec.version === versionSpec.maxVersionSpec.version
        && versionSpec.isMinInclusive
        && versionSpec.isMaxInclusive)
        return versionSpec.minVersionSpec.version;
    let rangeBuilder = '';
    if (versionSpec.minVersionSpec) {
        rangeBuilder += '>';
        if (versionSpec.isMinInclusive)
            rangeBuilder += '=';
        rangeBuilder += versionSpec.minVersionSpec.version;
    }
    if (versionSpec.maxVersionSpec) {
        rangeBuilder += rangeBuilder.length > 0 ? ' ' : '';
        rangeBuilder += '<';
        if (versionSpec.isMaxInclusive)
            rangeBuilder += '=';
        rangeBuilder += versionSpec.maxVersionSpec.version;
    }
    return rangeBuilder;
}


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/dotnetXmlParserFactory.ts":
/*!***************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/dotnetXmlParserFactory.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createDependenciesFromXml = void 0;
function createDependenciesFromXml(xml, includePropertyNames) {
    const xmldoc = __webpack_require__(/*! xmldoc */ "xmldoc");
    let document = null;
    try {
        document = new xmldoc.XmlDocument(xml);
    }
    catch {
        document = null;
    }
    if (!document)
        return [];
    return extractPackageLensDataFromNodes(document, xml, includePropertyNames);
}
exports.createDependenciesFromXml = createDependenciesFromXml;
function extractPackageLensDataFromNodes(topLevelNodes, xml, includePropertyNames) {
    const collector = [];
    topLevelNodes.eachChild(function (node) {
        if (node.name !== "ItemGroup")
            return;
        node.eachChild(function (itemGroupNode) {
            if (includePropertyNames.includes(itemGroupNode.name) == false)
                return;
            const dependencyLens = createFromAttribute(itemGroupNode, xml);
            if (dependencyLens)
                collector.push(dependencyLens);
        });
    });
    return collector;
}
function createFromAttribute(node, xml) {
    const nameRange = {
        start: node.startTagPosition,
        end: node.startTagPosition,
    };
    // xmldoc doesn't report attribute ranges so this gets them manually
    const versionRange = getAttributeRange(node, ' version="', xml);
    if (versionRange === null)
        return null;
    const packageInfo = {
        name: node.attr.Include || node.attr.Update,
        version: node.attr.Version,
    };
    return {
        nameRange,
        versionRange,
        packageInfo,
    };
}
function getAttributeRange(node, attributeName, xml) {
    const lineText = xml.substring(node.startTagPosition, node.position);
    let start = lineText.toLowerCase().indexOf(attributeName);
    if (start === -1)
        return null;
    start += attributeName.length;
    const end = lineText.indexOf('"', start);
    return {
        start: node.startTagPosition + start,
        end: node.startTagPosition + end,
    };
}


/***/ }),

/***/ "./src/infrastructure.providers/dotnet/src/options/nugetOptions.ts":
/*!*************************************************************************!*\
  !*** ./src/infrastructure.providers/dotnet/src/options/nugetOptions.ts ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NugetOptions = void 0;
const core_configuration_1 = __webpack_require__(/*! core.configuration */ "./src/core.configuration/index.ts");
const eNugetContributions_1 = __webpack_require__(/*! ../definitions/eNugetContributions */ "./src/infrastructure.providers/dotnet/src/definitions/eNugetContributions.ts");
class NugetOptions extends core_configuration_1.Options {
    constructor(config, section) {
        super(config, section);
    }
    get sources() {
        return this.get(eNugetContributions_1.NugetContributions.Sources);
    }
}
exports.NugetOptions = NugetOptions;


/***/ }),

/***/ "./src/infrastructure.providers/dub/index.ts":
/*!***************************************************!*\
  !*** ./src/infrastructure.providers/dub/index.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/dubClient */ "./src/infrastructure.providers/dub/src/dubClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dubConfig */ "./src/infrastructure.providers/dub/src/dubConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dubSuggestionProvider */ "./src/infrastructure.providers/dub/src/dubSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/dubContainer */ "./src/infrastructure.providers/dub/src/dubContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/dub/src/definitions/eDubContributions.ts":
/*!*******************************************************************************!*\
  !*** ./src/infrastructure.providers/dub/src/definitions/eDubContributions.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DubContributions = void 0;
var DubContributions;
(function (DubContributions) {
    DubContributions["Caching"] = "dub.caching";
    DubContributions["Http"] = "dub.http";
    DubContributions["DependencyProperties"] = "dub.dependencyProperties";
    DubContributions["ApiUrl"] = "dub.apiUrl";
})(DubContributions = exports.DubContributions || (exports.DubContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/dub/src/dubClient.ts":
/*!***********************************************************!*\
  !*** ./src/infrastructure.providers/dub/src/dubClient.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.readDubSelections = exports.createSuggestions = exports.DubClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
class DubClient {
    constructor(config, client, logger) {
        this.config = config;
        this.client = client;
        this.logger = logger;
    }
    async fetchPackage(request) {
        const semverSpec = core_packages_1.VersionHelpers.parseSemver(request.package.version);
        const url = `${this.config.apiUrl}${encodeURIComponent(request.package.name)}/info`;
        return this.createRemotePackageDocument(url, request, semverSpec)
            .catch((error) => {
            this.logger.debug("Caught exception from %s: %O", core_packages_1.PackageSourceTypes.Registry, error);
            const suggestion = core_suggestions_1.SuggestionFactory.createFromHttpStatus(error.status);
            if (suggestion != null) {
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Registry, request, error, [suggestion]);
            }
            return Promise.reject(error);
        });
    }
    async createRemotePackageDocument(url, request, semverSpec) {
        const query = {
            minimize: 'true',
        };
        const headers = {};
        return this.client.request(core_clients_1.HttpClientRequestMethods.get, url, query, headers)
            .then(function (httpResponse) {
            const packageInfo = httpResponse.data;
            const { providerName } = request;
            const versionRange = semverSpec.rawVersion;
            const requested = request.package;
            const resolved = {
                name: requested.name,
                version: versionRange,
            };
            const response = {
                source: httpResponse.source,
                status: httpResponse.status,
            };
            const rawVersions = core_packages_1.VersionHelpers.extractVersionsFromMap(packageInfo.versions);
            // seperate versions to releases and prereleases
            const { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(rawVersions);
            // analyse suggestions
            const suggestions = createSuggestions(versionRange, releases, prereleases);
            return {
                providerName,
                source: core_packages_1.PackageSourceTypes.Registry,
                response,
                type: semverSpec.type,
                requested,
                resolved,
                suggestions,
            };
        });
    }
}
exports.DubClient = DubClient;
function createSuggestions(versionRange, releases, prereleases) {
    const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases);
    // check for ~{name} suggestion if no matches found
    const firstSuggestion = suggestions[0];
    const hasNoMatch = firstSuggestion.name === core_suggestions_1.SuggestionStatus.NoMatch;
    const isTildeVersion = versionRange.charAt(0) === '~';
    if (hasNoMatch && isTildeVersion && releases.length > 0) {
        const latestRelease = releases[releases.length - 1];
        if (latestRelease === versionRange) {
            suggestions[0] = core_suggestions_1.SuggestionFactory.createMatchesLatest(versionRange);
            suggestions.pop();
        }
        else {
            // suggest
            suggestions[1] = core_suggestions_1.SuggestionFactory.createLatest(latestRelease);
        }
    }
    return suggestions;
}
exports.createSuggestions = createSuggestions;
async function readDubSelections(filePath) {
    return new Promise(function (resolve, reject) {
        const fs = __webpack_require__(/*! fs */ "fs");
        if (fs.existsSync(filePath) === false) {
            reject(null);
            return;
        }
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const selectionsJson = JSON.parse(data.toString());
            if (selectionsJson.fileVersion != 1) {
                reject(new Error(`Unknown dub.selections.json file version ${selectionsJson.fileVersion}`));
                return;
            }
            resolve(selectionsJson);
        });
    });
}
exports.readDubSelections = readDubSelections;


/***/ }),

/***/ "./src/infrastructure.providers/dub/src/dubConfig.ts":
/*!***********************************************************!*\
  !*** ./src/infrastructure.providers/dub/src/dubConfig.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DubConfig = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const eDubContributions_1 = __webpack_require__(/*! ./definitions/eDubContributions */ "./src/infrastructure.providers/dub/src/definitions/eDubContributions.ts");
class DubConfig {
    constructor(config, caching, http) {
        this.providerName = 'dub';
        this.supports = [
            core_providers_1.ProviderSupport.Releases,
            core_providers_1.ProviderSupport.Prereleases,
            core_providers_1.ProviderSupport.InstalledStatuses,
        ];
        this.fileMatcher = {
            language: 'json',
            scheme: 'file',
            pattern: '**/{dub.json,dub.selections.json}',
        };
        this.config = config;
        this.caching = caching;
        this.http = http;
    }
    get dependencyProperties() {
        return this.config.get(eDubContributions_1.DubContributions.DependencyProperties);
    }
    get apiUrl() {
        return core_clients_1.UrlHelpers.ensureEndSlash(this.config.get(eDubContributions_1.DubContributions.ApiUrl));
    }
}
exports.DubConfig = DubConfig;


/***/ }),

/***/ "./src/infrastructure.providers/dub/src/dubContainer.ts":
/*!**************************************************************!*\
  !*** ./src/infrastructure.providers/dub/src/dubContainer.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const eDubContributions_1 = __webpack_require__(/*! ./definitions/eDubContributions */ "./src/infrastructure.providers/dub/src/definitions/eDubContributions.ts");
const dubSuggestionProvider_1 = __webpack_require__(/*! ./dubSuggestionProvider */ "./src/infrastructure.providers/dub/src/dubSuggestionProvider.ts");
const dubConfig_1 = __webpack_require__(/*! ./dubConfig */ "./src/infrastructure.providers/dub/src/dubConfig.ts");
const dubClient_1 = __webpack_require__(/*! ./dubClient */ "./src/infrastructure.providers/dub/src/dubClient.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        dubCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, eDubContributions_1.DubContributions.Caching, 'caching')).singleton(),
        dubHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, eDubContributions_1.DubContributions.Http, 'http')).singleton(),
        // config
        dubConfig: awilix_1.asFunction((rootConfig, dubCachingOpts, dubHttpOpts) => new dubConfig_1.DubConfig(rootConfig, dubCachingOpts, dubHttpOpts)).singleton(),
        // clients
        dubJsonClient: awilix_1.asFunction((dubCachingOpts, dubHttpOpts, logger) => infrastructure_clients_1.createJsonClient({
            caching: dubCachingOpts,
            http: dubHttpOpts
        }, logger.child({ namespace: 'dub request' }))).singleton(),
        dubClient: awilix_1.asFunction((dubConfig, dubJsonClient, logger) => new dubClient_1.DubClient(dubConfig, dubJsonClient, logger.child({ namespace: 'dub client' }))).singleton(),
        // provider
        dubProvider: awilix_1.asFunction((dubClient, logger) => new dubSuggestionProvider_1.DubSuggestionProvider(dubClient, logger.child({ namespace: 'dub provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.dubProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/dub/src/dubSuggestionProvider.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.providers/dub/src/dubSuggestionProvider.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DubSuggestionProvider = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
class DubSuggestionProvider {
    constructor(client, logger) {
        this.client = client;
        this.config = client.config;
        this.logger = logger;
        this.suggestionReplaceFn = core_suggestions_1.defaultReplaceFn;
    }
    parseDependencies(packageText) {
        const packageDependencies = core_packages_1.extractPackageDependenciesFromJson(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        const clientData = null;
        return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.client, clientData, packageDependencies);
    }
}
exports.DubSuggestionProvider = DubSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/jspm/index.ts":
/*!****************************************************!*\
  !*** ./src/infrastructure.providers/jspm/index.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/jspmConfig */ "./src/infrastructure.providers/jspm/src/jspmConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/jspmPackageParser */ "./src/infrastructure.providers/jspm/src/jspmPackageParser.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/jspmSuggestionProvider */ "./src/infrastructure.providers/jspm/src/jspmSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/jspmContainer */ "./src/infrastructure.providers/jspm/src/jspmContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/jspm/src/jspmConfig.ts":
/*!*************************************************************!*\
  !*** ./src/infrastructure.providers/jspm/src/jspmConfig.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.JspmConfig = void 0;
const infrastructure_providers_npm_1 = __webpack_require__(/*! infrastructure.providers.npm */ "./src/infrastructure.providers/npm/index.ts");
class JspmConfig extends infrastructure_providers_npm_1.NpmConfig {
    constructor(config, caching, http, github) {
        super(config, caching, http, github);
        this.providerName = 'jspm';
    }
}
exports.JspmConfig = JspmConfig;


/***/ }),

/***/ "./src/infrastructure.providers/jspm/src/jspmContainer.ts":
/*!****************************************************************!*\
  !*** ./src/infrastructure.providers/jspm/src/jspmContainer.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const infrastructure_providers_npm_1 = __webpack_require__(/*! infrastructure.providers.npm */ "./src/infrastructure.providers/npm/index.ts");
const jspmConfig_1 = __webpack_require__(/*! ./jspmConfig */ "./src/infrastructure.providers/jspm/src/jspmConfig.ts");
const jspmSuggestionProvider_1 = __webpack_require__(/*! ./jspmSuggestionProvider */ "./src/infrastructure.providers/jspm/src/jspmSuggestionProvider.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        jspmCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, infrastructure_providers_npm_1.NpmContributions.Caching, 'caching')).singleton(),
        jspmHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, infrastructure_providers_npm_1.NpmContributions.Http, 'http')).singleton(),
        jspmGitHubOpts: awilix_1.asFunction(rootConfig => new infrastructure_providers_npm_1.GitHubOptions(rootConfig, infrastructure_providers_npm_1.NpmContributions.Github, 'github')).singleton(),
        // config
        jspmConfig: awilix_1.asFunction((rootConfig, jspmCachingOpts, jspmHttpOpts, jspmGitHubOpts) => new jspmConfig_1.JspmConfig(rootConfig, jspmCachingOpts, jspmHttpOpts, jspmGitHubOpts)).singleton(),
        // clients
        githubJsonClient: awilix_1.asFunction((jspmCachingOpts, jspmHttpOpts, logger) => infrastructure_clients_1.createJsonClient({
            caching: jspmCachingOpts,
            http: jspmHttpOpts
        }, logger.child({ namespace: 'jspm request' }))).singleton(),
        githubClient: awilix_1.asFunction((jspmConfig, githubJsonClient, logger) => new infrastructure_providers_npm_1.GitHubClient(jspmConfig, githubJsonClient, logger.child({ namespace: 'jspm github' }))).singleton(),
        pacoteClient: awilix_1.asFunction((jspmConfig, logger) => new infrastructure_providers_npm_1.PacoteClient(jspmConfig, logger.child({ namespace: 'pacote client' }))).singleton(),
        jspmClient: awilix_1.asFunction((jspmConfig, githubClient, pacoteClient, logger) => new infrastructure_providers_npm_1.NpmPackageClient(jspmConfig, pacoteClient, githubClient, logger.child({ namespace: 'jspm client' }))).singleton(),
        // provider
        jspmProvider: awilix_1.asFunction((jspmClient, logger) => new jspmSuggestionProvider_1.JspmSuggestionProvider(jspmClient, logger.child({ namespace: 'jspm provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.jspmProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/jspm/src/jspmPackageParser.ts":
/*!********************************************************************!*\
  !*** ./src/infrastructure.providers/jspm/src/jspmPackageParser.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPackageDependenciesFromJson = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
function extractPackageDependenciesFromJson(json, filterPropertyNames) {
    const jsonParser = __webpack_require__(/*! jsonc-parser */ "jsonc-parser");
    const jsonErrors = [];
    const jsonTree = jsonParser.parseTree(json, jsonErrors);
    if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0)
        return [];
    const children = jsonTree.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const [keyEntry, valueEntry] = node.children;
        if (keyEntry.value === 'jspm') {
            return core_packages_1.extractFromNodes(valueEntry.children, filterPropertyNames);
        }
    }
    return [];
}
exports.extractPackageDependenciesFromJson = extractPackageDependenciesFromJson;


/***/ }),

/***/ "./src/infrastructure.providers/jspm/src/jspmSuggestionProvider.ts":
/*!*************************************************************************!*\
  !*** ./src/infrastructure.providers/jspm/src/jspmSuggestionProvider.ts ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.JspmSuggestionProvider = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const infrastructure_providers_npm_1 = __webpack_require__(/*! infrastructure.providers.npm */ "./src/infrastructure.providers/npm/index.ts");
const jspmPackageParser_1 = __webpack_require__(/*! ./jspmPackageParser */ "./src/infrastructure.providers/jspm/src/jspmPackageParser.ts");
class JspmSuggestionProvider extends infrastructure_providers_npm_1.NpmSuggestionProvider {
    constructor(client, logger) {
        super(client, logger);
    }
    parseDependencies(packageText) {
        const packageDependencies = jspmPackageParser_1.extractPackageDependenciesFromJson(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        const clientData = null;
        return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.client, clientData, packageDependencies);
    }
}
exports.JspmSuggestionProvider = JspmSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/maven/index.ts":
/*!*****************************************************!*\
  !*** ./src/infrastructure.providers/maven/index.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/clients/mavenClient */ "./src/infrastructure.providers/maven/src/clients/mavenClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/clients/mvnCli */ "./src/infrastructure.providers/maven/src/clients/mvnCli.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/mavenClientData */ "./src/infrastructure.providers/maven/src/definitions/mavenClientData.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/mavenProjectProperty */ "./src/infrastructure.providers/maven/src/definitions/mavenProjectProperty.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/mavenRepository */ "./src/infrastructure.providers/maven/src/definitions/mavenRepository.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/mavenConfig */ "./src/infrastructure.providers/maven/src/mavenConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/mavenSuggestionProvider */ "./src/infrastructure.providers/maven/src/mavenSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/mavenXmlParserFactory */ "./src/infrastructure.providers/maven/src/mavenXmlParserFactory.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/mavenContainer */ "./src/infrastructure.providers/maven/src/mavenContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/clients/mavenClient.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/clients/mavenClient.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class MavenClient {
    constructor(config, httpClient, logger) {
        this.config = config;
        this.httpClient = httpClient;
        this.logger = logger;
    }
    async fetchPackage(request) {
        const semverSpec = core_packages_1.VersionHelpers.parseSemver(request.package.version);
        const { repositories } = request.clientData;
        const url = repositories[0].url;
        let [group, artifact] = request.package.name.split(':');
        let search = group.replace(/\./g, "/") + "/" + artifact;
        const queryUrl = `${url}${search}/maven-metadata.xml`;
        return this.createRemotePackageDocument(queryUrl, request, semverSpec)
            .catch((error) => {
            this.logger.debug("Caught exception from %s: %O", core_packages_1.PackageSourceTypes.Registry, error);
            const suggestion = core_suggestions_1.SuggestionFactory.createFromHttpStatus(error.status);
            if (suggestion != null) {
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Registry, request, error, [suggestion]);
            }
            return Promise.reject(error);
        });
    }
    async createRemotePackageDocument(url, request, semverSpec) {
        const query = {};
        const headers = {};
        return this.httpClient.request(core_clients_1.HttpClientRequestMethods.get, url, query, headers)
            .then(function (httpResponse) {
            const { data } = httpResponse;
            const source = core_packages_1.PackageSourceTypes.Registry;
            const { providerName } = request;
            const requested = request.package;
            const versionRange = semverSpec.rawVersion;
            const response = {
                source: httpResponse.source,
                status: httpResponse.status,
            };
            // extract versions form xml
            const rawVersions = getVersionsFromPackageXml(data);
            // extract semver versions only
            const semverVersions = core_packages_1.VersionHelpers.filterSemverVersions(rawVersions);
            // seperate versions to releases and prereleases
            const { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(semverVersions);
            const resolved = {
                name: requested.name,
                version: versionRange,
            };
            // analyse suggestions
            const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases);
            return {
                providerName,
                source,
                response,
                type: semverSpec.type,
                requested,
                resolved,
                suggestions,
            };
        });
    }
}
exports.MavenClient = MavenClient;
function getVersionsFromPackageXml(packageXml) {
    const xmldoc = __webpack_require__(/*! xmldoc */ "xmldoc");
    let xmlRootNode = new xmldoc.XmlDocument(packageXml);
    let xmlVersioningNode = xmlRootNode.childNamed("versioning");
    let xmlVersionsList = xmlVersioningNode.childNamed("versions").childrenNamed("version");
    let versions = [];
    xmlVersionsList.forEach(xmlVersionNode => {
        versions.push(xmlVersionNode.val);
    });
    return versions;
}


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/clients/mvnCli.ts":
/*!******************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/clients/mvnCli.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MvnCli = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const MavenXmlFactory = __webpack_require__(/*! ../mavenXmlParserFactory */ "./src/infrastructure.providers/maven/src/mavenXmlParserFactory.ts");
class MvnCli {
    constructor(config, client, logger) {
        this.client = client;
        this.config = config;
        this.logger = logger;
    }
    async fetchRepositories(cwd) {
        const promisedCli = this.client.request('mvn ', ['help:effective-settings'], cwd);
        return promisedCli.then(result => {
            const { data } = result;
            // check we have some data
            if (data.length === 0)
                return [];
            return MavenXmlFactory.extractReposUrlsFromXml(data);
        }).catch(error => {
            return [];
        }).then((repos) => {
            if (repos.length === 0) {
                // this.config.getDefaultRepository()
                repos.push("https://repo.maven.apache.org/maven2/");
            }
            return repos;
        }).then((repos) => {
            // parse urls to Array<MavenRepository.
            return repos.map(url => {
                const protocol = core_clients_1.UrlHelpers.getProtocolFromUrl(url);
                return {
                    url,
                    protocol,
                };
            });
        });
    }
}
exports.MvnCli = MvnCli;


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/definitions/eMavenContributions.ts":
/*!***********************************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/definitions/eMavenContributions.ts ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenContributions = void 0;
var MavenContributions;
(function (MavenContributions) {
    MavenContributions["Caching"] = "maven.caching";
    MavenContributions["Http"] = "maven.http";
    MavenContributions["DependencyProperties"] = "maven.dependencyProperties";
    MavenContributions["TagFilter"] = "maven.tagFilter";
    MavenContributions["ApiUrl"] = "maven.apiUrl";
})(MavenContributions = exports.MavenContributions || (exports.MavenContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/definitions/mavenClientData.ts":
/*!*******************************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/definitions/mavenClientData.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/definitions/mavenProjectProperty.ts":
/*!************************************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/definitions/mavenProjectProperty.ts ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/definitions/mavenRepository.ts":
/*!*******************************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/definitions/mavenRepository.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/mavenConfig.ts":
/*!***************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/mavenConfig.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenConfig = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const eMavenContributions_1 = __webpack_require__(/*! ./definitions/eMavenContributions */ "./src/infrastructure.providers/maven/src/definitions/eMavenContributions.ts");
class MavenConfig {
    constructor(config, caching, http) {
        this.providerName = 'maven';
        this.supports = [
            core_providers_1.ProviderSupport.Releases,
            core_providers_1.ProviderSupport.Prereleases,
        ];
        this.fileMatcher = {
            language: 'xml',
            scheme: 'file',
            pattern: '**/pom.xml',
        };
        this.config = config;
        this.caching = caching;
        this.http = http;
    }
    get dependencyProperties() {
        return this.config.get(eMavenContributions_1.MavenContributions.DependencyProperties);
    }
    get tagFilter() {
        return this.config.get(eMavenContributions_1.MavenContributions.DependencyProperties);
    }
    get apiUrl() {
        return core_clients_1.UrlHelpers.ensureEndSlash(this.config.get(eMavenContributions_1.MavenContributions.ApiUrl));
    }
}
exports.MavenConfig = MavenConfig;


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/mavenContainer.ts":
/*!******************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/mavenContainer.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const eMavenContributions_1 = __webpack_require__(/*! ./definitions/eMavenContributions */ "./src/infrastructure.providers/maven/src/definitions/eMavenContributions.ts");
const mvnCli_1 = __webpack_require__(/*! ./clients/mvnCli */ "./src/infrastructure.providers/maven/src/clients/mvnCli.ts");
const mavenClient_1 = __webpack_require__(/*! ./clients/mavenClient */ "./src/infrastructure.providers/maven/src/clients/mavenClient.ts");
const mavenConfig_1 = __webpack_require__(/*! ./mavenConfig */ "./src/infrastructure.providers/maven/src/mavenConfig.ts");
const mavenSuggestionProvider_1 = __webpack_require__(/*! ./mavenSuggestionProvider */ "./src/infrastructure.providers/maven/src/mavenSuggestionProvider.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        mavenCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, eMavenContributions_1.MavenContributions.Caching, 'caching')).singleton(),
        mavenHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, eMavenContributions_1.MavenContributions.Http, 'http')).singleton(),
        // config
        mavenConfig: awilix_1.asFunction((rootConfig, mavenCachingOpts, mavenHttpOpts) => new mavenConfig_1.MavenConfig(rootConfig, mavenCachingOpts, mavenHttpOpts)).singleton(),
        // cli
        mvnProcess: awilix_1.asFunction((mavenCachingOpts, logger) => infrastructure_clients_1.createProcessClient(mavenCachingOpts, logger.child({ namespace: 'maven mvn process' }))).singleton(),
        mvnCli: awilix_1.asFunction((mavenConfig, mvnProcess, logger) => new mvnCli_1.MvnCli(mavenConfig, mvnProcess, logger.child({ namespace: 'maven mvn cli' }))).singleton(),
        // clients
        mavenHttpClient: awilix_1.asFunction((mavenCachingOpts, mavenHttpOpts, logger) => infrastructure_clients_1.createHttpClient({
            caching: mavenCachingOpts,
            http: mavenHttpOpts
        }, logger.child({ namespace: 'maven request' }))).singleton(),
        mavenClient: awilix_1.asFunction((mavenConfig, mavenHttpClient, logger) => new mavenClient_1.MavenClient(mavenConfig, mavenHttpClient, logger.child({ namespace: 'maven client' }))).singleton(),
        // provider
        mavenProvider: awilix_1.asFunction((mvnCli, mavenClient, logger) => new mavenSuggestionProvider_1.MavenSuggestionProvider(mvnCli, mavenClient, logger.child({ namespace: 'maven provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.mavenProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/mavenSuggestionProvider.ts":
/*!***************************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/mavenSuggestionProvider.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenSuggestionProvider = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const MavenXmlFactory = __webpack_require__(/*! ./mavenXmlParserFactory */ "./src/infrastructure.providers/maven/src/mavenXmlParserFactory.ts");
class MavenSuggestionProvider {
    constructor(mnvCli, client, logger) {
        this.mvnCli = mnvCli;
        this.client = client;
        this.config = client.config;
        this.logger = logger;
    }
    parseDependencies(packageText) {
        const packageDependencies = MavenXmlFactory.createDependenciesFromXml(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        // gets source feeds from the project path
        const promisedRepos = this.mvnCli.fetchRepositories(packagePath);
        return promisedRepos.then(repos => {
            const repositories = repos.filter(repo => repo.protocol === core_clients_1.UrlHelpers.RegistryProtocols.https);
            const clientData = { repositories };
            return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.client, clientData, packageDependencies);
        });
    }
}
exports.MavenSuggestionProvider = MavenSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/maven/src/mavenXmlParserFactory.ts":
/*!*************************************************************************!*\
  !*** ./src/infrastructure.providers/maven/src/mavenXmlParserFactory.ts ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.extractReposUrlsFromXml = exports.createDependenciesFromXml = void 0;
function createDependenciesFromXml(xml, includePropertyNames) {
    const xmldoc = __webpack_require__(/*! xmldoc */ "xmldoc");
    let document = null;
    try {
        document = new xmldoc.XmlDocument(xml);
    }
    catch {
        document = null;
    }
    if (!document)
        return [];
    const properties = extractPropertiesFromDocument(document);
    return extractPackageLensDataFromNodes(document, properties, includePropertyNames);
}
exports.createDependenciesFromXml = createDependenciesFromXml;
function extractPackageLensDataFromNodes(xmlDoc, properties, includePropertyNames) {
    const collector = [];
    xmlDoc.eachChild(group => {
        switch (group.name) {
            case "dependencies":
                group.eachChild(childNode => {
                    if (!includePropertyNames.includes(childNode.name))
                        return;
                    collectFromChildVersionTag(childNode, properties, collector);
                });
                break;
            case "parent":
                if (!includePropertyNames.includes(group.name))
                    return;
                collectFromChildVersionTag(group, properties, collector);
                break;
            default:
                break;
        }
    });
    return collector;
}
function collectFromChildVersionTag(parentNode, properties, collector) {
    parentNode.eachChild(childNode => {
        let versionNode;
        if (childNode.name !== "version")
            return;
        if (childNode.val.indexOf("$") >= 0) {
            let name = childNode.val.replace(/\$|\{|\}/ig, '');
            versionNode = properties.filter(property => {
                return property.name === name;
            })[0];
        }
        else {
            versionNode = childNode;
        }
        const nameRange = {
            start: parentNode.startTagPosition,
            end: parentNode.startTagPosition,
        };
        const versionRange = {
            start: versionNode.position,
            end: versionNode.position + versionNode.val.length,
        };
        let group = parentNode.childNamed("groupId").val;
        let artifact = parentNode.childNamed("artifactId").val;
        let match = /\$\{(.*)\}/ig.exec(artifact);
        if (match) {
            let property = properties.filter(property => property.name === match[1]);
            artifact = artifact.replace(/\$\{.*\}/ig, property[0].val);
        }
        const packageInfo = {
            name: group + ":" + artifact,
            version: versionNode.val,
        };
        collector.push({
            nameRange,
            versionRange,
            packageInfo
        });
    });
}
function extractPropertiesFromDocument(xmlDoc) {
    let properties = [];
    let propertiesCurrentPom = xmlDoc.descendantWithPath("properties");
    propertiesCurrentPom.eachChild(property => {
        properties.push({
            name: property.name,
            val: property.val,
            position: property.position
        });
    });
    return properties;
}
function extractReposUrlsFromXml(stdout) {
    const xmldoc = __webpack_require__(/*! xmldoc */ "xmldoc");
    const regex = /<\?xml(.+\r?\n?)+\/settings>/gm;
    const xmlString = regex.exec(stdout.toString())[0];
    const xml = new xmldoc.XmlDocument(xmlString);
    const localRepository = xml.descendantWithPath("localRepository");
    const results = [
        localRepository.val
    ];
    let repositoriesXml = xml.descendantWithPath("profiles.profile.repositories")
        .childrenNamed("repository");
    repositoriesXml.forEach(repositoryXml => {
        results.push(repositoryXml.childNamed("url").val);
    });
    return results;
}
exports.extractReposUrlsFromXml = extractReposUrlsFromXml;


/***/ }),

/***/ "./src/infrastructure.providers/npm/index.ts":
/*!***************************************************!*\
  !*** ./src/infrastructure.providers/npm/index.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/definitions/eNpmContributions */ "./src/infrastructure.providers/npm/src/definitions/eNpmContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/iPacote */ "./src/infrastructure.providers/npm/src/definitions/iPacote.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/clients/githubClient */ "./src/infrastructure.providers/npm/src/clients/githubClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/clients/npmPackageClient */ "./src/infrastructure.providers/npm/src/clients/npmPackageClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/clients/pacoteClient */ "./src/infrastructure.providers/npm/src/clients/pacoteClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/factories/packageFactory */ "./src/infrastructure.providers/npm/src/factories/packageFactory.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/models/npaSpec */ "./src/infrastructure.providers/npm/src/models/npaSpec.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/options/githubOptions */ "./src/infrastructure.providers/npm/src/options/githubOptions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/npmConfig */ "./src/infrastructure.providers/npm/src/npmConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/npmSuggestionProvider */ "./src/infrastructure.providers/npm/src/npmSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/npmUtils */ "./src/infrastructure.providers/npm/src/npmUtils.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/npmContainer */ "./src/infrastructure.providers/npm/src/npmContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/clients/githubClient.ts":
/*!**********************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/clients/githubClient.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const defaultHeaders = {
    accept: 'application\/vnd.github.v3+json',
    'user-agent': 'vscode-contrib/vscode-versionlens'
};
class GitHubClient {
    constructor(config, client, logger) {
        this.config = config;
        this.client = client;
        this.logger = logger;
    }
    fetchGithub(request, npaSpec) {
        const { validRange } = __webpack_require__(/*! semver */ "semver");
        if (npaSpec.gitRange) {
            // we have a semver:x.x.x
            return this.fetchTags(request, npaSpec);
        }
        if (validRange(npaSpec.gitCommittish, core_packages_1.VersionHelpers.loosePrereleases)) {
            // we have a #x.x.x
            npaSpec.gitRange = npaSpec.gitCommittish;
            return this.fetchTags(request, npaSpec);
        }
        // we have a #commit
        return this.fetchCommits(request, npaSpec);
    }
    fetchTags(request, npaSpec) {
        // todo pass in auth
        const { user, project } = npaSpec.hosted;
        const tagsRepoUrl = `https://api.github.com/repos/${user}/${project}/tags`;
        const query = {};
        const headers = this.getHeaders();
        return this.client.request(core_clients_1.HttpClientRequestMethods.get, tagsRepoUrl, query, headers)
            .then(function (response) {
            const { compareLoose } = __webpack_require__(/*! semver */ "semver");
            // extract versions
            const tags = response.data;
            const rawVersions = tags.map((tag) => tag.name);
            const allVersions = core_packages_1.VersionHelpers.filterSemverVersions(rawVersions).sort(compareLoose);
            const source = core_packages_1.PackageSourceTypes.Github;
            const { providerName } = request;
            const requested = request.package;
            const type = npaSpec.gitRange ?
                core_packages_1.PackageVersionTypes.Range :
                core_packages_1.PackageVersionTypes.Version;
            const versionRange = npaSpec.gitRange;
            const resolved = {
                name: project,
                version: versionRange,
            };
            // seperate versions to releases and prereleases
            const { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(allVersions);
            // analyse suggestions
            const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases);
            return {
                providerName,
                source,
                response,
                type,
                requested,
                resolved,
                suggestions
            };
        });
    }
    fetchCommits(request, npaSpec) {
        // todo pass in auth
        const { user, project } = npaSpec.hosted;
        const commitsRepoUrl = `https://api.github.com/repos/${user}/${project}/commits`;
        const query = {};
        const headers = this.getHeaders();
        return this.client.request(core_clients_1.HttpClientRequestMethods.get, commitsRepoUrl, query, headers)
            .then((response) => {
            const commitInfos = response.data;
            const commits = commitInfos.map((commit) => commit.sha);
            const source = core_packages_1.PackageSourceTypes.Github;
            const { providerName } = request;
            const requested = request.package;
            const type = core_packages_1.PackageVersionTypes.Committish;
            const versionRange = npaSpec.gitCommittish;
            if (commits.length === 0) {
                // no commits found
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Github, request, response, [core_suggestions_1.SuggestionFactory.createNotFound()]);
            }
            const commitIndex = commits.findIndex(commit => commit.indexOf(versionRange) > -1);
            const latestCommit = commits[commits.length - 1].substr(0, 8);
            const noMatch = commitIndex === -1;
            const isLatest = versionRange === latestCommit;
            const resolved = {
                name: project,
                version: versionRange,
            };
            const suggestions = [];
            if (noMatch) {
                suggestions.push(core_suggestions_1.SuggestionFactory.createNoMatch(), core_suggestions_1.SuggestionFactory.createLatest(latestCommit));
            }
            else if (isLatest) {
                suggestions.push(core_suggestions_1.SuggestionFactory.createMatchesLatest(versionRange));
            }
            else if (commitIndex > 0) {
                suggestions.push(core_suggestions_1.SuggestionFactory.createFixedStatus(versionRange), core_suggestions_1.SuggestionFactory.createLatest(latestCommit));
            }
            return {
                providerName,
                source,
                response,
                type,
                requested,
                resolved,
                suggestions,
                gitSpec: npaSpec.saveSpec
            };
        });
    }
    getHeaders() {
        const userHeaders = {};
        if (this.config.github.accessToken && this.config.github.accessToken.length > 0) {
            userHeaders.authorization = `token ${this.config.github.accessToken}`;
        }
        return Object.assign({}, userHeaders, defaultHeaders);
    }
}
exports.GitHubClient = GitHubClient;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/clients/npmPackageClient.ts":
/*!**************************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/clients/npmPackageClient.ts ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmPackageClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const PackageFactory = __webpack_require__(/*! ../factories/packageFactory */ "./src/infrastructure.providers/npm/src/factories/packageFactory.ts");
const npaSpec_1 = __webpack_require__(/*! ../models/npaSpec */ "./src/infrastructure.providers/npm/src/models/npaSpec.ts");
const NpmUtils = __webpack_require__(/*! ../npmUtils */ "./src/infrastructure.providers/npm/src/npmUtils.ts");
class NpmPackageClient {
    constructor(config, pacoteClient, githubClient, logger) {
        this.config = config;
        this.pacoteClient = pacoteClient;
        this.githubClient = githubClient;
        this.logger = logger;
    }
    async fetchPackage(request) {
        const npa = __webpack_require__(/*! npm-package-arg */ "npm-package-arg");
        let source;
        return new Promise((resolve, reject) => {
            let npaSpec;
            // try parse the package
            try {
                npaSpec = npa.resolve(request.package.name, request.package.version, request.package.path);
            }
            catch (error) {
                return reject(NpmUtils.convertNpmErrorToResponse(error, core_clients_1.ClientResponseSource.local));
            }
            // return if directory or file document
            if (npaSpec.type === npaSpec_1.NpaTypes.Directory || npaSpec.type === npaSpec_1.NpaTypes.File) {
                source = core_packages_1.PackageSourceTypes.Directory;
                return resolve(PackageFactory.createDirectory(request.providerName, request.package, core_packages_1.ResponseFactory.createResponseStatus(core_clients_1.ClientResponseSource.local, 200), npaSpec));
            }
            if (npaSpec.type === npaSpec_1.NpaTypes.Git) {
                source = core_packages_1.PackageSourceTypes.Git;
                if (!npaSpec.hosted) {
                    // could not resolve
                    return reject({
                        status: 'EUNSUPPORTEDPROTOCOL',
                        data: 'Git url could not be resolved',
                        source: core_clients_1.ClientResponseSource.local
                    });
                }
                if (!npaSpec.gitCommittish && npaSpec.hosted.default !== 'shortcut') {
                    return resolve(core_packages_1.DocumentFactory.createFixed(request.providerName, core_packages_1.PackageSourceTypes.Git, request.package, core_packages_1.ResponseFactory.createResponseStatus(core_clients_1.ClientResponseSource.local, 0), core_packages_1.PackageVersionTypes.Committish, 'git repository'));
                }
                // resolve tags, committishes
                source = core_packages_1.PackageSourceTypes.Github;
                return resolve(this.githubClient.fetchGithub(request, npaSpec));
            }
            // otherwise return registry result
            source = core_packages_1.PackageSourceTypes.Registry;
            return resolve(this.pacoteClient.fetchPackage(request, npaSpec));
        }).catch(response => {
            this.logger.debug("Caught exception from %s: %O", source, response);
            if (!response.data) {
                response = NpmUtils.convertNpmErrorToResponse(response, core_clients_1.ClientResponseSource.remote);
            }
            const status = response.status &&
                !Number.isInteger(response.status) &&
                response.status.startsWith('E') ?
                response.status.substr(1) :
                response.status;
            let suggestions;
            if (status == 'CONNREFUSED')
                suggestions = [core_suggestions_1.SuggestionFactory.createConnectionRefused()];
            else if (status == 'UNSUPPORTEDPROTOCOL' || response.data == 'Not implemented yet')
                suggestions = [core_suggestions_1.SuggestionFactory.createNotSupported()];
            else if (status == 'INVALIDTAGNAME' || response.data.includes('Invalid comparator:'))
                suggestions = [
                    core_suggestions_1.SuggestionFactory.createInvalid(''),
                    core_suggestions_1.SuggestionFactory.createLatest()
                ];
            else if (status == 128)
                suggestions = [core_suggestions_1.SuggestionFactory.createNotFound()];
            else
                suggestions = [core_suggestions_1.SuggestionFactory.createFromHttpStatus(status)];
            if (suggestions === null)
                return Promise.reject(response);
            return core_packages_1.DocumentFactory.create(source, request, core_packages_1.ResponseFactory.createResponseStatus(response.source, response.status), suggestions);
        });
    }
}
exports.NpmPackageClient = NpmPackageClient;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/clients/pacoteClient.ts":
/*!**********************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/clients/pacoteClient.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PacoteClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const npaSpec_1 = __webpack_require__(/*! ../models/npaSpec */ "./src/infrastructure.providers/npm/src/models/npaSpec.ts");
const NpmUtils = __webpack_require__(/*! ../npmUtils */ "./src/infrastructure.providers/npm/src/npmUtils.ts");
class PacoteClient extends core_clients_1.AbstractCachedRequest {
    constructor(config, logger) {
        super(config.caching);
        this.config = config;
        this.logger = logger;
        this.pacote = __webpack_require__(/*! pacote */ "pacote");
        this.libnpmconfig = __webpack_require__(/*! libnpmconfig */ "libnpmconfig");
    }
    async fetchPackage(request, npaSpec) {
        const cacheKey = `${request.package.name}@${request.package.version}_${request.package.path}`;
        if (this.cache.cachingOpts.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
            this.logger.debug("Fetching from cache using key: %s", cacheKey);
            const cachedResp = this.cache.get(cacheKey);
            if (cachedResp.rejected)
                return Promise.reject(cachedResp);
            cachedResp.data.response.source = core_clients_1.ClientResponseSource.cache;
            return Promise.resolve(cachedResp.data);
        }
        // get npm config
        const npmOpts = this.libnpmconfig.read({
            where: request.package.path,
            fullMetadata: false,
            retry: {
                retries: 0
            }
        }, {
            cwd: request.package.path,
        });
        return this.pacote.packument(npaSpec, npmOpts)
            .then(function (packumentResponse) {
            const { compareLoose } = __webpack_require__(/*! semver */ "semver");
            const { providerName } = request;
            const source = core_packages_1.PackageSourceTypes.Registry;
            const type = npaSpec.type;
            let versionRange = (type === core_packages_1.PackageVersionTypes.Alias) ?
                npaSpec.subSpec.rawSpec :
                npaSpec.rawSpec;
            const resolved = {
                name: (type === core_packages_1.PackageVersionTypes.Alias) ?
                    npaSpec.subSpec.name :
                    npaSpec.name,
                version: versionRange,
            };
            // extract raw versions and sort
            const rawVersions = Object.keys(packumentResponse.versions || {}).sort(compareLoose);
            // seperate versions to releases and prereleases
            let { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(rawVersions);
            // extract prereleases from dist tags
            const distTags = packumentResponse['dist-tags'] || {};
            const latestTaggedVersion = distTags['latest'];
            // extract releases
            if (latestTaggedVersion) {
                // cap the releases to the latest tagged version
                releases = core_packages_1.VersionHelpers.lteFromArray(releases, latestTaggedVersion);
            }
            const response = {
                source: core_clients_1.ClientResponseSource.remote,
                status: 200,
            };
            // use 'latest' tagged version from author?
            const suggestLatestVersion = latestTaggedVersion || (releases.length > 0 ?
                // suggest latest release?
                releases[releases.length - 1] :
                // no suggestion
                null);
            const requested = request.package;
            if (npaSpec.type === npaSpec_1.NpaTypes.Tag) {
                // get the tagged version. eg latest|next
                versionRange = distTags[requested.version];
                if (!versionRange) {
                    // No match
                    return core_packages_1.DocumentFactory.createNoMatch(providerName, source, type, requested, response, suggestLatestVersion);
                }
            }
            // analyse suggestions
            const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases, suggestLatestVersion);
            return {
                providerName,
                source,
                response,
                type,
                requested,
                resolved,
                suggestions,
            };
        }).then(document => {
            this.createCachedResponse(cacheKey, 200, document, false);
            return document;
        }).catch(response => {
            this.createCachedResponse(cacheKey, response.code, response.message, true);
            return Promise.reject(NpmUtils.convertNpmErrorToResponse(response, core_clients_1.ClientResponseSource.remote));
        });
    }
}
exports.PacoteClient = PacoteClient;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/definitions/eGitHubContributions.ts":
/*!**********************************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/definitions/eGitHubContributions.ts ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubContributions = void 0;
var GitHubContributions;
(function (GitHubContributions) {
    GitHubContributions["AccessToken"] = "accessToken";
})(GitHubContributions = exports.GitHubContributions || (exports.GitHubContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/definitions/eNpmContributions.ts":
/*!*******************************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/definitions/eNpmContributions.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmContributions = void 0;
var NpmContributions;
(function (NpmContributions) {
    NpmContributions["Caching"] = "npm.caching";
    NpmContributions["Http"] = "npm.http";
    NpmContributions["Github"] = "npm.github";
    NpmContributions["DependencyProperties"] = "npm.dependencyProperties";
    NpmContributions["DistTagFilter"] = "npm.distTagFilter";
})(NpmContributions = exports.NpmContributions || (exports.NpmContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/definitions/iPacote.ts":
/*!*********************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/definitions/iPacote.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/factories/packageFactory.ts":
/*!**************************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/factories/packageFactory.ts ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createDirectory = exports.fileDependencyRegex = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
exports.fileDependencyRegex = /^file:(.*)$/;
function createDirectory(providerName, requested, response, npaSpec) {
    const fileRegExpResult = exports.fileDependencyRegex.exec(requested.version);
    if (!fileRegExpResult) {
        return core_packages_1.DocumentFactory.createInvalidVersion(providerName, requested, response, npaSpec.type // todo create a converter
        );
    }
    const source = core_packages_1.PackageSourceTypes.Directory;
    const type = core_packages_1.PackageVersionTypes.Version;
    const resolved = {
        name: npaSpec.name,
        version: fileRegExpResult[1],
    };
    const suggestions = [
        {
            name: 'file://',
            version: resolved.version,
            flags: core_suggestions_1.SuggestionFlags.release
        },
    ];
    return {
        providerName,
        source,
        type,
        requested,
        response,
        resolved,
        suggestions
    };
}
exports.createDirectory = createDirectory;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/models/npaSpec.ts":
/*!****************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/models/npaSpec.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NpaTypes = void 0;
var NpaTypes;
(function (NpaTypes) {
    NpaTypes["Git"] = "git";
    NpaTypes["Remote"] = "remote";
    NpaTypes["File"] = "file";
    NpaTypes["Directory"] = "directory";
    NpaTypes["Tag"] = "tag";
    NpaTypes["Version"] = "version";
    NpaTypes["Range"] = "range";
    NpaTypes["Alias"] = "alias";
})(NpaTypes = exports.NpaTypes || (exports.NpaTypes = {}));


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/npmConfig.ts":
/*!***********************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/npmConfig.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmConfig = void 0;
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const eNpmContributions_1 = __webpack_require__(/*! ./definitions/eNpmContributions */ "./src/infrastructure.providers/npm/src/definitions/eNpmContributions.ts");
class NpmConfig {
    constructor(config, caching, http, github) {
        this.providerName = 'npm';
        this.supports = [
            core_providers_1.ProviderSupport.Releases,
            core_providers_1.ProviderSupport.Prereleases,
            core_providers_1.ProviderSupport.InstalledStatuses,
        ];
        this.fileMatcher = {
            language: 'json',
            scheme: 'file',
            pattern: '**/package.json',
        };
        this.config = config;
        this.caching = caching;
        this.http = http;
        this.github = github;
    }
    get dependencyProperties() {
        return this.config.get(eNpmContributions_1.NpmContributions.DependencyProperties);
    }
    get distTagFilter() {
        return this.config.get(eNpmContributions_1.NpmContributions.DistTagFilter);
    }
}
exports.NpmConfig = NpmConfig;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/npmContainer.ts":
/*!**************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/npmContainer.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const eNpmContributions_1 = __webpack_require__(/*! ./definitions/eNpmContributions */ "./src/infrastructure.providers/npm/src/definitions/eNpmContributions.ts");
const githubOptions_1 = __webpack_require__(/*! ./options/githubOptions */ "./src/infrastructure.providers/npm/src/options/githubOptions.ts");
const npmPackageClient_1 = __webpack_require__(/*! ./clients/npmPackageClient */ "./src/infrastructure.providers/npm/src/clients/npmPackageClient.ts");
const pacoteClient_1 = __webpack_require__(/*! ./clients/pacoteClient */ "./src/infrastructure.providers/npm/src/clients/pacoteClient.ts");
const githubClient_1 = __webpack_require__(/*! ./clients/githubClient */ "./src/infrastructure.providers/npm/src/clients/githubClient.ts");
const npmSuggestionProvider_1 = __webpack_require__(/*! ./npmSuggestionProvider */ "./src/infrastructure.providers/npm/src/npmSuggestionProvider.ts");
const npmConfig_1 = __webpack_require__(/*! ./npmConfig */ "./src/infrastructure.providers/npm/src/npmConfig.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        npmCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, eNpmContributions_1.NpmContributions.Caching, 'caching')).singleton(),
        npmHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, eNpmContributions_1.NpmContributions.Http, 'http')).singleton(),
        npmGitHubOpts: awilix_1.asFunction(rootConfig => new githubOptions_1.GitHubOptions(rootConfig, eNpmContributions_1.NpmContributions.Github, 'github')).singleton(),
        // config
        npmConfig: awilix_1.asFunction((rootConfig, npmCachingOpts, npmHttpOpts, npmGitHubOpts) => new npmConfig_1.NpmConfig(rootConfig, npmCachingOpts, npmHttpOpts, npmGitHubOpts)).singleton(),
        // clients
        githubJsonClient: awilix_1.asFunction((npmCachingOpts, npmHttpOpts, logger) => infrastructure_clients_1.createJsonClient({
            caching: npmCachingOpts,
            http: npmHttpOpts
        }, logger.child({ namespace: 'npm request' }))).singleton(),
        githubClient: awilix_1.asFunction((npmConfig, githubJsonClient, logger) => new githubClient_1.GitHubClient(npmConfig, githubJsonClient, logger.child({ namespace: 'npm github' }))).singleton(),
        pacoteClient: awilix_1.asFunction((npmConfig, logger) => new pacoteClient_1.PacoteClient(npmConfig, logger.child({ namespace: 'npm pacote' }))).singleton(),
        npmClient: awilix_1.asFunction((npmConfig, githubClient, pacoteClient, logger) => new npmPackageClient_1.NpmPackageClient(npmConfig, pacoteClient, githubClient, logger.child({ namespace: 'npm client' }))).singleton(),
        // provider
        npmProvider: awilix_1.asFunction((npmClient, logger) => new npmSuggestionProvider_1.NpmSuggestionProvider(npmClient, logger.child({ namespace: 'npm provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.npmProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/npmSuggestionProvider.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/npmSuggestionProvider.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmSuggestionProvider = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const npmUtils_1 = __webpack_require__(/*! ./npmUtils */ "./src/infrastructure.providers/npm/src/npmUtils.ts");
class NpmSuggestionProvider {
    constructor(client, logger) {
        this.client = client;
        this.config = client.config;
        this.logger = logger;
        this.suggestionReplaceFn = npmUtils_1.npmReplaceVersion;
    }
    parseDependencies(packageText) {
        const packageDependencies = core_packages_1.extractPackageDependenciesFromJson(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        if (this.config.github.accessToken &&
            this.config.github.accessToken.length > 0) {
            // defrost github parameters
            this.config.github.defrost();
        }
        const clientData = null;
        return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.client, clientData, packageDependencies);
    }
}
exports.NpmSuggestionProvider = NpmSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/npmUtils.ts":
/*!**********************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/npmUtils.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNpmErrorToResponse = exports.npmReplaceVersion = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
function npmReplaceVersion(packageInfo, newVersion) {
    if (packageInfo.source === core_packages_1.PackageSourceTypes.Github) {
        return replaceGitVersion(packageInfo, newVersion);
    }
    if (packageInfo.type === core_packages_1.PackageVersionTypes.Alias) {
        return replaceAliasVersion(packageInfo, newVersion);
    }
    // fallback to default
    return core_packages_1.VersionHelpers.formatWithExistingLeading(packageInfo.requested.version, newVersion);
}
exports.npmReplaceVersion = npmReplaceVersion;
function replaceGitVersion(packageInfo, newVersion) {
    return packageInfo.requested.version.replace(packageInfo.resolved.version, newVersion);
}
function replaceAliasVersion(packageInfo, newVersion) {
    // preserve the leading symbol from the existing version
    const preservedLeadingVersion = core_packages_1.VersionHelpers.formatWithExistingLeading(packageInfo.requested.version, newVersion);
    return `npm:${packageInfo.resolved.name}@${preservedLeadingVersion}`;
}
function convertNpmErrorToResponse(error, source) {
    return {
        source,
        status: error.code,
        data: error.message,
    };
}
exports.convertNpmErrorToResponse = convertNpmErrorToResponse;


/***/ }),

/***/ "./src/infrastructure.providers/npm/src/options/githubOptions.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.providers/npm/src/options/githubOptions.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubOptions = void 0;
const core_configuration_1 = __webpack_require__(/*! core.configuration */ "./src/core.configuration/index.ts");
const eGitHubContributions_1 = __webpack_require__(/*! ../definitions/eGitHubContributions */ "./src/infrastructure.providers/npm/src/definitions/eGitHubContributions.ts");
class GitHubOptions extends core_configuration_1.OptionsWithFallback {
    constructor(config, section, fallbackSection = null) {
        super(config, section, fallbackSection);
    }
    get accessToken() {
        return this.getOrDefault(eGitHubContributions_1.GitHubContributions.AccessToken, null);
    }
}
exports.GitHubOptions = GitHubOptions;


/***/ }),

/***/ "./src/infrastructure.providers/pub/index.ts":
/*!***************************************************!*\
  !*** ./src/infrastructure.providers/pub/index.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(__webpack_require__(/*! ./src/pubClient */ "./src/infrastructure.providers/pub/src/pubClient.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/pubConfig */ "./src/infrastructure.providers/pub/src/pubConfig.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/pubSuggestionProvider */ "./src/infrastructure.providers/pub/src/pubSuggestionProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/pubUtils */ "./src/infrastructure.providers/pub/src/pubUtils.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/pubContainer */ "./src/infrastructure.providers/pub/src/pubContainer.ts"), exports);


/***/ }),

/***/ "./src/infrastructure.providers/pub/src/definitions/ePubContributions.ts":
/*!*******************************************************************************!*\
  !*** ./src/infrastructure.providers/pub/src/definitions/ePubContributions.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PubContributions = void 0;
var PubContributions;
(function (PubContributions) {
    PubContributions["Caching"] = "pub.caching";
    PubContributions["Http"] = "pub.http";
    PubContributions["DependencyProperties"] = "pub.dependencyProperties";
    PubContributions["ApiUrl"] = "pub.apiUrl";
})(PubContributions = exports.PubContributions || (exports.PubContributions = {}));


/***/ }),

/***/ "./src/infrastructure.providers/pub/src/pubClient.ts":
/*!***********************************************************!*\
  !*** ./src/infrastructure.providers/pub/src/pubClient.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PubClient = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
class PubClient {
    constructor(config, client, logger) {
        this.config = config;
        this.client = client;
        this.logger = logger;
    }
    async fetchPackage(request) {
        const semverSpec = core_packages_1.VersionHelpers.parseSemver(request.package.version);
        const url = `${this.config.apiUrl}api/documentation/${request.package.name}`;
        return this.createRemotePackageDocument(url, request, semverSpec)
            .catch((error) => {
            this.logger.debug("Caught exception from %s: %O", core_packages_1.PackageSourceTypes.Registry, error);
            const suggestion = core_suggestions_1.SuggestionFactory.createFromHttpStatus(error.status);
            if (suggestion != null) {
                return core_packages_1.DocumentFactory.create(core_packages_1.PackageSourceTypes.Registry, request, error, [suggestion]);
            }
            return Promise.reject(error);
        });
    }
    async createRemotePackageDocument(url, request, semverSpec) {
        const query = {};
        const headers = {};
        return this.client.request(core_clients_1.HttpClientRequestMethods.get, url, query, headers)
            .then(function (httpResponse) {
            const packageInfo = httpResponse.data;
            const { providerName } = request;
            const versionRange = semverSpec.rawVersion;
            const requested = request.package;
            const resolved = {
                name: requested.name,
                version: versionRange,
            };
            const response = {
                source: httpResponse.source,
                status: httpResponse.status,
            };
            const rawVersions = core_packages_1.VersionHelpers.extractVersionsFromMap(packageInfo.versions);
            // seperate versions to releases and prereleases
            const { releases, prereleases } = core_packages_1.VersionHelpers.splitReleasesFromArray(rawVersions);
            // analyse suggestions
            const suggestions = core_suggestions_1.SuggestionFactory.createSuggestions(versionRange, releases, prereleases);
            // return PackageDocument
            return {
                providerName,
                source: core_packages_1.PackageSourceTypes.Registry,
                response,
                type: semverSpec.type,
                requested,
                resolved,
                suggestions,
            };
        });
    }
}
exports.PubClient = PubClient;


/***/ }),

/***/ "./src/infrastructure.providers/pub/src/pubConfig.ts":
/*!***********************************************************!*\
  !*** ./src/infrastructure.providers/pub/src/pubConfig.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PubConfig = void 0;
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const ePubContributions_1 = __webpack_require__(/*! ./definitions/ePubContributions */ "./src/infrastructure.providers/pub/src/definitions/ePubContributions.ts");
class PubConfig {
    constructor(config, caching, http) {
        this.providerName = 'pub';
        this.supports = [
            core_providers_1.ProviderSupport.Releases,
            core_providers_1.ProviderSupport.Prereleases,
        ];
        this.fileMatcher = {
            language: "yaml",
            scheme: "file",
            pattern: "**/pubspec.yaml",
        };
        this.config = config;
        this.caching = caching;
        this.http = http;
    }
    get dependencyProperties() {
        return this.config.get(ePubContributions_1.PubContributions.DependencyProperties);
    }
    get apiUrl() {
        return core_clients_1.UrlHelpers.ensureEndSlash(this.config.get(ePubContributions_1.PubContributions.ApiUrl));
    }
}
exports.PubConfig = PubConfig;


/***/ }),

/***/ "./src/infrastructure.providers/pub/src/pubContainer.ts":
/*!**************************************************************!*\
  !*** ./src/infrastructure.providers/pub/src/pubContainer.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_clients_1 = __webpack_require__(/*! infrastructure.clients */ "./src/infrastructure.clients/index.ts");
const ePubContributions_1 = __webpack_require__(/*! ./definitions/ePubContributions */ "./src/infrastructure.providers/pub/src/definitions/ePubContributions.ts");
const pubSuggestionProvider_1 = __webpack_require__(/*! ./pubSuggestionProvider */ "./src/infrastructure.providers/pub/src/pubSuggestionProvider.ts");
const pubConfig_1 = __webpack_require__(/*! ./pubConfig */ "./src/infrastructure.providers/pub/src/pubConfig.ts");
const pubClient_1 = __webpack_require__(/*! ./pubClient */ "./src/infrastructure.providers/pub/src/pubClient.ts");
function configureContainer(container) {
    const containerMap = {
        // options
        pubCachingOpts: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, ePubContributions_1.PubContributions.Caching, 'caching')).singleton(),
        pubHttpOpts: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, ePubContributions_1.PubContributions.Http, 'http')).singleton(),
        // config
        pubConfig: awilix_1.asFunction((rootConfig, pubCachingOpts, pubHttpOpts) => new pubConfig_1.PubConfig(rootConfig, pubCachingOpts, pubHttpOpts)).singleton(),
        // clients
        pubJsonClient: awilix_1.asFunction((pubCachingOpts, pubHttpOpts, logger) => infrastructure_clients_1.createJsonClient({
            caching: pubCachingOpts,
            http: pubHttpOpts
        }, logger.child({ namespace: 'pub request' }))).singleton(),
        pubClient: awilix_1.asFunction((pubConfig, pubJsonClient, logger) => new pubClient_1.PubClient(pubConfig, pubJsonClient, logger.child({ namespace: 'pub client' }))).singleton(),
        // provider
        pubProvider: awilix_1.asFunction((pubClient, logger) => new pubSuggestionProvider_1.PubSuggestionProvider(pubClient, logger.child({ namespace: 'pub provider' }))).singleton(),
    };
    container.register(containerMap);
    return container.cradle.pubProvider;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/infrastructure.providers/pub/src/pubSuggestionProvider.ts":
/*!***********************************************************************!*\
  !*** ./src/infrastructure.providers/pub/src/pubSuggestionProvider.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSuggestionProvider = void 0;
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const pubUtils_1 = __webpack_require__(/*! ./pubUtils */ "./src/infrastructure.providers/pub/src/pubUtils.ts");
class PubSuggestionProvider {
    constructor(client, logger) {
        this.client = client;
        this.config = client.config;
        this.logger = logger;
        this.suggestionReplaceFn = pubUtils_1.pubReplaceVersion;
    }
    parseDependencies(packageText) {
        const packageDependencies = core_packages_1.extractPackageDependenciesFromYaml(packageText, this.config.dependencyProperties);
        return packageDependencies;
    }
    async fetchSuggestions(packagePath, packageDependencies) {
        // this.customReplaceFn = pubReplaceVersion.bind(yamlText);
        const clientData = null;
        return core_packages_1.RequestFactory.executeDependencyRequests(packagePath, this.client, clientData, packageDependencies);
    }
}
exports.PubSuggestionProvider = PubSuggestionProvider;


/***/ }),

/***/ "./src/infrastructure.providers/pub/src/pubUtils.ts":
/*!**********************************************************!*\
  !*** ./src/infrastructure.providers/pub/src/pubUtils.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.pubReplaceVersion = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
function pubReplaceVersion(packageInfo, newVersion) {
    const charAt = this.substr(packageInfo.versionRange.start, 1);
    return core_suggestions_1.defaultReplaceFn(packageInfo, 
    // handle cases with blank entries and # comments
    charAt === '#' ?
        newVersion + ' ' :
        newVersion);
}
exports.pubReplaceVersion = pubReplaceVersion;


/***/ }),

/***/ "./src/presentation.extension/index.ts":
/*!*********************************************!*\
  !*** ./src/presentation.extension/index.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionLensFactory = exports.CommandFactory = exports.CommandHelpers = void 0;
__exportStar(__webpack_require__(/*! ./src/definitions/iContainerMap */ "./src/presentation.extension/src/definitions/iContainerMap.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eIconCommandContributions */ "./src/presentation.extension/src/definitions/eIconCommandContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eStatusesContributions */ "./src/presentation.extension/src/definitions/eStatusesContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eSuggestionCommandContributions */ "./src/presentation.extension/src/definitions/eSuggestionCommandContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eSuggestionContributions */ "./src/presentation.extension/src/definitions/eSuggestionContributions.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/definitions/eSuggestionIndicators */ "./src/presentation.extension/src/definitions/eSuggestionIndicators.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/commands/suggestionCommands */ "./src/presentation.extension/src/commands/suggestionCommands.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/commands/iconCommands */ "./src/presentation.extension/src/commands/iconCommands.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/events/textEditorEvents */ "./src/presentation.extension/src/events/textEditorEvents.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/events/textDocumentEvents */ "./src/presentation.extension/src/events/textDocumentEvents.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/state/contextState */ "./src/presentation.extension/src/state/contextState.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/state/versionLensState */ "./src/presentation.extension/src/state/versionLensState.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/helpers/installedStatusHelpers */ "./src/presentation.extension/src/helpers/installedStatusHelpers.ts"), exports);
exports.CommandHelpers = __webpack_require__(/*! ./src/helpers/commandHelpers */ "./src/presentation.extension/src/helpers/commandHelpers.ts");
__exportStar(__webpack_require__(/*! ./src/versionLensExtension */ "./src/presentation.extension/src/versionLensExtension.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/versionLensContainer */ "./src/presentation.extension/src/versionLensContainer.ts"), exports);
exports.CommandFactory = __webpack_require__(/*! ./src/lenses/suggestionCommandFactory */ "./src/presentation.extension/src/lenses/suggestionCommandFactory.ts");
exports.VersionLensFactory = __webpack_require__(/*! ./src/lenses/versionLensFactory */ "./src/presentation.extension/src/lenses/versionLensFactory.ts");
__exportStar(__webpack_require__(/*! ./src/lenses/versionLensProvider */ "./src/presentation.extension/src/lenses/versionLensProvider.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/lenses/versionLens */ "./src/presentation.extension/src/lenses/versionLens.ts"), exports);


/***/ }),

/***/ "./src/presentation.extension/src/commands/iconCommands.ts":
/*!*****************************************************************!*\
  !*** ./src/presentation.extension/src/commands/iconCommands.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIconCommands = exports.filtersProvidersByFileName = exports.IconCommands = void 0;
// vscode references
const path_1 = __webpack_require__(/*! path */ "path");
const minimatch = __webpack_require__(/*! minimatch */ "minimatch");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
const eIconCommandContributions_1 = __webpack_require__(/*! ../definitions/eIconCommandContributions */ "./src/presentation.extension/src/definitions/eIconCommandContributions.ts");
const InstalledStatusHelpers = __webpack_require__(/*! ../helpers/installedStatusHelpers */ "./src/presentation.extension/src/helpers/installedStatusHelpers.ts");
class IconCommands {
    constructor(state, outputChannel, versionLensProviders) {
        this.state = state;
        this.outputChannel = outputChannel;
        this.versionLensProviders = versionLensProviders;
    }
    onShowError(resourceUri) {
        return Promise.all([
            this.state.providerError.change(false),
            this.state.providerBusy.change(0)
        ])
            .then(_ => {
            this.outputChannel.show();
        });
    }
    onShowVersionLenses(resourceUri) {
        this.state.enabled.change(true)
            .then(_ => {
            this.refreshActiveCodeLenses();
        });
    }
    onHideVersionLenses(resourceUri) {
        this.state.enabled.change(false)
            .then(_ => {
            this.refreshActiveCodeLenses();
        });
    }
    onShowPrereleaseVersions(resourceUri) {
        this.state.prereleasesEnabled.change(true)
            .then(_ => {
            this.refreshActiveCodeLenses();
        });
    }
    onHidePrereleaseVersions(resourceUri) {
        this.state.prereleasesEnabled.change(false)
            .then(_ => {
            this.refreshActiveCodeLenses();
        });
    }
    onShowInstalledStatuses(resourceUri) {
        this.state.installedStatusesEnabled.change(true)
            .then(_ => {
            this.refreshActiveCodeLenses();
        });
    }
    onHideInstalledStatuses(resourceUri) {
        this.state.installedStatusesEnabled.change(false)
            .then(_ => {
            InstalledStatusHelpers.clearDecorations();
        });
    }
    onShowingProgress(resourceUri) { }
    refreshActiveCodeLenses() {
        const { window } = __webpack_require__(/*! vscode */ "vscode");
        const fileName = window.activeTextEditor.document.fileName;
        const providers = filtersProvidersByFileName(fileName, this.versionLensProviders);
        if (!providers)
            return false;
        providers.forEach(provider => {
            provider.reloadCodeLenses();
        });
        return true;
    }
}
exports.IconCommands = IconCommands;
function filtersProvidersByFileName(fileName, providers) {
    const filename = path_1.basename(fileName);
    const filtered = providers.filter(provider => minimatch(filename, provider.config.fileMatcher.pattern));
    if (filtered.length === 0)
        return [];
    return filtered;
}
exports.filtersProvidersByFileName = filtersProvidersByFileName;
function registerIconCommands(state, versionLensProviders, subscriptions, outputChannel, logger) {
    // create the dependency
    const iconCommands = new IconCommands(state, outputChannel, versionLensProviders);
    // register commands with vscode
    subscriptions.push(...presentation_extension_1.CommandHelpers.registerCommands(eIconCommandContributions_1.IconCommandContributions, iconCommands, logger));
    return iconCommands;
}
exports.registerIconCommands = registerIconCommands;


/***/ }),

/***/ "./src/presentation.extension/src/commands/suggestionCommands.ts":
/*!***********************************************************************!*\
  !*** ./src/presentation.extension/src/commands/suggestionCommands.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSuggestionCommands = exports.SuggestionCommands = void 0;
const path_1 = __webpack_require__(/*! path */ "path");
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
const eSuggestionCommandContributions_1 = __webpack_require__(/*! ../definitions/eSuggestionCommandContributions */ "./src/presentation.extension/src/definitions/eSuggestionCommandContributions.ts");
class SuggestionCommands {
    constructor(state, logger) {
        this.state = state;
        this.logger = logger;
    }
    onUpdateDependencyCommand(codeLens, packageVersion) {
        if (codeLens.__replaced)
            return Promise.resolve();
        const edit = new vscode_1.WorkspaceEdit();
        edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);
        return vscode_1.workspace.applyEdit(edit)
            .then(done => codeLens.__replaced = true);
    }
    onLinkCommand(codeLens) {
        if (codeLens.package.source !== core_packages_1.PackageSourceTypes.Directory) {
            this.logger.error("onLinkCommand can only open local directories.\nPackage: %o", codeLens.package);
            return;
        }
        const filePathToOpen = path_1.resolve(path_1.dirname(codeLens.documentUrl.fsPath), codeLens.package.resolved.version);
        vscode_1.env.openExternal(('file:///' + filePathToOpen));
    }
}
exports.SuggestionCommands = SuggestionCommands;
function registerSuggestionCommands(state, subscriptions, logger) {
    // create the dependency
    const suggestionCommands = new SuggestionCommands(state, logger);
    // register commands with vscode
    subscriptions.push(...presentation_extension_1.CommandHelpers.registerCommands(eSuggestionCommandContributions_1.SuggestionCommandContributions, suggestionCommands, logger));
    return suggestionCommands;
}
exports.registerSuggestionCommands = registerSuggestionCommands;


/***/ }),

/***/ "./src/presentation.extension/src/container/registerSuggestionProviders.ts":
/*!*********************************************************************************!*\
  !*** ./src/presentation.extension/src/container/registerSuggestionProviders.ts ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSuggestionProviders = void 0;
async function registerSuggestionProviders(providerNames, container, logger) {
    logger.debug('Registering providers %o', providerNames.join(', '));
    const results = [];
    const promised = providerNames.map(function (providerName) {
        return Promise.resolve().then(() => __webpack_require__("./src/infrastructure.providers sync recursive ^\\.\\/.*\\/index$")(`./${providerName}/index`)).then(function (module) {
            logger.debug('Activating container scope for %s', providerName);
            // create a container scope for the provider
            const scopeContainer = container.createScope();
            const provider = module.configureContainer(scopeContainer);
            // register the provider
            logger.debug("Registered provider for %s:\t file pattern: %s\t caching: %s minutes\t strict ssl: %s", providerName, provider.config.fileMatcher.pattern, provider.config.caching.duration, provider.config.http.strictSSL);
            results.push(provider);
        })
            .catch(error => {
            logger.error('Could not register provider %s. Reason: %O', providerName, error);
        });
    });
    await Promise.all(promised);
    return results;
}
exports.registerSuggestionProviders = registerSuggestionProviders;


/***/ }),

/***/ "./src/presentation.extension/src/container/registerVersionLensProviders.ts":
/*!**********************************************************************************!*\
  !*** ./src/presentation.extension/src/container/registerVersionLensProviders.ts ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVersionLensProviders = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
function registerVersionLensProviders(extension, suggestionProviders, subscriptions, logger) {
    const results = [];
    suggestionProviders.forEach(function (provider) {
        const versionLensProvider = new presentation_extension_1.VersionLensProvider(extension, provider, logger.child({ namespace: `${provider.config.providerName} codelens` }));
        results.push(versionLensProvider);
        // register the codelens provider with vscode
        const sub = vscode_1.languages.registerCodeLensProvider(versionLensProvider.documentSelector, versionLensProvider);
        // give vscode the command disposable
        subscriptions.push(sub);
    });
    return results;
}
exports.registerVersionLensProviders = registerVersionLensProviders;


/***/ }),

/***/ "./src/presentation.extension/src/definitions/eIconCommandContributions.ts":
/*!*********************************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/eIconCommandContributions.ts ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.IconCommandContributions = void 0;
var IconCommandContributions;
(function (IconCommandContributions) {
    IconCommandContributions["ShowError"] = "versionlens.onShowError";
    IconCommandContributions["ShowingProgress"] = "versionlens.onShowingProgress";
    IconCommandContributions["ShowInstalledStatuses"] = "versionlens.onShowInstalledStatuses";
    IconCommandContributions["HideInstalledStatuses"] = "versionlens.onHideInstalledStatuses";
    IconCommandContributions["ShowPrereleaseVersions"] = "versionlens.onShowPrereleaseVersions";
    IconCommandContributions["HidePrereleaseVersions"] = "versionlens.onHidePrereleaseVersions";
    IconCommandContributions["ShowVersionLenses"] = "versionlens.onShowVersionLenses";
    IconCommandContributions["HideVersionLenses"] = "versionlens.onHideVersionLenses";
})(IconCommandContributions = exports.IconCommandContributions || (exports.IconCommandContributions = {}));


/***/ }),

/***/ "./src/presentation.extension/src/definitions/eStateContributions.ts":
/*!***************************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/eStateContributions.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.StateContributions = void 0;
var StateContributions;
(function (StateContributions) {
    StateContributions["Enabled"] = "versionlens.enabled";
    StateContributions["PrereleasesEnabled"] = "versionlens.prereleasesEnabled";
    StateContributions["ProviderActive"] = "versionlens.providerActive";
    StateContributions["ProviderBusy"] = "versionlens.providerBusy";
    StateContributions["ProviderError"] = "versionlens.providerError";
    StateContributions["ProviderSupportsPrereleases"] = "versionlens.providerSupportsPrereleases";
    StateContributions["ProviderSupportsInstalledStatuses"] = "versionlens.providerSupportsInstalledStatuses";
    StateContributions["InstalledStatusesEnabled"] = "versionlens.installedStatusesEnabled";
})(StateContributions = exports.StateContributions || (exports.StateContributions = {}));


/***/ }),

/***/ "./src/presentation.extension/src/definitions/eStatusesContributions.ts":
/*!******************************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/eStatusesContributions.ts ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusesContributions = void 0;
var StatusesContributions;
(function (StatusesContributions) {
    StatusesContributions["ShowOnStartup"] = "statuses.showOnStartup";
    StatusesContributions["NotInstalledColour"] = "statuses.notInstalledColour";
    StatusesContributions["InstalledColour"] = "statuses.installedColour";
    StatusesContributions["OutdatedColour"] = "statuses.outdatedColour";
    StatusesContributions["prereleaseInstalledColour"] = "statuses.prereleaseInstalledColour";
})(StatusesContributions = exports.StatusesContributions || (exports.StatusesContributions = {}));


/***/ }),

/***/ "./src/presentation.extension/src/definitions/eSuggestionCommandContributions.ts":
/*!***************************************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/eSuggestionCommandContributions.ts ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionCommandContributions = void 0;
var SuggestionCommandContributions;
(function (SuggestionCommandContributions) {
    SuggestionCommandContributions["UpdateDependencyCommand"] = "versionlens.onUpdateDependencyCommand";
    SuggestionCommandContributions["LinkCommand"] = "versionlens.onLinkCommand";
})(SuggestionCommandContributions = exports.SuggestionCommandContributions || (exports.SuggestionCommandContributions = {}));


/***/ }),

/***/ "./src/presentation.extension/src/definitions/eSuggestionContributions.ts":
/*!********************************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/eSuggestionContributions.ts ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionContributions = void 0;
var SuggestionContributions;
(function (SuggestionContributions) {
    // DefaultVersionPrefix = 'versionlens.suggestions.defaultVersionPrefix',
    SuggestionContributions["ShowOnStartup"] = "suggestions.showOnStartup";
    SuggestionContributions["ShowPrereleasesOnStartup"] = "suggestions.showPrereleasesOnStartup";
})(SuggestionContributions = exports.SuggestionContributions || (exports.SuggestionContributions = {}));


/***/ }),

/***/ "./src/presentation.extension/src/definitions/eSuggestionIndicators.ts":
/*!*****************************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/eSuggestionIndicators.ts ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionIndicators = void 0;
var SuggestionIndicators;
(function (SuggestionIndicators) {
    SuggestionIndicators["Update"] = "\u2191";
    SuggestionIndicators["Revert"] = "\u2193";
    SuggestionIndicators["OpenNewWindow"] = "\u29C9";
})(SuggestionIndicators = exports.SuggestionIndicators || (exports.SuggestionIndicators = {}));


/***/ }),

/***/ "./src/presentation.extension/src/definitions/iContainerMap.ts":
/*!*********************************************************************!*\
  !*** ./src/presentation.extension/src/definitions/iContainerMap.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ "./src/presentation.extension/src/events/textDocumentEvents.ts":
/*!*********************************************************************!*\
  !*** ./src/presentation.extension/src/events/textDocumentEvents.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TextDocumentEvents = void 0;
const InstalledStatusHelpers = __webpack_require__(/*! ../helpers/installedStatusHelpers */ "./src/presentation.extension/src/helpers/installedStatusHelpers.ts");
class TextDocumentEvents {
    constructor(extensionState, logger) {
        this.state = extensionState;
        this.logger = logger;
        // register editor events
        const { workspace } = __webpack_require__(/*! vscode */ "vscode");
        // register window and workspace events
        workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this));
    }
    onDidChangeTextDocument(changeEvent) {
        // ensure version lens is active
        if (this.state.providerActive.value === false)
            return;
        const foundDecorations = [];
        const { contentChanges } = changeEvent;
        // get all decorations for all the lines that have changed
        contentChanges.forEach(change => {
            const startLine = change.range.start.line;
            let endLine = change.range.end.line;
            if (change.text.charAt(0) == '\n' || endLine > startLine) {
                InstalledStatusHelpers.removeDecorationsFromLine(startLine);
                return;
            }
            for (let line = startLine; line <= endLine; line++) {
                const lineDecorations = InstalledStatusHelpers.getDecorationsByLine(line);
                if (lineDecorations.length > 0)
                    foundDecorations.push(...lineDecorations);
            }
        });
        if (foundDecorations.length === 0)
            return;
        // remove all decorations that have changed
        InstalledStatusHelpers.removeDecorations(foundDecorations);
    }
}
exports.TextDocumentEvents = TextDocumentEvents;


/***/ }),

/***/ "./src/presentation.extension/src/events/textEditorEvents.ts":
/*!*******************************************************************!*\
  !*** ./src/presentation.extension/src/events/textEditorEvents.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditorEvents = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const core_providers_1 = __webpack_require__(/*! core.providers */ "./src/core.providers/index.ts");
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
class TextEditorEvents {
    constructor(state, suggestionProviders, loggerTransport) {
        this.state = state;
        this.suggestionProviders = suggestionProviders;
        this.loggerTransport = loggerTransport;
        // register editor events
        vscode_1.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this));
    }
    onDidChangeActiveTextEditor(textEditor) {
        // maintain versionLens.providerActive state
        // each time the active editor changes
        if (!textEditor) {
            // disable icons when no editor
            this.state.providerActive.value = false;
            return;
        }
        if (textEditor.document.uri.scheme !== 'file')
            return;
        const providersMatchingFilename = core_suggestions_1.filtersProvidersByFileName(textEditor.document.fileName, this.suggestionProviders);
        if (providersMatchingFilename.length === 0) {
            // disable icons if no match found
            this.state.providerActive.value = false;
            return;
        }
        // ensure the latest logging level is set
        this.loggerTransport.updateLevel();
        // determine prerelease support
        const providerSupportsPrereleases = providersMatchingFilename.reduce((v, p) => p.config.supports.includes(core_providers_1.ProviderSupport.Prereleases), false);
        // determine installed statuses support
        const providerSupportsInstalledStatuses = providersMatchingFilename.reduce((v, p) => p.config.supports.includes(core_providers_1.ProviderSupport.InstalledStatuses), false);
        this.state.providerSupportsPrereleases.value = providerSupportsPrereleases;
        this.state.providerSupportsInstalledStatuses.value = providerSupportsInstalledStatuses;
        this.state.providerActive.value = true;
    }
}
exports.TextEditorEvents = TextEditorEvents;


/***/ }),

/***/ "./src/presentation.extension/src/helpers/commandHelpers.ts":
/*!******************************************************************!*\
  !*** ./src/presentation.extension/src/helpers/commandHelpers.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
function registerCommands(contributions, handlers, logger) {
    const { commands } = __webpack_require__(/*! vscode */ "vscode");
    const disposables = [];
    // loop enum keys
    Object.keys(contributions)
        .forEach(enumKey => {
        // register command
        const command = contributions[enumKey];
        const handler = handlers[`on${enumKey}`];
        if (!handler) {
            // todo roll up errors to a semantic factory
            const msg = `Could not find %s handler on %s class`;
            logger.error(msg, command, handler.name);
            // just return here?
            throw new Error(`Could not find ${command} handler on ${handler.name} class`);
        }
        // collect disposables
        disposables.push(commands.registerCommand(command, handler.bind(handlers)));
    });
    return disposables;
}
exports.registerCommands = registerCommands;


/***/ }),

/***/ "./src/presentation.extension/src/helpers/installedStatusHelpers.ts":
/*!**************************************************************************!*\
  !*** ./src/presentation.extension/src/helpers/installedStatusHelpers.ts ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPrereleaseInstalledDecoration = exports.renderOutdatedDecoration = exports.renderNeedsUpdateDecoration = exports.renderInstalledDecoration = exports.renderMissingDecoration = exports.createRenderOptions = exports.getDecorationsByLine = exports.removeDecorationsFromLine = exports.removeDecorations = exports.setDecorations = exports.clearDecorations = void 0;
// vscode references
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
let _decorations = [];
const _decorationTypeKey = vscode_1.window.createTextEditorDecorationType({});
function clearDecorations() {
    if (!vscode_1.window || !vscode_1.window.activeTextEditor)
        return;
    _decorations = [];
    vscode_1.window.activeTextEditor.setDecorations(_decorationTypeKey, []);
}
exports.clearDecorations = clearDecorations;
function setDecorations(decorationList) {
    if (!vscode_1.window || !vscode_1.window.activeTextEditor)
        return;
    vscode_1.window.activeTextEditor.setDecorations(_decorationTypeKey, decorationList);
}
exports.setDecorations = setDecorations;
function removeDecorations(removeDecorationList) {
    if (removeDecorationList.length === 0 || _decorations.length === 0)
        return;
    const newDecorations = [];
    for (let i = 0; i < _decorations.length; i++) {
        const foundIndex = removeDecorationList.indexOf(_decorations[i]);
        if (foundIndex === -1)
            newDecorations.push(_decorations[i]);
    }
    _decorations = newDecorations;
    vscode_1.window.activeTextEditor.setDecorations(_decorationTypeKey, _decorations);
}
exports.removeDecorations = removeDecorations;
function removeDecorationsFromLine(lineNum) {
    const results = [];
    for (let i = 0; i < _decorations.length; i++) {
        const entry = _decorations[i];
        if (entry.range.start.line >= lineNum) {
            results.push(entry);
        }
    }
    removeDecorations(results);
}
exports.removeDecorationsFromLine = removeDecorationsFromLine;
function getDecorationsByLine(lineToFilterBy) {
    const results = [];
    for (let i = 0; i < _decorations.length; i++) {
        const entry = _decorations[i];
        if (entry.range.start.line === lineToFilterBy) {
            results.push(entry);
        }
    }
    return results;
}
exports.getDecorationsByLine = getDecorationsByLine;
function createRenderOptions(contentText, color) {
    return {
        contentText,
        color
    };
}
exports.createRenderOptions = createRenderOptions;
function renderMissingDecoration(range, missingStatusColour) {
    updateDecoration({
        range: new vscode_1.Range(range.start, new vscode_1.Position(range.end.line, range.end.character + 1)),
        hoverMessage: null,
        renderOptions: {
            after: createRenderOptions(' ▪ missing install', missingStatusColour)
        }
    });
}
exports.renderMissingDecoration = renderMissingDecoration;
function renderInstalledDecoration(range, version, installedStatusColour) {
    updateDecoration({
        range: new vscode_1.Range(range.start, new vscode_1.Position(range.end.line, range.end.character + 1)),
        hoverMessage: null,
        renderOptions: {
            after: createRenderOptions(` ▪ ${version} installed`, installedStatusColour)
        }
    });
}
exports.renderInstalledDecoration = renderInstalledDecoration;
function renderNeedsUpdateDecoration(range, version, outdatedStatusColour) {
    updateDecoration({
        range: new vscode_1.Range(range.start, new vscode_1.Position(range.end.line, range.end.character + 1)),
        hoverMessage: null,
        renderOptions: {
            after: createRenderOptions(` ▪ ${version} installed, npm update needed`, outdatedStatusColour)
        }
    });
}
exports.renderNeedsUpdateDecoration = renderNeedsUpdateDecoration;
function renderOutdatedDecoration(range, version, outdatedStatusColour) {
    updateDecoration({
        range: new vscode_1.Range(range.start, new vscode_1.Position(range.end.line, range.end.character + 1)),
        hoverMessage: null,
        renderOptions: {
            after: createRenderOptions(` ▪ ${version} installed`, outdatedStatusColour)
        }
    });
}
exports.renderOutdatedDecoration = renderOutdatedDecoration;
function renderPrereleaseInstalledDecoration(range, version, prereleaseInstalledStatusColour) {
    updateDecoration({
        range: new vscode_1.Range(range.start, new vscode_1.Position(range.end.line, range.end.character + 1)),
        hoverMessage: null,
        renderOptions: {
            after: createRenderOptions(` ▪ ${version} prerelease installed`, prereleaseInstalledStatusColour)
        }
    });
}
exports.renderPrereleaseInstalledDecoration = renderPrereleaseInstalledDecoration;
function updateDecoration(newDecoration) {
    const foundIndex = _decorations.findIndex(entry => entry.range.start.line === newDecoration.range.start.line);
    if (foundIndex > -1)
        _decorations[foundIndex] = newDecoration;
    else
        _decorations.push(newDecoration);
    setDecorations(_decorations);
}


/***/ }),

/***/ "./src/presentation.extension/src/lenses/suggestionCommandFactory.ts":
/*!***************************************************************************!*\
  !*** ./src/presentation.extension/src/lenses/suggestionCommandFactory.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuggestedVersionCommand = exports.createDirectoryLinkCommand = exports.createTagCommand = exports.createErrorCommand = void 0;
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
function createErrorCommand(errorMsg, codeLens) {
    return codeLens.setCommand(`${errorMsg}`);
}
exports.createErrorCommand = createErrorCommand;
function createTagCommand(tag, codeLens) {
    return codeLens.setCommand(tag);
}
exports.createTagCommand = createTagCommand;
function createDirectoryLinkCommand(codeLens) {
    let title;
    let cmd = presentation_extension_1.SuggestionCommandContributions.LinkCommand;
    const path = __webpack_require__(/*! path */ "path");
    const fs = __webpack_require__(/*! fs */ "fs");
    const filePath = path.resolve(path.dirname(codeLens.documentUrl.fsPath), codeLens.package.suggestion.version);
    const fileExists = fs.existsSync(filePath);
    if (fileExists === false)
        title = (cmd = null) || 'Specified resource does not exist';
    else
        title = `${presentation_extension_1.SuggestionIndicators.OpenNewWindow} ${codeLens.package.requested.version}`;
    return codeLens.setCommand(title, cmd, [codeLens]);
}
exports.createDirectoryLinkCommand = createDirectoryLinkCommand;
function createSuggestedVersionCommand(codeLens) {
    const { name, version, flags } = codeLens.package.suggestion;
    const isStatus = (flags & core_suggestions_1.SuggestionFlags.status);
    const isTag = (flags & core_suggestions_1.SuggestionFlags.tag);
    const isPrerelease = flags & core_suggestions_1.SuggestionFlags.prerelease;
    if (!isStatus) {
        const replaceWithVersion = isPrerelease || isTag ?
            version :
            codeLens.replaceVersionFn(codeLens.package, version);
        const prefix = isTag ? '' : name + ': ';
        return codeLens.setCommand(`${prefix}${presentation_extension_1.SuggestionIndicators.Update} ${version}`, presentation_extension_1.SuggestionCommandContributions.UpdateDependencyCommand, [codeLens, `${replaceWithVersion}`]);
    }
    // show the status
    return createTagCommand(`${name} ${version}`.trimEnd(), codeLens);
}
exports.createSuggestedVersionCommand = createSuggestedVersionCommand;


/***/ }),

/***/ "./src/presentation.extension/src/lenses/versionLens.ts":
/*!**************************************************************!*\
  !*** ./src/presentation.extension/src/lenses/versionLens.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionLens = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
class VersionLens extends vscode_1.CodeLens {
    constructor(commandRange, replaceRange, packageResponse, documentUrl, replaceVersionFn) {
        super(commandRange);
        this.replaceRange = replaceRange || commandRange;
        this.package = packageResponse;
        this.documentUrl = documentUrl;
        this.command = null;
        this.replaceVersionFn = replaceVersionFn;
    }
    hasPackageSource(source) {
        return this.package.source === source;
    }
    hasPackageError(error) {
        return this.package.error == error;
    }
    setCommand(title, command, args) {
        this.command = {
            title,
            command,
            arguments: args
        };
        return this;
    }
}
exports.VersionLens = VersionLens;


/***/ }),

/***/ "./src/presentation.extension/src/lenses/versionLensFactory.ts":
/*!*********************************************************************!*\
  !*** ./src/presentation.extension/src/lenses/versionLensFactory.ts ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createFromPackageResponses = void 0;
const versionLens_1 = __webpack_require__(/*! ./versionLens */ "./src/presentation.extension/src/lenses/versionLens.ts");
function createFromPackageResponses(document, responses, replaceVersionFn) {
    return responses.map(function (response) {
        return createFromPackageResponse(response, document, replaceVersionFn);
    });
}
exports.createFromPackageResponses = createFromPackageResponses;
function createFromPackageResponse(packageResponse, document, replaceVersionFn) {
    const { Uri, Range } = __webpack_require__(/*! vscode */ "vscode");
    const { nameRange, versionRange } = packageResponse;
    const commandRangePos = nameRange.start + packageResponse.order;
    const commandRange = new Range(document.positionAt(commandRangePos), document.positionAt(commandRangePos));
    const replaceRange = new Range(document.positionAt(versionRange.start), document.positionAt(versionRange.end));
    return new versionLens_1.VersionLens(commandRange, replaceRange, packageResponse, Uri.file(document.fileName), replaceVersionFn.bind(document.getText()));
}


/***/ }),

/***/ "./src/presentation.extension/src/lenses/versionLensProvider.ts":
/*!**********************************************************************!*\
  !*** ./src/presentation.extension/src/lenses/versionLensProvider.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionLensProvider = void 0;
const path_1 = __webpack_require__(/*! path */ "path");
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const core_suggestions_1 = __webpack_require__(/*! core.suggestions */ "./src/core.suggestions/index.ts");
const core_packages_1 = __webpack_require__(/*! core.packages */ "./src/core.packages/index.ts");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
class VersionLensProvider {
    constructor(extension, suggestionProvider, logger) {
        this.extension = extension;
        this.suggestionProvider = suggestionProvider;
        this.logger = logger;
        this.notifyCodeLensesChanged = new vscode_1.EventEmitter();
        this.onDidChangeCodeLenses = this.notifyCodeLensesChanged.event;
    }
    get config() {
        return this.suggestionProvider.config;
    }
    get state() {
        return this.extension.state;
    }
    get documentSelector() {
        return this.suggestionProvider.config.fileMatcher;
    }
    reloadCodeLenses() {
        this.notifyCodeLensesChanged.fire();
    }
    provideCodeLenses(document, token) {
        if (this.state.enabled.value === false)
            return null;
        // package path
        const packagePath = path_1.dirname(document.uri.fsPath);
        // clear any errors
        this.state.providerError.value = false;
        // set in progress
        this.state.providerBusy.value++;
        this.logger.info("Analysing %s dependencies in %s", this.config.providerName, document.uri.fsPath);
        // unfreeze config per file request
        this.config.caching.defrost();
        this.logger.debug("Caching duration is set to %s milliseconds", this.config.caching.duration);
        // get the dependencies
        const packageDeps = this.suggestionProvider.parseDependencies(document.getText());
        // fetch suggestions
        return this.suggestionProvider.fetchSuggestions(packagePath, packageDeps)
            .then(responses => {
            this.state.providerBusy.value--;
            if (responses === null) {
                this.logger.info("No %s dependencies found in %s", this.config.providerName, document.uri.fsPath);
                return null;
            }
            this.logger.info("Resolved %s %s dependencies", responses.length, this.config.providerName);
            if (this.state.prereleasesEnabled.value === false) {
                responses = responses.filter(function (response) {
                    const { suggestion } = response;
                    return (suggestion.flags & core_suggestions_1.SuggestionFlags.prerelease) === 0 ||
                        suggestion.name.includes(core_suggestions_1.SuggestionStatus.LatestIsPrerelease);
                });
            }
            return presentation_extension_1.VersionLensFactory.createFromPackageResponses(document, responses, this.suggestionProvider.suggestionReplaceFn || core_suggestions_1.defaultReplaceFn);
        })
            .catch(error => {
            this.state.providerError.value = true;
            this.state.providerBusy.change(0);
            return Promise.reject(error);
        });
    }
    async resolveCodeLens(codeLens, token) {
        if (codeLens instanceof presentation_extension_1.VersionLens) {
            // evaluate the code lens
            const evaluated = this.evaluateCodeLens(codeLens, token);
            // update the progress
            return Promise.resolve(evaluated);
        }
    }
    evaluateCodeLens(codeLens, token) {
        if (codeLens.hasPackageSource(core_packages_1.PackageSourceTypes.Directory))
            return presentation_extension_1.CommandFactory.createDirectoryLinkCommand(codeLens);
        return presentation_extension_1.CommandFactory.createSuggestedVersionCommand(codeLens);
    }
}
exports.VersionLensProvider = VersionLensProvider;


/***/ }),

/***/ "./src/presentation.extension/src/options/statusesOptions.ts":
/*!*******************************************************************!*\
  !*** ./src/presentation.extension/src/options/statusesOptions.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusesOptions = void 0;
const eStatusesContributions_1 = __webpack_require__(/*! ../definitions/eStatusesContributions */ "./src/presentation.extension/src/definitions/eStatusesContributions.ts");
class StatusesOptions {
    constructor(config) {
        this.config = config;
    }
    get showOnStartup() {
        return this.config.get(eStatusesContributions_1.StatusesContributions.ShowOnStartup);
    }
    get installedColour() {
        return this.config.get(eStatusesContributions_1.StatusesContributions.InstalledColour);
    }
    get notInstalledColour() {
        return this.config.get(eStatusesContributions_1.StatusesContributions.NotInstalledColour);
    }
    get outdatedColour() {
        return this.config.get(eStatusesContributions_1.StatusesContributions.OutdatedColour);
    }
    get prereleaseInstalledColour() {
        return this.config.get(eStatusesContributions_1.StatusesContributions.prereleaseInstalledColour);
    }
}
exports.StatusesOptions = StatusesOptions;


/***/ }),

/***/ "./src/presentation.extension/src/options/suggestionsOptions.ts":
/*!**********************************************************************!*\
  !*** ./src/presentation.extension/src/options/suggestionsOptions.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionsOptions = void 0;
const eSuggestionContributions_1 = __webpack_require__(/*! ../definitions/eSuggestionContributions */ "./src/presentation.extension/src/definitions/eSuggestionContributions.ts");
class SuggestionsOptions {
    constructor(config) {
        this.config = config;
    }
    get showOnStartup() {
        return this.config.get(eSuggestionContributions_1.SuggestionContributions.ShowOnStartup);
    }
    get showPrereleasesOnStartup() {
        return this.config.get(eSuggestionContributions_1.SuggestionContributions.ShowPrereleasesOnStartup);
    }
}
exports.SuggestionsOptions = SuggestionsOptions;


/***/ }),

/***/ "./src/presentation.extension/src/state/contextState.ts":
/*!**************************************************************!*\
  !*** ./src/presentation.extension/src/state/contextState.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextState = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
class ContextState {
    constructor(key, defaultValue) {
        this.key = key;
        this.change(defaultValue);
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        this.change(newValue);
    }
    change(newValue) {
        this._value = newValue;
        return vscode_1.commands.executeCommand('setContext', this.key, newValue);
    }
}
exports.ContextState = ContextState;


/***/ }),

/***/ "./src/presentation.extension/src/state/versionLensState.ts":
/*!******************************************************************!*\
  !*** ./src/presentation.extension/src/state/versionLensState.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionLensState = void 0;
const eStateContributions_1 = __webpack_require__(/*! ../definitions/eStateContributions */ "./src/presentation.extension/src/definitions/eStateContributions.ts");
const contextState_1 = __webpack_require__(/*! ./contextState */ "./src/presentation.extension/src/state/contextState.ts");
class VersionLensState {
    constructor(extension) {
        this.enabled = new contextState_1.ContextState(eStateContributions_1.StateContributions.Enabled, extension.suggestions.showOnStartup);
        this.prereleasesEnabled = new contextState_1.ContextState(eStateContributions_1.StateContributions.PrereleasesEnabled, extension.suggestions.showPrereleasesOnStartup);
        this.installedStatusesEnabled = new contextState_1.ContextState(eStateContributions_1.StateContributions.InstalledStatusesEnabled, extension.statuses.showOnStartup);
        this.providerActive = new contextState_1.ContextState(eStateContributions_1.StateContributions.ProviderActive, false);
        this.providerBusy = new contextState_1.ContextState(eStateContributions_1.StateContributions.ProviderBusy, 0);
        this.providerError = new contextState_1.ContextState(eStateContributions_1.StateContributions.ProviderError, false);
        this.providerSupportsPrereleases = new contextState_1.ContextState(eStateContributions_1.StateContributions.ProviderSupportsPrereleases, false);
        this.providerSupportsInstalledStatuses = new contextState_1.ContextState(eStateContributions_1.StateContributions.ProviderSupportsInstalledStatuses, false);
    }
}
exports.VersionLensState = VersionLensState;


/***/ }),

/***/ "./src/presentation.extension/src/versionLensContainer.ts":
/*!****************************************************************!*\
  !*** ./src/presentation.extension/src/versionLensContainer.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContainer = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const awilix_1 = __webpack_require__(/*! awilix */ "awilix");
const core_logging_1 = __webpack_require__(/*! core.logging */ "./src/core.logging/index.ts");
const core_clients_1 = __webpack_require__(/*! core.clients */ "./src/core.clients/index.ts");
const infrastructure_configuration_1 = __webpack_require__(/*! infrastructure.configuration */ "./src/infrastructure.configuration/index.ts");
const infrastructure_logging_1 = __webpack_require__(/*! infrastructure.logging */ "./src/infrastructure.logging/index.ts");
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
const registerSuggestionProviders_1 = __webpack_require__(/*! ./container/registerSuggestionProviders */ "./src/presentation.extension/src/container/registerSuggestionProviders.ts");
const registerVersionLensProviders_1 = __webpack_require__(/*! ./container/registerVersionLensProviders */ "./src/presentation.extension/src/container/registerVersionLensProviders.ts");
async function configureContainer(context) {
    const container = awilix_1.createContainer({
        injectionMode: awilix_1.InjectionMode.CLASSIC
    });
    const containerMap = {
        extensionName: awilix_1.asValue(presentation_extension_1.VersionLensExtension.extensionName),
        // maps to the vscode configuration
        rootConfig: awilix_1.asFunction(extensionName => new infrastructure_configuration_1.VsCodeConfig(vscode_1.workspace, extensionName.toLowerCase())).singleton(),
        // logging options
        loggingOptions: awilix_1.asFunction(rootConfig => new core_logging_1.LoggingOptions(rootConfig, 'logging')).singleton(),
        httpOptions: awilix_1.asFunction(rootConfig => new core_clients_1.HttpOptions(rootConfig, 'http')).singleton(),
        cachingOptions: awilix_1.asFunction(rootConfig => new core_clients_1.CachingOptions(rootConfig, 'caching')).singleton(),
        // logging
        outputChannel: awilix_1.asFunction(extensionName => vscode_1.window.createOutputChannel(extensionName)).singleton(),
        outputChannelTransport: awilix_1.asFunction((outputChannel, loggingOptions) => new infrastructure_logging_1.OutputChannelTransport(outputChannel, loggingOptions)).singleton(),
        logger: awilix_1.asFunction((outputChannelTransport) => infrastructure_logging_1.createWinstonLogger(outputChannelTransport, { namespace: 'extension' })).singleton(),
        // extension
        extension: awilix_1.asFunction(rootConfig => new presentation_extension_1.VersionLensExtension(rootConfig)).singleton(),
        // commands
        subscriptions: awilix_1.asValue(context.subscriptions),
        iconCommands: awilix_1.asFunction((extension, versionLensProviders, subscriptions, outputChannel, logger) => presentation_extension_1.registerIconCommands(extension.state, versionLensProviders, subscriptions, outputChannel, logger.child({ namespace: 'icon commands' }))).singleton(),
        suggestionCommands: awilix_1.asFunction((extension, subscriptions, logger) => presentation_extension_1.registerSuggestionCommands(extension.state, subscriptions, logger.child({ namespace: 'suggestion commands' }))).singleton(),
        // events
        textEditorEvents: awilix_1.asFunction((extension, suggestionProviders, outputChannelTransport) => new presentation_extension_1.TextEditorEvents(extension.state, suggestionProviders, outputChannelTransport)).singleton(),
        // codelens providers
        providerNames: awilix_1.asValue([
            'composer',
            'dotnet',
            'dub',
            'jspm',
            'maven',
            'npm',
            'pub',
        ]),
        versionLensProviders: awilix_1.asFunction((extension, suggestionProviders, subscriptions, logger) => registerVersionLensProviders_1.registerVersionLensProviders(extension, suggestionProviders, subscriptions, logger))
    };
    // register the map
    container.register(containerMap);
    // generate the provider registry async
    const { logger, providerNames } = container.cradle;
    const suggestionProviders = await registerSuggestionProviders_1.registerSuggestionProviders(providerNames, container, logger.child({ namespace: 'registry' }));
    // add the registry in to the container
    container.register({
        suggestionProviders: awilix_1.asValue(suggestionProviders)
    });
    return container;
}
exports.configureContainer = configureContainer;


/***/ }),

/***/ "./src/presentation.extension/src/versionLensExtension.ts":
/*!****************************************************************!*\
  !*** ./src/presentation.extension/src/versionLensExtension.ts ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionLensExtension = void 0;
const presentation_extension_1 = __webpack_require__(/*! presentation.extension */ "./src/presentation.extension/index.ts");
const suggestionsOptions_1 = __webpack_require__(/*! ./options/suggestionsOptions */ "./src/presentation.extension/src/options/suggestionsOptions.ts");
const statusesOptions_1 = __webpack_require__(/*! ./options/statusesOptions */ "./src/presentation.extension/src/options/statusesOptions.ts");
class VersionLensExtension {
    constructor(rootConfig) {
        this.config = rootConfig;
        this.suggestions = new suggestionsOptions_1.SuggestionsOptions(rootConfig);
        this.statuses = new statusesOptions_1.StatusesOptions(rootConfig);
        // instantiate setContext options
        this.state = new presentation_extension_1.VersionLensState(this);
    }
}
exports.VersionLensExtension = VersionLensExtension;
VersionLensExtension.extensionName = 'VersionLens';


/***/ }),

/***/ "@npmcli/promise-spawn":
/*!****************************************!*\
  !*** external "@npmcli/promise-spawn" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@npmcli/promise-spawn");

/***/ }),

/***/ "awilix":
/*!*************************!*\
  !*** external "awilix" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("awilix");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "jsonc-parser":
/*!*******************************!*\
  !*** external "jsonc-parser" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jsonc-parser");

/***/ }),

/***/ "libnpmconfig":
/*!*******************************!*\
  !*** external "libnpmconfig" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("libnpmconfig");

/***/ }),

/***/ "minimatch":
/*!****************************!*\
  !*** external "minimatch" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("minimatch");

/***/ }),

/***/ "npm-package-arg":
/*!**********************************!*\
  !*** external "npm-package-arg" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("npm-package-arg");

/***/ }),

/***/ "pacote":
/*!*************************!*\
  !*** external "pacote" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("pacote");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "request-light":
/*!********************************!*\
  !*** external "request-light" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("request-light");

/***/ }),

/***/ "semver":
/*!*************************!*\
  !*** external "semver" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("semver");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ }),

/***/ "xmldoc":
/*!*************************!*\
  !*** external "xmldoc" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("xmldoc");

/***/ }),

/***/ "yaml":
/*!***********************!*\
  !*** external "yaml" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("yaml");

/***/ })

/******/ });
//# sourceMappingURL=extension.bundle.js.map