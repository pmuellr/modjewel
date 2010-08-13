modjewel
=================================

Summary
-------

The `modjewel-require.js` file provides a `require()` 
function for use with [CommonJS](http://commonjs.org/) modules, 
designed for use in web browsers.


Supported Interfaces
====================

[CommonJS Modules 1.1](http://wiki.commonjs.org/wiki/Modules/1.1)

Runs tests from the [commonjs project](http://github.com/commonjs).
Use the `test/run-tests.sh` file to run the tests.  The tests will run
in both the browser and command-line via Rhino.


Extensions
==========

module.setExport()
-------------------

See the [CommonJS wiki](http://wiki.commonjs.org/wiki/Modules/SetExports)
for more information.

require.define()
-----------------

This function allows you to "preload" a module.  In fact, this is the only way
to load modules - modules are never loaded dynamically.

The object passed to this function is described in the 
[Transport/D proposal](http://wiki.commonjs.org/wiki/Modules/Transport/D),
but the second parameter is ignored.


Contact
=======

Use the [modjewel project at github](http://github.com/pmuellr/modjewel)
for communication.
