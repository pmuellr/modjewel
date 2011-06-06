modjewel
=================================

Summary
-------

The `modjewel-require.js` file provides `require()` and `define()`
functions for use with [CommonJS](http://commonjs.org/) modules, 
designed for use in web browsers.  The `define()` function is as
specified in [Asynchronous Module Definition](http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition)
(AMD).

Note that dynamic loading is not supported; see the note on `define()` below.


Supported Interfaces
====================

CommonJS Modules 1.1
--------------------

see: [http://wiki.commonjs.org/wiki/Modules/1.1](http://wiki.commonjs.org/wiki/Modules/1.1)

Runs tests from the [commonjs project](http://github.com/commonjs).
Use the `test/run-tests.sh` file to run the tests.  The tests will run
in both the browser and command-line via Rhino.

Unit Testing 1.0
----------------

see [http://wiki.commonjs.org/wiki/Unit_Testing/1.0](http://wiki.commonjs.org/wiki/Unit_Testing/1.0)

Note that one test failure is occurring with the assert tests.  Looks like
a bogus test to me.

System 1.0
----------

see [http://wiki.commonjs.org/wiki/System/1.0](http://wiki.commonjs.org/wiki/System/1.0)

This module is not really supported, but a system module is supplied with a
`print` method which will work in the browser and Rhino. 


Extensions
==========

define()
-----------------

This function allows you to "preload" a module.  In fact, this is the only way
to load modules - modules are never loaded dynamically.

The object passed to this function is described in 
[Asynchronous Module Definition](http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition).


The "modjewel" module
=====================

Using modjewel, you will have a free module available for you to `require()`,
with the module id `"modjewel"`.  This module exports the following 
properties and functions:

`VERSION`
-------

Returns the current version of modjewel.

`getLoadedModuleIds()`
----------------------

Returns an array of strings which are the module ids which have currently
been loaded.

`getPreloadedModuleIds()`
-------------------------

Returns an array of strings which are the module ids which have currently
been preloaded with the `require.define()` function.

`getModule(moduleId)`
---------------------

Returns the module with the specified moduleId.  Use `null` to get the
primordial `main` module.

`getModuleIdsRequired(moduleId)`
--------------------------------

Returns the module ids that the specified module `require()`'d.

`warnOnRecursiveRequire([value])`
--------------------------

Issue a warning if a module is being recursively required.  That is,
in the process of the module being loaded, if it requires a module
that in turn ends up requiring itself, a console message is generated
indicating this.

In general, you don't need to worry about this.  You *do* need to worry
about this if you make use of the `module.exports =` trick of changing
your module's exports value.  In this case, your new `exports` object
may not be set before another module needs it.  Using this flag will
warn you of such cases.  You may need to restructure your modules, or
change the order in which you set the `exports` object and make
`require()` calls.

Note that modjewel itself supports the `module.exports =` trick to
reassign a module's `export` value.  This is useful if you'd like to
export a single function or class from your module, so that clients
of the module don't need to further derference the `exports` object
to get at your goodies.

Utilities
==========

module2amd.py
--------------------

Convert CommonJS modules to AMD format.  It can also generate a HTML
test driver to test the modules in a browser.  It generates files named
`(original base name).amd.js` from files named `(original base name).js`.

The generated files have code prefixing and suffixing the original file
contents with a `define()` invocation.  The contents of the file
are otherwise unchanged, and the line numbers for the content will be the
same in both files.

Contact
=======

Use the [modjewel project at github](http://github.com/pmuellr/modjewel)
for communication.
