# CSS Controler for Casbin.js
The project is still under development.



<details>
I take some notes of my personal thinking about this project here. For convenience and clearness, I use Chinese in this doc. 

项目目标：这个项目针对的是那些使用最原生的建站方式（静态HTLM+CSS+JS，不使用如Vue、React等现代网页框架）的开发人员，让他们可以轻松使用casbin.js对自己的页面元素的样式进行控制。

具体用法：

用户在HTML中通过在DOM元素中的class指定`casbin`和这个DOM所属的对象名（例如`data1`），CSSController将负责接管这些DOM。CSSController将会验证前端用户的身份以及对这些DOM所拥有的权限（使用Casbin.js实现）来更新这些DOM的样式。

一个例子：
首先在css文件中指定当用户对对象obj有权限执行某种行为act时，对象obj的样式。

```css
/* casbin-js.css */

/* Styles of objects that can be "read"*/
.read {
    color: black
}

/* Styles of the objects that can be "written" */
.write {
    color: red
}

```
同时在HTML中指定需要被casbin-js管理的DOM：在这些DOM的class中指定`casbin`以及这个DOM的obj名称。（事实上，也可以把obj名称看作是group名称）
```html
<!-- index.html -->
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <p>If some one can read </p>
    
    <!-- specify the object name in the DOM class properties -->
    <!-- the following DOM is denoted as object data1 -->
    <p class="casbin data1">Data1</p>
    <!-- the following DOM is denoted as object data2-->
    <p class="casbin data2">Data2</p>
    <script src="casbin-js.js" />
    <script src="casbin-js-css-controller.js" />
    // 1. Initialize the authorizer
    // 2. Pass the authorizer to css controller
    // 3. refresh the page.
    <script>
        let auth = casbin.Authorizer(...);
        let cssctl = casbin-js-css-controller(auth);
        cssctl.refresh()
    </script>
</body>
```


需要解决的问题：
1. 考虑多种行动的组合与优先级（一个用户对某个对象obj拥有多种行为权限，最该按照哪一种权限对应的样式对obj重新渲染？）
2. 如何更加优雅地在HTML中使用该这个插件？
3. 是否可以动态监控html doms的变化来随时对元素进行更新？
4. 如何设计单元测试？直接写一个静态网站并引入打包好的js文件？
</details>