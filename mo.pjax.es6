/**
 * FOR MO.pjax
 * API:
 * MO.state: Set Current State and Page-Fn
 * MO.touch: Push to Next State, and store the state and data
 * MO.config: Config the options for MO.pjax
 */


let _pjax_req = {}
let _mo_cache = {}
let _mo_cache_time = {}

let opts = {
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
    
    beforeSend (req){
        let ph = this['pjaxHeader']
        for (let h in ph ){
            let v = ph[h]
            req.setRequestHeader(h, v);
        }
        // req.setRequestHeader("Http-Request-Pjax", "Fragment");
    }
}


/**
 * INIT EVENTS
 */

function initEvents(){
    window.addEventListener('popstate', (e) => {
        // console.log('*on popstate: ', e)
        
        if (history.state && e.state){
            _execute(e.state)
        }

    }, false)
}

initEvents()


/**
 * CORE PJAX CODE
 * @type {Object}
 */

let _api = {
    fetch (url, dataType, _fetch){
        /*let prefix = '/api'

        if(url == '/'){
            prefix = ''
        }*/

        //null and false is OK!, but undefined is not in cache
        let cacheData = _cache(url)
        // console.log(url, cacheData)

        if(!_fetch || cacheData !== undefined){

            let _pObj = {
                'done': function(_done){
                    _done ? _done(cacheData) : ''
                    return _pObj
                },
                'fail': function(_fail){
                    _fail ? _fail() : ''
                    return _pObj
                }
            }

            return _pObj


        }else {
            return $.ajax($.extend(
            {
                'url': url,
            }, opts))
            .fail((err) => {
                console.error(`fetch error: ${url}`,  err)
            })
            .done((data)=>{
                //if succeed, cache the res data
                // _cache(url, data)
                opts['cache'] ? _cache(url, data) : ''
                opts['storage'] ? _store(url, data) : ''
                
            })
            /*.complete((rs)=>{
                console.log(`fetch complete: ${url}`,  rs)
            })*/
        }
        
    }
}


/**
 * Store data in localStorage
 */

function _removeStorage(k, _tsK){
    let tsK = _tsK || k+'_createdAt'

    localStorage.removeItem(k)
    localStorage.removeItem(tsK)
}


/**
 * Store data in storage
 */

function _store(k, v){
    if(!opts['storage']) return

    let tsK = k+'_createdAt'

    if(v!== undefined) {

        localStorage.setItem(k, v)

        let ts = (new Date()).getTime()
        localStorage.setItem(tsK, ts)


        // _mo_cache_time[k] = (new Date()).getTime()
    }else if(k){

        let ts = parseInt(localStorage.getItem(tsK)),
            cs = (new Date()).getTime()

        let d = localStorage.getItem(k)

        //如果设置了storageExpires ，并且storage过期了
        //如果storageExpires设置为0或false，永不过期
        if(d && 
            ts && 
            opts['storageExpires'] &&
            (cs - ts) >= opts['storageExpires']
        ){
            _removeStorage(k, tsK)

            return
        }

        
        if(d == 'null'){
            d = null
        }
        if(d == 'undefined'){
            d = undefined
        }

        //传递出去undefined，避免Null被认为是有效值
        if(d == null){
            d = undefined
        }

        //同步到内存Cache
        if(d) _cache(k, d)

        return d
    }

}



function _removeCache(k){
    delete _mo_cache[k]
    delete _mo_cache_time[k]
}


function _cache(k, v){
    if(!opts['cache']) return

    /**
     * if v is null, that also a avaliable data
     * only undefined is Invalid!
     */
    if(v!== undefined) {

        _mo_cache[k] = v
        _mo_cache_time[k] = (new Date()).getTime()

        return 

    }else if(k){

        //如果设定了过期时间,且过期时间>0。如果设置为0，代表永不过期
        if(opts['cacheExpires']){
            let _v = _mo_cache[k],
                _createdAt = _mo_cache_time[k]

            if(_v !== undefined ) {

                let _current = (new Date()).getTime(),
                    _diff = _current - _createdAt

                console.log("diff: ", _diff)

                if(_diff < opts['cacheExpires']){
                    console.log('Cache Hit: ', k)
                    return _v
                }else {
                    console.log('Cache Expired: ', k)
                    //then api.fetch will update the Cache
                    _removeCache(k)
                    /**
                     * 如果cache也过期了，默认认为storage中
                     * 也过期了，清除掉storage
                     */
                    _removeStorage(k)
                    
                    return
                }

            }else {
                //检查是否storagez中存在
                return _store(k)
            }

        //如果没有设定过期时间，cache永久有效
        }else {
            return _mo_cache[k] || _store(k)
        }

    }else {
        throw Error('Unknown Error In _cache')
    }

}


function _execute(state){

    //trigger events
    return _trigger(state)   
}

function _register(apiUrl, fn, _fetch=true){
    //update events fn
    // delete _mo_events[apiUrl]
    // _mo_events[apiUrl] = fn
     
    delete _pjax_req[apiUrl]

    _pjax_req[apiUrl] = {
        'fn': fn,
        'fetch': _fetch
    }

    
}


function _trigger(state){

    let apiUrl = state['url']
    let title = state['title']
    let dataType = state['dataType']

    let _fetch, onpopFn

    // let onpopFn = _mo_events[apiUrl]
    let _req = _pjax_req[apiUrl]
    if(_req){
        onpopFn = _req['fn']
        _fetch = _req['fetch']
    }

    // console.log(`*trigger: ${apiUrl}`)

    return _api
    .fetch(apiUrl, dataType, _fetch)
    .done((res)=>{
        document.title = title
    })
    .done(onpopFn)

}


function touch(apiUrl, title, onpopFn, _fetch=true){
    _register(apiUrl, onpopFn, _fetch)

    let state = {
        'url': apiUrl,
        'title': title,
        'dataType': opts['dataType']
    }


    /**
     * 此时push的是下个当前状态，不是上个状态。
     * 上个状态，在操作之前的时候就确定了
     */ 
    history.pushState(state, document.title, apiUrl)

    return _execute(state)

}


function state(url, title, onpopFn, _data=null, _fetch=false, _fire=false){
    _register(url, onpopFn, _fetch)

    
    //if data is null, it will be also cached!
    _cache(url, _data)
    
    let _state = {
        'url': url,
        'title': title,
        'dataType': opts['dataType']
    }

    /**
     * 因为此处一旦replaceState，就会修改url，
     * 所以此处也修改document.title
     */
    document.title = title
    history.replaceState(_state, title, url)

    if(_fire) _execute(_state)

}


function go(aEle, ctn, cb, errorCb, evtType='click'){
    let $ctn = $(ctn),
        rawHtml = $ctn.html()

    state(location.pathname, document.title, (_data)=>{
        $ctn.html(_data)
    }, rawHtml, false, false)

    $(aEle).on(evtType, function(evt){
        evt.stopPropagation()

        let $a = $(this),
            // $ctn = $(ctn),
            url = $a.attr('href'),
            title = $a.html()
        
        /**
         * DEBUG FOR FAIL
         */
        
        touch(url, title, (res)=>{
            $(ctn).html(res)
            cb ? cb(res, $a) : ''
        })
        .fail(err=>{
            errorCb ? errorCb(err, $a) : ''
        })
        
        //stop propagation
        return false

    })
}


function define(ctn, _data, title=document.title, url=location.pathname){

    MO.state(url, title, (_data)=>{
        $(ctn).html(_data)
    }, _data, false, true)
}


function config(conf){
    if(conf) return $.extend(opts, conf)
    else return opts
}


export {
    go,
    define,
    touch,
    state,
    config
}
