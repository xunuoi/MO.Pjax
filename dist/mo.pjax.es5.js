/**
 * FOR MO.pjax
 * API:
 * MO.state: Set Current State and Page-Fn
 * MO.touch: Push to Next State, and store the state and data
 * MO.config: Config the options for MO.pjax
 */

(function(_g){
'use strict';

_g['MO'] = {}


var _pjax_req = {};
var _mo_cache = {};
var _mo_cache_time = {};

var opts = {
    'type': 'POST',
    'cache': true,
    // 'cacheExpires': 10000, // 0 means always avaliable
    'storage': true,

    //如果storageExpires设置为0或false，永不过期
    'storageExpires': 43200000, // 12 hours

    'dataType': 'html',

    'pjaxHeader': {
        'Http-Request-Pjax': 'Fragment'
    },

    // before () {}

    beforeSend: function beforeSend(req) {
        var ph = this['pjaxHeader'];
        for (var h in ph) {
            var v = ph[h];
            req.setRequestHeader(h, v);
        }
        // req.setRequestHeader("Http-Request-Pjax", "Fragment")
    }
};

/**
 * INIT EVENTS
 */

function _ref(e) {
    // console.log('*on popstate: ', e)

    if (history.state && e.state) {
        _execute(e.state);
    }
}

function initEvents() {
    window.addEventListener('popstate', _ref, false);
}

initEvents();

/**
 * CORE PJAX CODE
 * @type {Object}
 */

var _api = {
    fetch: function fetch(url, dataType, _fetch) {
        function _ref2(err) {
            console.error('fetch error: ' + url, err);
        }

        /** Cache Data
         * null and false is OK!, but undefined 
         * is not in cache
         **/

        var cacheData = _cache(url);

        function _ref3(data) {
            //if succeed, cache the res data
            opts['cache'] ? _cache(url, data) : '';
            opts['storage'] ? _store(url, data) : '';
        }

        if (!_fetch || cacheData !== undefined) {
            var _ret = (function () {

                var _pObj = {

                    // 700 means from local cache/storage
                    'status': '700',
                    // "OK" means from http request ,
                    // "cached" means cached
                    'statusText': "cached",

                    'done': function done(_done) {
                        _done ? _done(cacheData, 'success', _pObj) : '';
                        return _pObj;
                    },
                    'then': function then(_then) {
                        _then ? _then(cacheData, 'success', _pObj) : '';
                        return _pObj;
                    },
                    'fail': function fail(_fail) {
                        /**
                         * 此处有缓存数据，不触发fail函数~
                         */
                        // _fail ? _fail() : ''
                        return _pObj;
                    }
                };

                return {
                    v: _pObj
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else {
            return $.ajax($.extend({
                'url': url
            }, opts)).fail(_ref2).done(_ref3);
            /*.complete((rs)=>{
                console.log(`fetch complete: ${url}`,  rs)
            })*/
        }
    }
};

/**
 * Store data in localStorage
 */

function _removeStorage(k, _tsK) {
    var tsK = _tsK || k + '_createdAt';

    localStorage.removeItem(k);
    localStorage.removeItem(tsK);
}

/**
 * Store data in storage
 */

function _store(k, v) {
    if (!opts['storage']) return;

    var tsK = k + '_createdAt';

    if (v !== undefined) {

        localStorage.setItem(k, v);

        var ts = new Date().getTime();
        localStorage.setItem(tsK, ts);

        // _mo_cache_time[k] = (new Date()).getTime()
    } else if (k) {

            var ts = parseInt(localStorage.getItem(tsK)),
                cs = new Date().getTime();

            var d = localStorage.getItem(k);

            //如果设置了storageExpires ，并且storage过期了
            //如果storageExpires设置为0或false，永不过期
            if (d && ts && opts['storageExpires'] && cs - ts >= opts['storageExpires']) {
                _removeStorage(k, tsK);

                return;
            }

            if (d == 'null') {
                d = null;
            }
            if (d == 'undefined') {
                d = undefined;
            }

            //传递出去undefined，避免Null被认为是有效值
            if (d == null) {
                d = undefined;
            }

            //同步到内存Cache
            if (d) _cache(k, d);

            return d;
        }
}

function _removeCache(k) {
    delete _mo_cache[k];
    delete _mo_cache_time[k];
}

function _cache(k, v) {
    if (!opts['cache']) return;

    /**
     * if v is null, that also a avaliable data
     * only undefined is Invalid!
     */
    if (v !== undefined) {

        _mo_cache[k] = v;
        _mo_cache_time[k] = new Date().getTime();

        return;
    } else if (k) {

        //如果设定了过期时间,且过期时间>0。如果设置为0，代表永不过期
        if (opts['cacheExpires']) {
            var _v = _mo_cache[k],
                _createdAt = _mo_cache_time[k];

            if (_v !== undefined) {

                var _current = new Date().getTime(),
                    _diff = _current - _createdAt;

                console.log("diff: ", _diff);

                if (_diff < opts['cacheExpires']) {
                    console.log('Cache Hit: ', k);
                    return _v;
                } else {
                    console.log('Cache Expired: ', k);
                    //then api.fetch will update the Cache
                    _removeCache(k);
                    /**
                     * 如果cache也过期了，默认认为storage中
                     * 也过期了，清除掉storage
                     */
                    _removeStorage(k);

                    return;
                }
            } else {
                //检查是否storagez中存在
                return _store(k);
            }

            //如果没有设定过期时间，cache永久有效
        } else {
                return _mo_cache[k] || _store(k);
            }
    } else {
        throw Error('Unknown Error In _cache');
    }
}

function _execute(state) {

    //trigger events
    return _trigger(state);
}

function _register(apiUrl, fn) {
    var _fetch = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    //update events fn
    delete _pjax_req[apiUrl];

    _pjax_req[apiUrl] = {
        'fn': fn,
        'fetch': _fetch
    };
}

function _trigger(state) {

    var apiUrl = state['url'];
    var title = state['title'];
    var dataType = state['dataType'];

    var _fetch = undefined,
        onpopFn = undefined;

    // let onpopFn = _mo_events[apiUrl]
    var _req = _pjax_req[apiUrl];
    if (_req) {
        onpopFn = _req['fn'];
        _fetch = _req['fetch'];
    }

    // console.log(`*trigger: ${apiUrl}`)
    /**
     * Trigger Before Global Fn
     */

    if (opts['before']) {
        opts['before'](state);
    }

    return _api.fetch(apiUrl, dataType, _fetch).done(function (res) {
        document.title = title;
    }).done(onpopFn);
}

function touch(apiUrl, title, onpopFn) {
    var _fetch = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

    _register(apiUrl, onpopFn, _fetch);

    var state = {
        'url': apiUrl,
        'title': title,
        'dataType': opts['dataType']
    };

    /**
     * 此时push的是下个当前状态，不是上个状态。
     * 上个状态，在操作之前的时候就确定了
     */
    history.pushState(state, document.title, apiUrl);

    return _execute(state);
}

function state(url, title, onpopFn) {
    var _data = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    var _fetch = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

    var _fire = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

    _register(url, onpopFn, _fetch);

    //if data is null, it will be also cached!
    _cache(url, _data);

    var _state = {
        'url': url,
        'title': title,
        'dataType': opts['dataType']
    };

    /**
     * 因为此处一旦replaceState，就会修改url，
     * 所以此处也修改document.title
     */
    document.title = title;
    history.replaceState(_state, title, url);

    if (_fire) _execute(_state);
}

function go(aEle, ctn, cb, errorCb) {
    var evtType = arguments.length <= 4 || arguments[4] === undefined ? 'click' : arguments[4];

    var $ctn = $(ctn),
        rawHtml = $ctn.html();

    state(location.pathname, document.title, function (_data) {
        $ctn.html(_data);
    }, rawHtml, false, false);

    $(aEle).on(evtType, function (evt) {
        evt.stopPropagation();

        var $a = $(this),

        // $ctn = $(ctn),
        url = $a.attr('href'),
            title = $a.html();

        /**
         * DEBUG FOR FAIL
         */

        touch(url, title, function (res) {
            $(ctn).html(res);
            cb ? cb(res, $a) : '';
        }).fail(function (err) {
            errorCb ? errorCb(err, $a) : '';
        });

        //stop propagation
        return false;
    });
}

function define(ctn, _data) {
    var title = arguments.length <= 2 || arguments[2] === undefined ? document.title : arguments[2];
    var url = arguments.length <= 3 || arguments[3] === undefined ? location.pathname : arguments[3];

    MO.state(url, title, function (_data) {
        $(ctn).html(_data);
    }, _data, false, true);
}

function config(conf) {
    if (conf) return $.extend(opts, conf);else return opts;
}

/**
 * Store and remove Store
 */

function store() {
    _store.apply(undefined, arguments);
}

function removeStore() {
    _removeStorage.apply(undefined, arguments);
}


_g['MO'].go = go;

_g['MO'].define = define;
_g['MO'].touch = touch;
_g['MO'].state = state;

_g['MO'].store = store;
_g['MO'].removeStore = removeStore;

_g['MO'].config = config;


})(this)
