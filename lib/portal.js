
const ASSERT = require("assert");
const PATH = require("path");
const CONNECT = require("connect");
const BUNDLER = require("sourcemint-platform-nodejs/lib/bundler");


exports.start = function(options) {

    options = options || {};   

    ASSERT(typeof options.port !== "undefined", "'options.port' is required!");
    ASSERT(typeof options.pages !== "undefined", "'options.pages' is required!");
    ASSERT(typeof options.clientPackage !== "undefined", "'options.clientPackage' is required!");
    ASSERT(typeof options.distPath !== "undefined", "'options.distPath' is required!");

    var server = CONNECT();

    server.use(CONNECT.router(function(app)
    {
        app.get(/^\/static\/ui(?:\.js)?(\/.*)?$/, BUNDLER.hoist(options.clientPackage, {
            distributionBasePath: options.distPath,
            packageIdHashSeed: "__DEVCOMP_PORTAL__",
            bundleLoader: true
        }));

        app.get(/^\//, CONNECT.static(options.pages));
    }));

    server.listen(options.port, "127.0.0.1");

    console.log("DeveloperCompanion Portal Server running at http://127.0.0.1:" + options.port + "/");
}
