var fs = require("fs");
var path = require("path");
var stream = require('stream');

function statusReporter(b, opts) {
    var bundle = b.bundle;
    opts = opts || {};
    var selector = opts.selector || "body";

    function getErrorScript(title, msg, source, detail) {
        var errorReporter = fs.readFileSync(path.resolve(__dirname, "./reporterror.js"), "utf-8");

        errorReporter = errorReporter.replace("\"[SELECTOR]\"", JSON.stringify(selector));
        errorReporter = errorReporter.replace("\"[TITLE]\"", JSON.stringify(title || "Error"));
        errorReporter = errorReporter.replace("\"[MESSAGE]\"", JSON.stringify(msg || "Something went wrong"));
        errorReporter = errorReporter.replace("\"[SOURCE]\"", JSON.stringify(source || ""));
        errorReporter = errorReporter.replace("\"[DETAIL]\"", JSON.stringify(detail || ""));
        return errorReporter;
    }

    b.bundle = function(cb) {
        var output = new stream.Transform();
        output._transform = function(chunk, enc, callback) {
            callback(null, chunk);
        };
        var pipeline = bundle.call(b, cb);

        pipeline.on('error', function(err) {
            // module-deps likes to emit each error
            console.error('Browserify error: %s', err);
        });
        pipeline.once('error', function(err) {
            var msg = err.message;
            var source = "";
            var detail = "";

            var m = /(.*):(\d+):(\d+): (.*)/.exec(msg);
            if (m && m.length >= 5) {
                msg = m[4];
                var fn = m[1];
                var errorLine = parseInt(m[2]);
                source = m[1] + ":" + m[2] + ":" + m[3];
                detail = "";

                var sc = fs.readFileSync(fn, "utf-8").split("\n");
                for (var i2 = errorLine - 4; i2 < errorLine + 3; i2++) {
                    var l = sc[i2];
                    if (l === undefined) continue;
                    detail += l + "\n";
                }

            }

            output.push(getErrorScript("BuildError", msg, source, detail));
            output.push(null);
            pipeline.unpipe(output);
        });

        pipeline.pipe(output);
        return output;
    };


    this.writeFile = function(outputFile) {
        console.log("writing progress file");
        fs.writeFileSync(outputFile, getErrorScript("Build Incomplete", "Browserify build in progress - try again in a few seconds."));
        var buffer = "";
        var writer = new stream.Writable();
        
        writer._write = function(chunk, enc, next) {
            buffer += chunk;
            next();
        };
        
        writer.on("finish", function() {
            console.log("Finished writing file");
            fs.writeFileSync(outputFile, buffer);
        });

        return writer;

    }

    this.getErrorScript = getErrorScript;

    return this;
}

module.exports = statusReporter;
