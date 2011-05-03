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
// globals
//----------------------------------------------------------------------------
var require
var modjewel

//----------------------------------------------------------------------------
// function wrapper
//----------------------------------------------------------------------------
(function(){

//----------------------------------------------------------------------------
// some constants
//----------------------------------------------------------------------------
var PROGRAM = "modjewel"
var VERSION = "1.1.0"

//----------------------------------------------------------------------------
// if require() is already defined, leave
//----------------------------------------------------------------------------
if (modjewel) {
    log("modjewel global variable already defined")
    return
}

var OriginalRequire = require
var NoConflict      = false

//----------------------------------------------------------------------------
// "globals" (local to this function scope though)
//----------------------------------------------------------------------------
var ModuleStore
var ModulePreloadStore
var MainModule
var WarnOnRecursiveRequire = false

//----------------------------------------------------------------------------
// the require function
//----------------------------------------------------------------------------
function get_require(currentModule) {
    var result = function require(moduleId) {

        if (moduleId.match(/^\.{1,2}\//)) {
            moduleId = normalize(currentModule, moduleId)
        }

        if (hop(ModuleStore, moduleId)) {
            var module = ModuleStore[moduleId]
            if (module.__isLoading) {
                if (WarnOnRecursiveRequire) {
                    var fromModule = currentModule ? currentModule.id : "<root>" 
                    console.log("module '" + moduleId + "' recursively require()d from '" + fromModule + "', problem?")
                }
            }
            
            currentModule.moduleIdsRequired.push(moduleId)
            
            return module.exports
        }

        if (!hop(ModulePreloadStore, moduleId)) {
            var fromModule = currentModule ? currentModule.id : "<root>" 
            error("module '" + moduleId + "' not found from '" + fromModule + "', must be preloaded")
        }
        
        var moduleDefFunction = ModulePreloadStore[moduleId]

        var module = create_module(moduleId)

        var newRequire = get_require(module) 

        ModuleStore[moduleId] = module
        
        module.__isLoading = true
        try {
            currentModule.moduleIdsRequired.push(moduleId)
            
            moduleDefFunction.call(null, newRequire, module.exports, module)
        }
        finally {
            module.__isLoading = false
        }
        
        return module.exports
    }
    
    result.define         = require_define
    result.implementation = PROGRAM
    result.version        = VERSION
    
    return result
}

//----------------------------------------------------------------------------
// shorter version of hasOwnProperty
//----------------------------------------------------------------------------
function hop(object, name) {
    return Object.prototype.hasOwnProperty.call(object, name)
}

//----------------------------------------------------------------------------
// create a new module
//----------------------------------------------------------------------------
function create_module(id) {
    return { 
        id:                id, 
        uri:               id, 
        exports:           {},
        moduleIdsRequired: []
    }
}

//----------------------------------------------------------------------------
// reset the stores
//----------------------------------------------------------------------------
function require_reset() {
    ModuleStore        = {}
    ModulePreloadStore = {}
    MainModule         = create_module(null)
    
    require = get_require(MainModule)
    
    require.define({modjewel: modjewel_module})
    
    modjewel = require("modjewel")
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
            console.log("require.define(): moduleName in moduleSet must not start with '.': '" + moduleName + "'")
            return
        }
        
        var moduleDefFunction = moduleSet[moduleName]
        
        if (typeof moduleDefFunction != "function") {
            console.log("require.define(): expecting a function as value of '" + moduleName + "' in moduleSet")
            return
        }
        
        if (hop(ModulePreloadStore, moduleName)) {
            console.log("require.define(): module '" + moduleName + "' has already been preloaded")
            return
        }

        ModulePreloadStore[moduleName] = moduleDefFunction
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
// get a list of loaded modules
//----------------------------------------------------------------------------
function modjewel_getLoadedModuleIds() {
    var result = []
    
    for (moduleId in ModuleStore) {
        result.push(moduleId)
    }
    
    return result
}

//----------------------------------------------------------------------------
// get a list of the preloaded module ids
//----------------------------------------------------------------------------
function modjewel_getPreloadedModuleIds() {
    var result = []
    
    for (moduleId in ModulePreloadStore) {
        result.push(moduleId)
    }
    
    return result
}

//----------------------------------------------------------------------------
// get a module by module id
//----------------------------------------------------------------------------
function modjewel_getModule(moduleId) {
    if (null == moduleId) return MainModule
    
    return ModuleStore[moduleId]
}

//----------------------------------------------------------------------------
// get a list of module ids which have been required by the specified module id
//----------------------------------------------------------------------------
function modjewel_getModuleIdsRequired(moduleId) {
    var module = modjewel_getModule(moduleId)
    if (null == module) return null
    
    return module.moduleIdsRequired.slice()
}

//----------------------------------------------------------------------------
// set the WarnOnRecursiveRequireFlag
// - if you make use of "module.exports =" in your code, you will want this on
//----------------------------------------------------------------------------
function modjewel_warnOnRecursiveRequire(value) {
    if (arguments.length == 0) return WarnOnRecursiveRequire
    WarnOnRecursiveRequire = !!value
}

//----------------------------------------------------------------------------
// relinquish modjewel's control of the require variable
// - like jQuery's version'
//----------------------------------------------------------------------------
function modjewel_noConflict() {
    NoConflict = true
    
    require = OriginalRequire
}

//----------------------------------------------------------------------------
// the modjewel module
//----------------------------------------------------------------------------
function modjewel_module(require, exports, module) {
    exports.VERSION                = VERSION
    exports.require                = require
    exports.define                 = require.define
    exports.getLoadedModuleIds     = modjewel_getLoadedModuleIds
    exports.getPreloadedModuleIds  = modjewel_getPreloadedModuleIds
    exports.getModule              = modjewel_getModule
    exports.getModuleIdsRequired   = modjewel_getModuleIdsRequired
    exports.warnOnRecursiveRequire = modjewel_warnOnRecursiveRequire
    exports.noConflict             = modjewel_noConflict
}

//----------------------------------------------------------------------------
// log a message
//----------------------------------------------------------------------------
function log(message) {
    console.log("modjewel: " + message)
}

//----------------------------------------------------------------------------
// make the require function a global
//----------------------------------------------------------------------------
require_reset()

//----------------------------------------------------------------------------
})();

