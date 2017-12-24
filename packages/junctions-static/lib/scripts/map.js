'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createMap = require('../createMap');

var _createMap2 = _interopRequireDefault(_createMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(mainFile, publicFolder) {
        var siteMap;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return (0, _createMap2.default)(mainFile, publicFolder);

                    case 2:
                        siteMap = _context.sent;


                        console.log(siteMap);
                        // TODO: print the map

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    function map(_x, _x2) {
        return _ref.apply(this, arguments);
    }

    return map;
}();
//# sourceMappingURL=map.js.map