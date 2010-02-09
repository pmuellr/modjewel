<style>
body {
    font-family: sans-serif;
}

pre {
    background-color: #EEE;
    margin-left:      2em;
    padding:          0.5em;
}
</style>

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

Runs tests from the [commonjs project](http://github.com/kriskowal/commonjs)


Extensions
==========

module.setExport()
-------------------

See the [CommonJS wiki](http://wiki.commonjs.org/wiki/Modules/SetExports)
for more information.

require.preload()
-----------------

This function allows you to "preload" a module, rather than have
the `require` function load it dynamically later when needed.  This
is particularly useful for browser usage, where you can create a
script from a CommonJS module which you can then use in a 
&lt;script src=&gt; element.

To use this facility, your module file needs to be 'wrapped'.  The
utility `js2mj.py` can convert a CommonJS module into a file
which can be used in a &lt;script src=&gt; element.

See the `tests/preload` directory for a test case / sample.


Contact
=======

Use the [modjewel project at github](http://github.com/pmuellr/modjewel)
for communication.
