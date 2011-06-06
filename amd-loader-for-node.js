//----------------------------------------------------------------------------
// Copyright (c) 2011 Patrick Mueller
// 
// The MIT License - see: http://www.opensource.org/licenses/mit-license.php
//----------------------------------------------------------------------------

var fs = require("fs")

// adds a new extension compiler, leave if not supported
if (!require.extensions) {
    throw new Error("this module expects require.extensions to exist")
}

// register the extension compiler
require.extensions[".amd"] = extensionCompiler

// the extension compiler
function extensionCompiler(module, filename) {
    var content = fs.readFileSync(filename, "utf8")
    content = wrapper(content)
    return module._compile(content, filename)
    
}

// the wrapper
function wrapper(source) {
    line = ";var define = require('" + module.id + "').getDefine(require, exports, module); "
    return line + source
}

// returns the define function
exports.getDefine = function getDefine(require, exports, module) {
    
    function defineImpl(moduleId, deps, factory) {
        var rem = ["require", "exports", "module"]

        if ((arguments.length < 1) || (arguments.length > 3)) {
            throw new Error("invalid arguments")
        }

        if (arguments.length == 1) {
            moduleId = null
            deps = rem.slice()
        }

        if (arguments.length == 2) {
            if (typeof moduleId == "string") {
                factory = deps
                deps    = rem.slice()
            }
            else {
                factory  = deps
                deps     = moduleId
                moduleId = null
            }
        }

        if (!deps) deps = []
        if (deps.length == 0) deps = rem.slice()
        
        var depModules = []
        for (var i=0; i<deps.length; i++) {
            var dep = deps[i]
            if      (dep == "require") depModules.push(require)
            else if (dep == "exports") depModules.push(exports)
            else if (dep == "module")  depModules.push(module)
            else                        depModules.push(require(dep))
        }
        
        if (typeof factory != "function") {
            module.exports = factory
        }
        else {
            var result = factory.apply(null, depModules)
            
            if (result) {
                module.exports = result
            }
        }
    }

    defineImpl.amd = true
    return defineImpl
}
