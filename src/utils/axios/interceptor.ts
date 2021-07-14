/* istanbul ignore file */

import axios from 'axios';
import { sha512 } from 'js-sha512';
import config from '@exmpl/config'

import logger from '@exmpl/utils/logger'
const console = logger;

// declare module 'axios' {
//     interface AxiosRequestConfig {
//         urlParams?: Record<string, string>;
//     }
// }

/* Basic example of saving cookie using axios in node.js and session's recreation after expiration.
 * We have to getting/saving cookie manually because WithCredential axios param use XHR and doesn't work in node.js
 * Also, this example supports parallel request and send only one create session request.
 * */

const BASE_URL = "https://api.performfeeds.com";

// Init instance of axios which works with BASE_URL
export const axiosInstance = axios.create({ baseURL: BASE_URL });

const createSession = async () => {
    console.info("create session");
    const tokenDT = Date.now()
    const authN = sha512(config.outletAuthKey + tokenDT + config.outletAuthSecret)

    const params = {
        scope: 'b2b-feeds-auth',
        grant_type: 'client_credentials'
    };

    const data = Object.keys(params)
        // @ts-ignore
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    const resp = await axios.post(`https://api.performfeeds.com/oauth/token/${config.outletAuthKey}?_rt=b&_fmt=json`, data, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${authN}`,
            Timestamp: tokenDT
        },
    })
    const token = resp.data.access_token; // getting cookie from request
    axiosInstance.defaults.headers.Authorization = `Bearer ${token}`; // attaching cookie to axiosInstance for future requests
    return token; // return Promise<cookie> because func is async
};

let isGetActiveSessionRequest = false;
let requestQueue: any[] = [];

const callRequestsFromQueue = (token: string) => {
    requestQueue.forEach(sub => sub(token));
};
const addRequestToQueue = (sub: (token: string) => void) => {
    requestQueue.push(sub);
};
const clearQueue = () => {
    requestQueue = [];
};

// registering axios interceptor which handle response's errors
axiosInstance.interceptors.response.use(undefined, error => {
    console.error(error.message); //logging here
    const { response = {}, config: sourceConfig } = error;

    // checking if request failed cause Unauthorized
    if (response.status === 403) {
        // if this request is first we set isGetActiveSessionRequest flag to true and run createSession
        if (!isGetActiveSessionRequest) {
            isGetActiveSessionRequest = true;
            createSession().then(token => {
                // when createSession resolve with token value we run all request from queue with new token
                isGetActiveSessionRequest = false;
                callRequestsFromQueue(token);
                clearQueue(); // and clean queue
            }).catch(e => {
                isGetActiveSessionRequest = false; // Very important!
                console.error('Create session error %s', e.message);
                clearQueue();
            });
        }

        // and while isGetActiveSessionRequest equal true we create and return new promise
        const retryRequest = new Promise(resolve => {
            // we push new function to queue
            addRequestToQueue((token: string) => {
                // function takes one param 'cookie'
                console.info("Retry with new session context %s request to %s", sourceConfig.method, sourceConfig.url);
                sourceConfig.headers.Authorization = `Bearer ${token}`; // setting cookie to header
                resolve(axios(sourceConfig)); // and resolve promise with axios request by old config with cookie
                // we resolve exactly axios request - NOT axiosInstance's request because it could call recursion
            });
        });

        return retryRequest;
    } else {
        // if error is not related with Unauthorized we just reject promise
        return Promise.reject(error);
    }
});

export default axiosInstance;