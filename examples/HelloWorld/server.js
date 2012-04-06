
const PATH = require("path");
const PORTAL = require("devcomp-portal");

PORTAL.start({
    port: 8080,
    pages: PATH.resolve(__dirname, "pages"),
    clientPackage: PATH.resolve(__dirname, "client"),
    distPath: PATH.resolve(__dirname, "dist")
});
