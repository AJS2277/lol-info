/*global require*/
/*jslint nomen: true*/
'use strict';

import https from 'https';
import http from 'http'
import url from 'url';
import Q from 'q';
import RateLimiter from './rateLimiter';

var limiterPer10s,
    limiterPer10min,
    Craft = {},
    QueryMaker = {},
    checkLimits = function (callback) {
        if (limiterPer10s === undefined || limiterPer10min === undefined) {
            process.nextTick(callback);
            return;
        }

        limiterPer10s.schedule(function () {
            limiterPer10min.schedule(callback);
        });

    },
    getRequest = function (requestUrl, method, body, callback) {
        var jsonObj = '',
            protocol = https;

        if (typeof method == 'function') {
            callback = method;
            method = 'GET';
            body = null;
        }

        if (typeof body == 'object') {
            body = JSON.stringify(body);
        }

        checkLimits(function (err) {

            if (err !== undefined) {
                callback(err, null);
            }
            if (requestUrl.indexOf('http://') !== -1) {
                protocol = http;
            }
            var parsedUrl = url.parse(requestUrl);
            var requestData = {
                host: parsedUrl.host,
                path: parsedUrl.path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                }
            };
            var req = protocol.request(requestData, function (response) {
                response.on('data', function (chunk) {
                    jsonObj += chunk;
                });

                response.on('error', function (error) {
                    callback(error, null);
                });

                response.on('end', function () {
                    if (response.statusCode === 204) {
                        callback(null, null);
                    }

                    try {
                        jsonObj = JSON.parse(jsonObj);
                    } catch (e) {
                        callback(response.statusCode);
                        return;
                    }

                    if (jsonObj.status && jsonObj.status.message !== 200) {
                        callback(jsonObj.status.status_code + ' ' + jsonObj.status.message, null);
                    } else {
                        callback(null, jsonObj);
                    }
                });
            });

            req.on('error', function (err) {
                callback(err);
            });

            if (typeof body == 'string') req.write(body);
            req.end();
        });
    };

QueryMaker.makeRequest = function (url, errmsg, key) {
    var deferred = Q.defer();
    getRequest(url, function (err, result) {
        if (err) {
            deferred.reject(new Error(errmsg + err));
        } else {
            if (key) {
                deferred.resolve(result[key]);
            } else {
                deferred.resolve(result);
            }
        }
    });
    return deferred.promise;
};

QueryMaker.makeStaticRequest = function (err, data, callback) {
    var deferred = Q.defer();

    if (err) {
        deferred.reject(err);
    } else {
        deferred.resolve(data);
    }

    return deferred.promise.nodeify(callback);
};

QueryMaker.makeCustomRequest = function (url, method, body, errmsg, key, callback) {
    var deferred = Q.defer();
    getRequest(url, method, body, function (err, result) {
        if (err) {
            deferred.reject(new Error(errmsg + err));
        } else {
            if (key) {
                deferred.resolve(result[key]);
            } else {
                deferred.resolve(result);
            }
        }
    });
    return deferred.promise.nodeify(callback);
};

QueryMaker.getValidSeasonParam = function (season) {
    season = parseInt(season);
    return (season === null || season === 3 || season === 2014 || season === 2015);
};

QueryMaker.getCallbackAndRegion = function (regionOrFunction, region, callback) {
    var regionAndFunction = {
        'region': region,
        'callback': callback
    };

    if (regionOrFunction === undefined) {
        regionAndFunction.callback = undefined;
    } else if (typeof (regionOrFunction) === 'function') {
        regionAndFunction.callback = regionOrFunction;
    } else if (typeof (regionOrFunction) === 'string') {
        regionAndFunction.region = regionOrFunction;
    }

    return regionAndFunction;
};

QueryMaker.setRateLimit = function (limitPer10s, limitPer10min) {
    if (limitPer10s === false || limitPer10s === undefined) {
        limiterPer10min = undefined;
        limiterPer10s = undefined;
        return;
    }
    limiterPer10s = new RateLimiter(limitPer10s, 10 * 1000, false);
    limiterPer10min = new RateLimiter(limitPer10min, 10 * 60 * 1000, false);
};

export default QueryMaker;