# Browserify Build Status

[ ![Codeship Status for tqc/browserify-build-status](https://codeship.com/projects/f095f840-7927-0133-491f-2292869b3ab0/status?branch=master)](https://codeship.com/projects/118681)

Display browserify build status on the output page.

##Usage:

    var statusReporter = require("browserify-build-status");
    var b = browserify(...)
    // plugin adds error handlers to the browserify object
    b.plugin(statusReporter, opts);
    b = b.bundle()
    // writeFile sets the "build incomplete" message and waits for 
    // browserify to finish before writing either the finished build 
    // output or an error message.
    b = b.pipe(statusReporter.writeFile("app.js"));

## Default options

    {
        // selector for the element that will be updated with any error message
        selector: "body"
    }


[Demo](http://tqc.github.io/browserify-build-status)
