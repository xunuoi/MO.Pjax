# MO.Pjax
html5 pjax push state, html history api~

* 用Pjax来开发web/H5/H5 APP，页面无刷新更新页面内容， 
* 无刷新、速度快，提供更好的用户体验！

#### [version 1.0.1]



## Usage:


#### Install:

- Put the `/dist/mo.pjax.es5.js` file in your html,
like:
```
<script type="text/javascript" src="./dist/mo.pjax.es5.js"></script>
```


#### Usage:

##### Api Params Desc:

- `_fetch` means send http request, if `_fetch=false`, it won't send http request and do not fetch network
- `_fire` means trigger the onpop fn immediately ,will change current history state immediately
- ``

- Config the MO: ```MO.config({
    'type': 'POST',
    'pjaxHeader': {
        'X-Http-Pjax': 'Pjax'
    }
})```


#### Api:

- Easy Mode Usage, aSelector is the a link you want to use pjax, 
- and ctnSelector is the html container, onSuccess is callback when succeed:
- `MO.go(aSelector, ctnSelector, onSuccess)`

- with Success/Fail Fn, you can deal with error by yourself: 
```
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
```
MO.touch(apiUrl, title, onpopFn, _fetch=true)
.fail(function(err) {
    console.log('There is an error ', err)
})

```



#### Example:

##### html
```
<div class="ctn">
    <h3>Test Mo.pjax</h3>
    <p>
       <a href="/about">About</a>
        <a href="/toxic">Toxic</a> 
    </p>
</div>

<div id="ttt" style="margin-top: 30px;">GO OK</div>
```

##### JS

`MO.go('.ctn a', '#ttt')`





# Contact Me

The docs is maybe rougth, simple, not-easily-understood. So Any questions, contact me.

Email: 

* xunuoi@163.com [recommend]
* xwlxyjk@gmail.com



QQ: [751933537]


### Best Wishes!
