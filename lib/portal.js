
const ASSERT = require("assert");
const PATH = require("path");
const CONNECT = require("connect");
const BUNDLER = require("sourcemint-platform-nodejs/lib/bundler");
const SOCKET_IO = require("socket.io");
const QL_IO_ENGINE = require("ql.io-engine");
const MAPPINGS = require("mappings").for(PATH.dirname(__dirname));

exports.start = function(options) {

    options = options || {};   

    ASSERT(typeof options.port !== "undefined", "'options.port' is required!");
    ASSERT(typeof options.pages !== "undefined", "'options.pages' is required!");
    ASSERT(typeof options.clientPackage !== "undefined", "'options.clientPackage' is required!");
    ASSERT(typeof options.distPath !== "undefined", "'options.distPath' is required!");

    var server = CONNECT();

    server.use(CONNECT.router(function(app)
    {
        app.get(/^\/static\/bootstrap(\/.*)$/, function(req, res) {
            req.url = req.params[0];
            CONNECT.static(MAPPINGS.resolve("ui-bootstrap"))(req, res);
        });
        app.get(/^\/static\/underscore(\/.*)$/, function(req, res) {
            req.url = req.params[0];
            CONNECT.static(MAPPINGS.resolve("ui-underscore"))(req, res);
        });
        app.get(/^\/static\/backbone(\/.*)$/, function(req, res) {
            req.url = req.params[0];
            CONNECT.static(MAPPINGS.resolve("ui-backbone"))(req, res);
        });
        app.get(/^\/static\/jquery\.js$/, function(req, res) {
            req.url = "/response-body";
            CONNECT.static(MAPPINGS.resolve("ui-jquery"))(req, res);
        });

        app.get(/^\/static\/ui(?:\.js)?(\/.*)?$/, BUNDLER.hoist(options.clientPackage, {
            distributionBasePath: options.distPath,
            packageIdHashSeed: "__DEVCOMP_PORTAL__",
            bundleLoader: true
        }));
        
        app.get(/^\//, CONNECT.static(options.pages));
    }));

    var io = SOCKET_IO.listen(server);
    
    server.listen(options.port, "127.0.0.1");

    console.log("DeveloperCompanion Portal Server running at http://127.0.0.1:" + options.port + "/");
    

    
    // Tests

    var engine = new QL_IO_ENGINE({
        connection: "close"
    });

    var script = "create table geocoder " +
                 "  on select get from 'http://maps.googleapis.com/maps/api/geocode/json?address={address}&sensor=true' " +
                 "     resultset 'results.geometry.location'" +
                 "select lat as lattitude, lng as longitude from geocoder where address='Mt. Everest'";

    io.sockets.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });

        socket.on('my other event', function (data) {
            console.log(data);
        });
        
        engine.execute(script, function(emitter) {
            emitter.on("end", function(err, res) {
                console.log(res.body[0]);

                socket.emit('news', res.body[0]);
            });
        });    
    });
}
