//----------------------------------------------------------------------------
// Copyright (c) 2010 Patrick Mueller
// 
// The MIT License - see: http://www.opensource.org/licenses/mit-license.php
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

var GLOBAL = this

//----------------------------------------------------------------------------
// some constants
//----------------------------------------------------------------------------
var PROGRAM = "modjewel"
var VERSION = "0.3.1"

//----------------------------------------------------------------------------
// if require() is already defined, leave
//----------------------------------------------------------------------------
if (GLOBAL.require) error("require already defined")

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

        var newRequire = get_require(module) 

        ModuleStore["_" + moduleId] = module
        
        module.__isLoading = true
        try {
            moduleDefFunction.call({}, newRequire, module.exports, module)
        }
        finally {
            module.__isLoading = false
        }
        
        return module.exports
    }
    
    result.reset          = require_reset
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
// reset the stores
//----------------------------------------------------------------------------
function require_reset() {
    ModuleStore        = {}
    ModulePreloadStore = {}
    
    GLOBAL.require = undefined
    GLOBAL.require = get_require()
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
    var modulePath = getModulePath(module)
    var dirParts   = ("" == modulePath) ? [] : modulePath.split("/")
    var fileParts  = file.split("/")
    
    for (var i=0; i<fileParts.length; i++) {
        var filePart = fileParts[i]
        
        if (filePart == ".") {
        }
        
        else if (filePart == "..") {
            if (dirParts.length > 0) {
                dirParts.pop()
            }
            else {
                // error("error normalizing '" + module + "' and '" + file + "'")
                // eat non-valid .. paths
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
require_reset()


//----------------------------------------------------------------------------
})();

