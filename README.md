# Casbin.js

[![NPM version](https://img.shields.io/npm/v/casbin.js)](https://www.npmjs.com/package/casbin.js)
[![Build Status](https://api.travis-ci.com/casbin/casbin.js.svg?branch=master)](https://travis-ci.com/github/casbin/casbin.js)
[![codebeat badge](https://codebeat.co/badges/74b3febb-292f-4633-81df-3a76ea445cd8)](https://codebeat.co/projects/github-com-casbin-casbin-js-master)
![Code size](https://img.shields.io/github/languages/code-size/casbin/casbin.js)

Casbin.js is a frontend port of a backend Casbin service, which facilitates the manipulation, management and storage of the user permission in a frontend application.

## Example
You can expose your server-end Casbin policy with an RESTFul API (HTTP/HTTPS interfaces) with our [server tools](!https://github.com/casbin-js/node-utils).

At your client-side, set up Casbin.js authorizer with your RESTFul endpoint and the identity of the user.
```
const casbinjs = require('casbin.js');
authorizer = new casbinjs.Authorizer("http://YOUR_DOMAIN/casbin/api", "alice"); // suppose alice is visiting your webpage.

authorizer.can("read", "something").then(...); // check the permission. 
```

More functionalities of Casbin.js are still under development. Feel free to raise issues to share your features suggestions!



