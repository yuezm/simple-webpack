const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

module.exports = class Webpack {
  constructor(webpackConfig) {
    this.webpackConfig = webpackConfig;
    this.deps = {};
  }

  run() {
    this.parse(this.webpackConfig.entry, path.resolve(this.webpackConfig.entry));
    this.output();
  }

  parse(entry, entryFullPath) {
    const self = this;
    const selfDeps = [];

    const babelTransformCode = babel.transformFileSync(entryFullPath, {
      plugins: [
        {
          visitor: {
            // 寻找import依赖
            ImportDeclaration(iPath) {
              const depPathInfo = Webpack.pathFormat(iPath.get('source').node.value, entryFullPath);

              selfDeps.push(depPathInfo.moduleId);
              self.parse(depPathInfo.moduleId, depPathInfo.moduleFullPath);
              iPath.remove();
            },
            // 寻找 require 依赖
            ExpressionStatement(expPath) {
              const callPath = expPath.get('expression');
              if (callPath.get('callee').isIdentifier({ name: 'require' })) {
                const depPathInfo = Webpack.pathFormat(callPath.get('arguments')[ 0 ].node.value, entryFullPath);

                selfDeps.push(depPathInfo.moduleId);
                self.parse(depPathInfo.moduleId, depPathInfo.moduleFullPath);
                expPath.remove();
              }
            }
          }
        }
      ]
    });

    if (babelTransformCode && babelTransformCode.code) {
      this.deps[ entry ] = Webpack.buildModuleCode(selfDeps, babelTransformCode.code);
    }
  }

  output() {
    const dirPath = path.parse(this.webpackConfig.output).dir;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(this.webpackConfig.output, Webpack.buildWebpackWrapper(this.deps, this.webpackConfig.entry));
  }

  static pathFormat(depFileName, parentFullPath) {
    const depFilePath = depFileName.includes('.js') ? depFileName : depFileName + '.js';
    const depFileFullPath = path.resolve(path.dirname(parentFullPath), depFilePath);
    const resDepFilePath = './' + path.relative('', depFileFullPath);

    return {
      moduleId: resDepFilePath,
      moduleFullPath: depFileFullPath,
    }
  }


  static buildModuleCode(selfDeps, code) {
    let depsCode = '';

    if (selfDeps.length > 0) {
      for (const dep of selfDeps) {
        depsCode += `__webpack_require__("${dep}");\n`;
      }
    }
    return `(function (module, exports, __webpack_require__) {${depsCode}${code}})`
  }

  static buildWebpackWrapper(deps, entry) {
    let depCode = '{\n';
    for (const moduleName in deps) {
      depCode += `"${moduleName}": ${deps[ moduleName ]},\n`;
    }
    depCode += '\n}';

    return `/* webpack build code */
(function (modules) {
    const __webpack_cache = {};\
    
    function __webpack_require__(moduleId) {
      if (__webpack_cache[ moduleId ]) {
      return __webpack_cache[ moduleId ].exports;}
      const module = __webpack_cache[ moduleId ] = {
        isLoad: false,
        id: moduleId,
        exports: {},
    };
      modules[ moduleId ].call(module, module, module.exports, __webpack_require__);
      module.isLoad = true;
      return module.exports;
  }

  __webpack_require__("${entry}");
})(${depCode});`;
  }
}
