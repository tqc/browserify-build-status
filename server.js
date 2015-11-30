var express = require("express");
var app = express();
app.use(express.static("build"));

var port = process.env.port || 5000;
console.log(port);
app.listen(port, function() {
    console.log("http server listening on " + port);
});
