"use strict";
/* istanbul ignore file */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = void 0;
var axios_1 = __importDefault(require("axios"));
var js_sha512_1 = require("js-sha512");
var config_1 = __importDefault(require("@exmpl/config"));
var logger_1 = __importDefault(require("@exmpl/utils/logger"));
var console = logger_1.default;
// declare module 'axios' {
//     interface AxiosRequestConfig {
//         urlParams?: Record<string, string>;
//     }
// }
/* Basic example of saving cookie using axios in node.js and session's recreation after expiration.
 * We have to getting/saving cookie manually because WithCredential axios param use XHR and doesn't work in node.js
 * Also, this example supports parallel request and send only one create session request.
 * */
var BASE_URL = "https://api.performfeeds.com";
// Init instance of axios which works with BASE_URL
exports.axiosInstance = axios_1.default.create({ baseURL: BASE_URL });
var createSession = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tokenDT, authN, params, data, resp, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.info("create session");
                tokenDT = Date.now();
                authN = js_sha512_1.sha512(config_1.default.outletAuthKey + tokenDT + config_1.default.outletAuthSecret);
                params = {
                    scope: 'b2b-feeds-auth',
                    grant_type: 'client_credentials'
                };
                data = Object.keys(params)
                    // @ts-ignore
                    .map(function (key) { return key + "=" + encodeURIComponent(params[key]); })
                    .join('&');
                return [4 /*yield*/, axios_1.default.post("https://api.performfeeds.com/oauth/token/" + config_1.default.outletAuthKey + "?_rt=b&_fmt=json", data, {
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            Authorization: "Basic " + authN,
                            Timestamp: tokenDT
                        },
                    })];
            case 1:
                resp = _a.sent();
                token = resp.data.access_token;
                exports.axiosInstance.defaults.headers.Authorization = "Bearer " + token; // attaching cookie to axiosInstance for future requests
                return [2 /*return*/, token]; // return Promise<cookie> because func is async
        }
    });
}); };
var isGetActiveSessionRequest = false;
var requestQueue = [];
var callRequestsFromQueue = function (token) {
    requestQueue.forEach(function (sub) { return sub(token); });
};
var addRequestToQueue = function (sub) {
    requestQueue.push(sub);
};
var clearQueue = function () {
    requestQueue = [];
};
// registering axios interceptor which handle response's errors
exports.axiosInstance.interceptors.response.use(undefined, function (error) {
    console.error(error.message); //logging here
    var _a = error.response, response = _a === void 0 ? {} : _a, sourceConfig = error.config;
    // checking if request failed cause Unauthorized
    if (response.status === 403) {
        // if this request is first we set isGetActiveSessionRequest flag to true and run createSession
        if (!isGetActiveSessionRequest) {
            isGetActiveSessionRequest = true;
            createSession().then(function (token) {
                // when createSession resolve with token value we run all request from queue with new token
                isGetActiveSessionRequest = false;
                callRequestsFromQueue(token);
                clearQueue(); // and clean queue
            }).catch(function (e) {
                isGetActiveSessionRequest = false; // Very important!
                console.error('Create session error %s', e.message);
                clearQueue();
            });
        }
        // and while isGetActiveSessionRequest equal true we create and return new promise
        var retryRequest = new Promise(function (resolve) {
            // we push new function to queue
            addRequestToQueue(function (token) {
                // function takes one param 'cookie'
                console.info("Retry with new session context %s request to %s", sourceConfig.method, sourceConfig.url);
                sourceConfig.headers.Authorization = "Bearer " + token; // setting cookie to header
                resolve(axios_1.default(sourceConfig)); // and resolve promise with axios request by old config with cookie
                // we resolve exactly axios request - NOT axiosInstance's request because it could call recursion
            });
        });
        return retryRequest;
    }
    else {
        // if error is not related with Unauthorized we just reject promise
        return Promise.reject(error);
    }
});
exports.default = exports.axiosInstance;
