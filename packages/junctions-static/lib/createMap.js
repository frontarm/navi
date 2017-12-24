'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createDOMFactory = require('./createDOMFactory');

var _createDOMFactory2 = _interopRequireDefault(_createDOMFactory);

var _junctions = require('junctions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(mainFile, publicFolder) {
        var processURL = function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pathname) {
                var dependencies, dom, rootJunction, manager, state, junction, deepestState;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                dependencies = [];
                                dom = createDOM(function (pathname) {
                                    dependencies.push(pathname);
                                });
                                rootJunction = dom.window.rootJunction;
                                manager = new _junctions.JunctionManager({
                                    initialLocation: { pathname: pathname },
                                    rootJunction: rootJunction,
                                    onEvent: function onEvent(eventType, location) {
                                        // TODO: can use this to build a map of dependencies for each chunk,
                                        // as opposed to dependencies for each URL. Then can build a list of
                                        // files to push with HTTP/2 each time somebody requests a chunk
                                    }
                                });
                                state = manager.getState();

                                if (!manager.isBusy()) {
                                    _context.next = 8;
                                    break;
                                }

                                _context.next = 8;
                                return new Promise(function (resolve, reject) {
                                    return manager.subscribe(function (newState, oldState, isBusy) {
                                        state = newState;
                                        if (!isBusy) {
                                            resolve();
                                        }
                                    });
                                });

                            case 8:
                                _context.next = 10;
                                return manager.getJunction({ pathname: pathname });

                            case 10:
                                junction = _context.sent;
                                deepestState = state;

                                while (deepestState.child) {
                                    deepestState = deepestState.child;
                                }

                                if (!deepestState.childStatus) {
                                    _context.next = 16;
                                    break;
                                }

                                console.warn('Could not load the junction associated with path "' + pathname + '".');
                                return _context.abrupt('return');

                            case 16:

                                console.log(deepestState);

                                if (deepestState.redirect) {
                                    map[pathname] = {
                                        pathname: pathname,
                                        dependencies: dependencies,
                                        redirect: deepestState.redirect
                                    };
                                } else {
                                    map[pathname] = {
                                        pathname: pathname,
                                        dependencies: dependencies,
                                        meta: deepestState.meta
                                    };
                                }

                                if (junction.children) {
                                    Object.keys(junction.children).filter(function (pattern) {
                                        return pattern.indexOf(':') === -1;
                                    }).forEach(function (pattern) {
                                        queue.push(state.location.pathname + pattern);
                                    });
                                }

                            case 19:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            return function processURL(_x3) {
                return _ref2.apply(this, arguments);
            };
        }();

        var createDOM, queue, map, pathname;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        createDOM = (0, _createDOMFactory2.default)(mainFile, publicFolder);
                        queue = ['/'];
                        map = {};

                    case 3:
                        if (!queue.length) {
                            _context2.next = 9;
                            break;
                        }

                        pathname = queue.shift();
                        _context2.next = 7;
                        return processURL(pathname);

                    case 7:
                        _context2.next = 3;
                        break;

                    case 9:
                        return _context2.abrupt('return', map);

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    function createMap(_x, _x2) {
        return _ref.apply(this, arguments);
    }

    return createMap;
}();
//# sourceMappingURL=createMap.js.map