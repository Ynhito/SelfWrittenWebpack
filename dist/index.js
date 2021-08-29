
          (function(modules) {
            function require(id) {
              const [fn, mapping] = modules[id];
              function localRequire(name) {
                return require(mapping[name]);
              }
              const module = { exports : {} };
              fn(localRequire, module, module.exports);
              return module.exports;
            }
            require(0);
          })({0: [
            function (require, module, exports) {
              "use strict";

var _message = require("./message.js");

var _message2 = _interopRequireDefault(_message);

var _index = require("./components/component1/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var paragraph = document.querySelector('#paragraph');
paragraph.innerHTML = _message2.default;

var paragraph1 = document.querySelector('.component1');
paragraph1.innerHTML = _index.component1Name;

console.log(_message2.default);
            },
            {"./message.js":1,"./components/component1/index.js":2},
          ],1: [
            function (require, module, exports) {
              "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _name = require("./name.js");

exports.default = "hello " + _name.name + "!";
            },
            {"./name.js":3},
          ],2: [
            function (require, module, exports) {
              "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var component1Name = exports.component1Name = 'component1';
            },
            {},
          ],3: [
            function (require, module, exports) {
              "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var name = exports.name = 'TESTs';
            },
            {},
          ],})
        