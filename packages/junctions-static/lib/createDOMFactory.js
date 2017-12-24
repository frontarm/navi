'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = createDOMFactory;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsdom = require('jsdom/lib/old-api.js');

function createDOMFactory(mainFile, publicFolder) {
    var cwd = process.cwd();
    var source = _fs2.default.readFileSync(_path2.default.resolve(cwd, mainFile));
    var script = new _vm2.default.Script(source, {
        displayErrors: true,
        filename: 'main.js',
        timeout: 1000
    });

    var factory = function factory(onLoad) {
        var doc = jsdom.jsdom('', {
            resourceLoader: function resourceLoader(resource, callback) {
                var pathname = resource.url.pathname;

                if (!publicFolder) {
                    console.error('Your app requested file "' + pathname + '", but I don\'t know where to look! Try setting the --public option.');
                    process.exit(1);
                }

                var relativePathname = pathname[0] === '/' ? pathname.slice(1) : pathname;
                var filesystemPath = _path2.default.resolve(cwd, publicFolder, relativePathname);

                if (/\.js$/.test(pathname)) {
                    _fs2.default.readFile(filesystemPath, "utf8", function (err, data) {
                        if (err) {
                            return callback(err);
                        }

                        if (onLoad) {
                            onLoad(pathname);
                        }

                        callback(null, '"use strict";\n' + data);
                    });
                } else {
                    return resource.defaultFetch(callback);
                }
            }
        });
        var window = doc.defaultView;
        jsdom.evalVMScript(window, script);
        return window;
    };

    var testDOM = factory();
    var rootJunction = testDOM.window.rootJunction;
    if (!rootJunction) {
        console.error('The file "' + mainFile + '" was found, but doesn\'t assign a "rootJunction" property to the window object.');
        process.exit(1);
    }

    return factory;
}
//# sourceMappingURL=createDOMFactory.js.map