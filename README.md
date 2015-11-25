# MO.Pjax
html5 pjax push state, html history api~

* 用Pjax来开发web/H5/H5 APP，提供更好的用户体验！

#### [version 1.0.1]



## Usage:


#### Install:

- Put the `/dist/mo.pjax.es5.js` file in your html,
like `<script type="text/javascript" src="./dist/mo.pjax.es5.js"></script>`


#### Usage:

- Config the MO: ```MO.config({
    'type': 'POST',
    'pjaxHeader': {
        'X-Http-Pjax': 'Pjax'
    }
})```

- `MO.go(aSelector, ctnSelector, callback)`

- `MO.define(ctn, htmlData)`

- `MO.state(url, title, onpopFn, _data=null, _fetch=false, _fire=false)`

- `MO.touch(apiUrl, title, onpopFn, _fetch=true)`



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
