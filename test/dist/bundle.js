/* webpack build code */
(function (modules) {
  const __webpack_cache = {};

  window.__webpack_cache = __webpack_cache;

  function __webpack_require__(moduleId) {
    if (__webpack_cache[ moduleId ]) {
      return __webpack_cache[ moduleId ].exports;
    }
    const module = __webpack_cache[ moduleId ] = {
      isLoad: false,
      id: moduleId,
      exports: {},
    };
    modules[ moduleId ].call(module, module, module.exports, __webpack_require__);
    module.isLoad = true;
    return module.exports;
  }

  __webpack_require__("./entry.js");
})({
  "./libs/lib2.js": (function (module, exports, __webpack_require__) {
    const p = document.createElement('p');
    p.innerHTML = "I AM LIB2";
    document.body.append(p);
  }),
  "./libs/lib1.js": (function (module, exports, __webpack_require__) {
    __webpack_require__("./libs/lib2.js");
    const p = document.createElement('p');
    p.innerHTML = "I AM LIB1";
    document.body.append(p);
  }),
  "./libs/lib3.js": (function (module, exports, __webpack_require__) {
    const p = document.createElement('p');
    p.innerHTML = "I AM LIB3";
    document.body.append(p);
  }),
  "./entry.js": (function (module, exports, __webpack_require__) {
    __webpack_require__("./libs/lib1.js");
    __webpack_require__("./libs/lib3.js");
    const p = document.createElement('p');
    p.innerHTML = "I AM MAIN";
    document.body.append(p);
  }),

});
