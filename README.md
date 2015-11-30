# MO.Pjax
html5 pjax push state, html history api~

* [Pjax 使用教程](http://karat.cc/article/5655bcdce6fecb6c65eded27) http://karat.cc/article/5655bcdce6fecb6c65eded27
* 使用MO.touch和MO.state的[案例](http://karat.cc/)
* 使用MO.go的[案例](http://karat.cc/product)
* 用Pjax来开发web/H5/H5 APP，页面无刷新更新页面内容， 
* 启用cache和localStorage缓存、本地存储机制，简单、好用、快速
* 无刷新、速度快，提供更好的用户体验！

###### [version 1.0.1]



## Usage:


#### Install:

- 引入pjax脚本文件到html文件，如果使用es6，请import并配置编译。
- Put the `/dist/mo.pjax.es5.js` file in your html, like:

````html
<script type="text/javascript" src="./dist/mo.pjax.es5.js"></script>
```


#### Usage:

##### Api Params Desc 参数注释:

- `_fetch` means if send http request , if `_fetch=false`, it won't send http request and do not fetch network
- `_fire` means trigger the onpop fn immediately ,will change current history state immediately


#### Config Api Desc 配置:

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

- In fact ,you can set all below options 详细配置信息:

````Javascript
{
    'type': 'POST',// post is default http请求方式
    
    // if cache data， 是否缓存
    'cache': true,
    // 'cacheExpires': 10000, // 0 means always avaliable, default none 缓存时间
    
    // if store data in localStorage , default true 
    'storage': true, //是否启用localStorage
    //如果storageExpires设置为0或false，永不过期
    'storageExpires': 43200000, // 12 hours ,default 12 
    
    // the res data type, default html
    'dataType': 'html', //返回数据类型，默认html

    // you can set your own header ,just use `pjaxHeader` opts, 
    // which you can detect if it is an pjax request in back-end 
    // 你可以自己定义请求头，方便后端判断是否是pjax请求，如果是pjax, 返回部分html， fragment
    'pjaxHeader': {
        'Http-Request-Pjax': 'Fragment'
    },

    // you can set the fn which will triggered before MO.touch and popstate event happened
    // 触发pjax操作前和 出现popstate的事件时的事件函数, 参数是state，包含url、title等信息
    before (state) { ... } //默认无
    
    // you can set the beforeSend fn , before ajax request send.
    // jquery的ajax方法调用，请求前设置请求头，可以覆盖
    beforeSend (req){
        let ph = this['pjaxHeader']
        for (let h in ph ){
            let v = ph[h]
            req.setRequestHeader(h, v)
        }
    }
}
```


#### Api List:
  
1. `MO.go(aSelector, ctnSelector, onSuccess)`  
这个是最简单和常用的api， 只需要go一下，传入2个参数即可，1个参数是点击后触发pjax的元素选择器，一般是a，第2个是更新返回内容的html 。第3个是回调函数，可选，默认空; Easy Mode Usage, aSelector is the a link you want to use pjax, and ctnSelector is the html container, onSuccess is callback when succeed.

如果要添加处理错误的函数，比如出现网络请求错误404等，可以在此设置捕获; you can deal error here by error-fn
````Javascript
MO.go('.ctn a', '#ttt', 
function onSuccess(res, $aEle){
    console.log(res, $aEle)
}, 
function onError(err, $aEle){
    console.log(err, $aEle)
})
```
  
  
2. `MO.touch(apiUrl, title, onpopFn, _fetch=true)`  
更强大和灵活的使用pjax， 可以定义 pjax的操作的url、回调、是否发起此url的网络请求等, 可以实现复杂交互和动画，同样可添加错误处理函数; Most flexible Usage , you can controll everything by this api, and it usually works with MO.state.
  
添加fail处理网络请求错误; You can add fail fn to deal with http request error:
  
````Javascript
MO.touch(apiUrl, title, onpopFn, _fetch=true)
.fail(function(err) {
    console.log('There is an error', err)
})
```
  
  
3. `MO.define(ctn, htmlData)`  
定义当前页面的state状态; Update Curretn History State immediately  

  
4. `MO.state(url, title, onpopFn, _data=null, _fetch=false, _fire=false)`  
详细定义当前页面state状态，以及是否请求次url, 和是否立刻触发onpopFn_fire
Update Current History State, if you want fire immediately ,just set _fire true, and _data can be null ,which will be put to onpopFn
  
   
 
  
###### 说明

- 通过MO.touch和MO.state，可以做非常复杂的pjax 应用，自定义事件\UI等
- 如果要简单使用，就是直接 MO.go(), 传入你想要pjax的a元素的selector即可
- 配合启用cache/localStorage(默认都启用), 给用户更好操作体验，减少等待、卡顿


###### 额外的api：store/removeStore
- 提供本地存储和自动过期机制，
- 过期时间通过MO.config({'storageExpires': xxx})来设定
- store/removeStore data in localStorage with auto expires feature,
- It will createt a item { k+'createdAt': (new Date).getTime() },
- and you can set the expire in MO.config({storageExpire: xxxx })

- store API:

````Javascript
MO.store(k, v)
MO.removeStore(k, v)
```



#### Example 举例:

##### html

````html
<!-- Index.html 这个是index.html文件 -->

<div class="ctn">
    <h3>Test Mo.pjax</h3>
    <p>
       <a href="/about.html">About</a>
        <a href="/toxic.html">Toxic</a> 
    </p>
</div>
<div id="ttt" style="margin-top: 30px;">
    <p>This is index html</p>
</div>



------------------------------------------------------------------
<!-- about.html  这个是about.html文件 -->

<div>This is about html</div>



------------------------------------------------------------------
<!-- toxic.html  这个是toxic.html文件  -->

<div>This is toxic html</div>

```



##### JS 代码
- just :
`MO.go('.ctn a', '#ttt')`

- so easy! 搞定





# Contact Me

The docs is maybe rougth, simple, not-easily-understood. So Any questions, contact me.

Email: 

* xunuoi@163.com [recommend]
* xwlxyjk@gmail.com



QQ: [751933537]


### Best Wishes!
