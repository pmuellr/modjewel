//----------------------------------------------------------------------------
// The MIT License
// 
// Copyright (c) 2009, 2010 Patrick Mueller
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// an implementation of the require() function as specified for use with
// CommonJS Modules - see http://commonjs.org/specs/modules/1.0.html
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// inspired from David Flanagan's require() function documented here:
// http://www.davidflanagan.com/2009/11/a-module-loader.html
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// only supports "preloaded" modules ala require.define (Transport/D)
//    http://wiki.commonjs.org/wiki/Modules/Transport/D
// but only supports the first parameter
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// function wrapper
//----------------------------------------------------------------------------
(function(){

//----------------------------------------------------------------------------
// some constants
//----------------------------------------------------------------------------
var PROGRAM = "modjewel"
var VERSION = "0.3.0"

//----------------------------------------------------------------------------
// if require() is already defined, leave
//----------------------------------------------------------------------------
if (this.require) error("require already defined")

//----------------------------------------------------------------------------
// "globals" (local to this function scope though)
//----------------------------------------------------------------------------
var ModuleStore        = {}
var ModulePreloadStore = {}

//----------------------------------------------------------------------------
// the require function
//----------------------------------------------------------------------------
function get_require(currentModule) {
    var result = function require(moduleId) {

        if (moduleId.match(/^\.{1,2}\//)) {
            moduleId = normalize(currentModule, moduleId)
        }

        if (ModuleStore.hasOwnProperty("_" + moduleId)) {
            return ModuleStore["_" + moduleId].exports
        }

        if (!ModulePreloadStore.hasOwnProperty("_" + moduleId)) {
            error("module '" + moduleId + "' not found, must be preloaded")
        }
        
        var moduleDefFunction = ModulePreloadStore["_" + moduleId]

        var module = { 
            id:         moduleId, 
            uri:        moduleId, 
            exports:    {}
        }

        module.setExports = get_module_setExports(module)
        
        var newRequire            = get_require(module) 

        ModuleStore["_" + moduleId] = module
        
        moduleDefFunction.call({}, newRequire, module.exports, module)
        
        return module.exports
    }
    
    result.define         = require_define
    result.implementation = PROGRAM
    result.version        = VERSION
    
    return result
}

//----------------------------------------------------------------------------
// safe version of hasOwnProperty
//----------------------------------------------------------------------------
function hop(object, name) {
    return Object.prototype.hasOwnProperty.call(object, name)
}

//----------------------------------------------------------------------------
// used by pre-built modules that can be included via <script src=>
// a simplification of 
//    http://wiki.commonjs.org/wiki/Modules/Transport/D
// but only supports the first parameter
//----------------------------------------------------------------------------
function require_define(moduleSet) {
    for (var moduleName in moduleSet) {
        if (!hop(moduleSet, moduleName)) continue
        
        if (moduleName.match(/^\./)) {
            error("require.define(): moduleName in moduleSet must not start with '.': '" + moduleName + "'")
        }
        
        var moduleDefFunction = moduleSet[moduleName]
        
        if (typeof moduleDefFunction != "function") {
            error("require.define(): expecting a function as value of '" + moduleName + "' in moduleSet")
        }
        
        if (ModulePreloadStore.hasOwnProperty("_" + moduleName)) {
            error("require.define(): module '" + moduleName + "' has already been preloaded")
        }

        ModulePreloadStore["_" + moduleName] = moduleDefFunction
    }
}

//----------------------------------------------------------------------------
// gets a setExports function for a module
//----------------------------------------------------------------------------
function get_module_setExports(module) {
    return function setExports(object) {
        module.exports = object
    }
}

//----------------------------------------------------------------------------
// get the path of a module
//----------------------------------------------------------------------------
function getModulePath(module) {
    if (!module || !module.id) return ""
    
    var parts = module.id.split("/")
    
    return parts.slice(0, parts.length-1).join("/")
}

//----------------------------------------------------------------------------
// normalize a 'file name' with . and .. with a 'directory name'
//----------------------------------------------------------------------------
function normalize(module, file) {
    var dirParts  = getModulePath(module).split("/")
    var fileParts = file.split("/")
    
    for (var i=0; i<fileParts.length; i++) {
        var filePart = fileParts[i]
        
        if (filePart == ".") {
        }
        
        else if (filePart == "..") {
            if (dirParts.length > 0) {
                dirParts.pop()
            }
            else {
                error("error normalizing '" + dir + "' and '" + file + "'")
            }
        }
        
        else {
            dirParts.push(filePart)
        }
    }
    
    return dirParts.join("/")
}

//----------------------------------------------------------------------------
// throw an error
//----------------------------------------------------------------------------
function error(message) {
    throw new Error(PROGRAM + ": " + message)
}

//----------------------------------------------------------------------------
// make the require function a global
//----------------------------------------------------------------------------
this.require = get_require()


//----------------------------------------------------------------------------
})();

