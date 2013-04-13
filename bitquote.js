/* bitquote.js
 * Public Domain.
 *
 * Include it in your page, it will add a BTC object to the root object (e.g. window).
 *
 * This object provides three functions:
 *
 *      BTC.go(ms=30000, banOk=false) - start the ticker
 *      BTC.stop()                    - stop the ticker
 *      BTC.listen(callback)          - add a listener
 *      BTC.values()                  - get the most recently cached values
 *
 */
(function(root) {
    if (root.BTC) return;
    var log = function(msg) {
        if (DEBUG && console && console.log) {
            console.log("BTC: " + msg);
        }
    }
    // Adapted from http://www.hunlock.com/blogs/The_Ultimate_Ajax_Object:
    // (Public domain)
    var nullf = function() {};
    var AJAX = function (url, callbackFunction) {
        var that = this;
        var urlCall = url;
        this.updating = false;
        this.callback = callbackFunction || nullf;
        this.abort = function() {
            if (that.updating) {
                that.updating = false;
                that.AJAX.abort();
                that.AJAX = null;
            }
        }
        this.update = function(passData, postMethod) {
            if (that.updating) { return false; }
            that.AJAX = null;
            if (window.XMLHttpRequest) {
                that.AJAX = new XMLHttpRequest();
            } else {
                that.AJAX = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (that.AJAX == null) {
                return false;
            } else {
                that.AJAX.onreadystatechange  =  function() {
                    if (that.AJAX.readyState == 4) {
                        that.updating = false;
                        that.callback(that.AJAX.responseText, that.AJAX.status, that.AJAX.responseXML);
                        that.AJAX = null;
                    }
                }
                that.updating = new Date();
                if (/post/i.test(postMethod)) {
                    var uri = urlCall + '?' + that.updating.getTime();
                    that.AJAX.open("POST", uri, true);
                    that.AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    that.AJAX.setRequestHeader("Content-Length", passData.length);
                    that.AJAX.send(passData);
                } else {
                    var uri = urlCall + '?' + passData + '&timestamp = ' + (that.updating.getTime());
                    that.AJAX.open("GET", uri, true);
                    that.AJAX.send(null);
                }
                return true;
            }
        }
    }
    // From https://github.com/douglascrockford/JSON-js/blob/master/json2.js
    // (Public domain)
    var JSON = {};
    (function () {
        'use strict';
        function f(n) {
            return n < 10 ? '0' + n : n;
        }
        if (typeof Date.prototype.toJSON !== 'function') {
            Date.prototype.toJSON = function (key) {
                return isFinite(this.valueOf())
                    ? this.getUTCFullYear()     + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate())      + 'T' +
                        f(this.getUTCHours())     + ':' +
                        f(this.getUTCMinutes())   + ':' +
                        f(this.getUTCSeconds())   + 'Z'
                    : null;
            };
            String.prototype.toJSON      =
                Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
        }
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;
        function quote(string) {
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }
        function str(key, holder) {
            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];
            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }
            switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }
        if (typeof JSON.stringify !== 'function') {
            JSON.stringify = function (value, replacer, space) {
                var i;
                gap = '';
                indent = '';
                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }
                } else if (typeof space === 'string') {
                    indent = space;
                }
                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                        typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }
                return str('', {'': value});
            };
        }
        if (typeof JSON.parse !== 'function') {
            JSON.parse = function (text, reviver) {
                var j;
                function walk(holder, key) {
                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }
                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }
                if (/^[\],:{}\s]*$/
                        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                    j = eval('(' + text + ')');
                    return typeof reviver === 'function'
                        ? walk({'': j}, '')
                        : j;
                }
                throw new SyntaxError('JSON.parse');
            };
        }
    }());
    // The actual code.
    var DEFAULT_UPDATE_INTERVAL_MS = 30000;
    var DEBUG = true;
    var cachedValues = {};
    var parseValues = function(responseText) {
    };
    var cacheValues = function(values) {
        log("cache values: %o", values);
        cachedValues = values;
    };
    var updateIntervalHandle = null;
    var callbacks = [];
    var fireCallbacks = function(values) {
        for (var i = 0, len = callbacks.length; i<len; i++) {
            var callback = callbacks[i];
            try {
                callback(values);
            } catch (err) {
                log("callback failed.");
            }
        }
    };
    var BTC = {
        go: function(ms, banOk) {
            if (!ms) ms = DEFAULT_UPDATE_INTERVAL_MS;
            if (ms < 10000 && !banOk) {
                alert("btcqoute.js is set to poll too frequently.  "
                      + "Pass banOk=true to the go method to override.");
                return false;
            }
            if (updateIntervalHandle) {
                window.clearInterval(updateIntervalHandle);
            }
            updateIntervalHandle = setInterval(function() {
                log("Updating...")
                var callback = function(responseText, responseStatus) {
                    if (responseStatus == 200) {
                        var values = parseValues(responseText);
                        cacheValues(values);
                        fireCallbacks(values);
                    } else {
                        log("Ticker request failed.");
                    }
                };
                var req = AJAX("http://blockchain.info/ticker", callback);
                req.update();
            }, ms);
        },
        stop: function() {
            window.clearInterval(updateIntervalHandle);
        },
        listen: function(cb) {
            callbacks.push(cb);
        },
        values: function() {
            return cachedValues;
        }
    };
    root.BTC = BTC;
})(this);
