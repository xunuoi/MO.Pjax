# MO.Pjax
html5 pjax push state, html history api~

* 用Pjax来开发web/H5/H5 APP，页面无刷新更新页面内容， 
* 启用cache和localStorage缓存、本地存储机制，简单、好用、快速
* 无刷新、速度快，提供更好的用户体验！

###### [version 1.0.1]



## Usage:


#### Install:

- Put the `/dist/mo.pjax.es5.js` file in your html,
like:

````html
<script type="text/javascript" src="./dist/mo.pjax.es5.js"></script>
```


#### Usage:

##### Api Params Desc:

- `_fetch` means if send http request , if `_fetch=false`, it won't send http request and do not fetch network
- `_fire` means trigger the onpop fn immediately ,will change current history state immediately


#### Config Api Desc:

- Config the MO: 

````Javascript

MO.config({
    'type': 'POST',
    
    // this can be used for you back-end ,to detect if it is a pjax request
    'pjaxHeader': {
        'X-Http-Pjax': 'Pjax'
    }
})
```

- In fact ,you can set all below options:

````Javascript
{
    'type': 'POST',// post is default
    
    // if cache data
    'cache': true,
    // 'cacheExpires': 10000, // 0 means always avaliable, default none
    
    // if store data in localStorage , default true
    'storage': true,
    //如果storageExpires设置为0或false，永不过期
    'storageExpires': 43200000, // 12 hours ,default 12 
    
    // the res data type, default html
    'dataType': 'html',

    // you can set your own header ,just use `pjaxHeader` opts, 
    // which you can detect if it is an pjax request in back-end 
    'pjaxHeader': {
        'Http-Request-Pjax': 'Fragment'
    },

    // you can set the fn which will triggered before MO.touch and popstate event happened
    // before () { ... } 
    
    // you can set the beforeSend fn , before ajax request send.
    beforeSend (req){
        let ph = this['pjaxHeader']
        for (let h in ph ){
            let v = ph[h]
            req.setRequestHeader(h, v)
        }
    }
}
```


#### Api:

- Easy Mode Usage, aSelector is the a link you want to use pjax, 
- and ctnSelector is the html container, onSuccess is callback when succeed:
- `MO.go(aSelector, ctnSelector, onSuccess)`

- with Success/Fail Fn, you can deal with error by yourself: 

````Javascript
MO.go('.ctn a', '#ttt', 
function onSuccess(res, $aEle){
    console.log(res, $aEle)
}, 
function onError(err, $aEle){
    console.log(err, $aEle)
})
```

- Update Curretn History State immediately,just by:
- `MO.define(ctn, htmlData)`

- Update Current History State, if you want fire immediately ,just set _fire true, and _data can be null ,which will be put to onpopFn
- `MO.state(url, title, onpopFn, _data=null, _fetch=false, _fire=false)`

- Most flexible Usage , you can controll every this,
- `MO.touch(apiUrl, title, onpopFn, _fetch=true)` 
- You can add fail fn to deal with faild error:

````Javascript
MO.touch(apiUrl, title, onpopFn, _fetch=true)
.fail(function(err) {
    console.log('There is an error ', err)
})

```

- store/removeStore data in localStorage with auto expires feature,
- It will createt a item { k+'createdAt': (new Date).getTime() },
- and you can set the expire in MO.config({storageExpire: xxxx })

````Javascript
MO.store(k, v)
MO.removeStore(k, v)
```




#### Example:

##### html

````html
<!-- Index.html -->

<div class="ctn">
    <h3>Test Mo.pjax</h3>
    <p>
       <a href="/about">About</a>
        <a href="/toxic">Toxic</a> 
    </p>
</div>
<div id="ttt" style="margin-top: 30px;">
    <p>This is index html</p>
</div>



------------------------------------------------------------------
<!-- about.html -->

<div>This is about html</div>



------------------------------------------------------------------
<!-- toxic.html -->

<div>This is toxic html</div>

```



##### JS
- just in your js:
`MO.go('.ctn a', '#ttt')`

- so easy !





# Contact Me

The docs is maybe rougth, simple, not-easily-understood. So Any questions, contact me.

Email: 

* xunuoi@163.com [recommend]
* xwlxyjk@gmail.com



QQ: [751933537]


### Best Wishes!
