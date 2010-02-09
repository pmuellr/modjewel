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
// function wrapper
//----------------------------------------------------------------------------
(function(){

//----------------------------------------------------------------------------
// some constants
//----------------------------------------------------------------------------
var PROGRAM = "modjewel"
var VERSION = "0.2.0"

//----------------------------------------------------------------------------
// if require() is already defined, leave
//----------------------------------------------------------------------------
if (window.require) {
    log("require() function already defined")
    return
}

//----------------------------------------------------------------------------
// a function to log a message; writes it to the console
//----------------------------------------------------------------------------
function log(message) {
    if (!message) message = ""
    
    console.log(PROGRAM + " " + VERSION + ": " + message)
}

//----------------------------------------------------------------------------
// retrieve a URL's content via HTTP GET
//----------------------------------------------------------------------------
function httpGet(url) {
	var xhr = new XMLHttpRequest()
	xhr.open("GET", url, false)
	xhr.send(null)
	
	// note, Chrome on Mac returns status=0 for file: URLs even if
	// they don't exist, breaking some tests in commonjs
	if ((xhr.status == 0) || (xhr.status == 200)) {
	    if (typeof xhr.responseText != "string") return undefined
    	return xhr.responseText
    }
}

//----------------------------------------------------------------------------
// strip leading chars
//----------------------------------------------------------------------------
function stripLeading(string, c) {
    var regex = new RegExp("^" + c + "+")
    return string.replace(regex, "")
}

//----------------------------------------------------------------------------
// strip trailing chars
//----------------------------------------------------------------------------
function stripTrailing(string, c) {
    var regex = new RegExp(c + "+$")
    return string.replace(regex, "")
}

//----------------------------------------------------------------------------
// join two parts of a URL
//----------------------------------------------------------------------------
function urlJoin(urlBase, urlPart) {
    return stripTrailing(urlBase, "/") + "/" + stripLeading(urlPart, "/")
}

//----------------------------------------------------------------------------
// retrieve a module's content
//----------------------------------------------------------------------------
function getModuleSource(uri) {
    for (var i=0; i<require.paths.length; i++) {
        var url = urlJoin(require.paths[i], uri)
        var contents = httpGet(url)
        if (contents != null) return {url: url, contents: contents}
    }
}

//----------------------------------------------------------------------------
// normalize a 'file name' with . and .. with a 'directory name'
//----------------------------------------------------------------------------
function normalize(dir, file) {
    var dirParts  = stripTrailing(dir, "/").split("/")
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
                throw new Error("Error normalizing '" + dir + "' and '" + file + "'")
            }
        }
        
        else {
            dirParts.push(filePart)
        }
    }
    
    return dirParts.join("/")
}

//----------------------------------------------------------------------------
// the require function
//----------------------------------------------------------------------------
function require(moduleId) {
    var origModuleId = moduleId
    
    if (moduleId.match(/^\.{1,2}\//)) {
        moduleId = normalize(require.__currentModulePath, moduleId)
    }
    
    var moduleUri = moduleId + ".js"

    if (require.__modules.hasOwnProperty(moduleUri)) {
        return require.__modules[moduleUri].exports
    }
    
    var originalModulePath = require.__currentModulePath
    require.__currentModulePath = moduleId.substring(0, moduleId.lastIndexOf('/')+1)
    
    var originalModule = require.__currentModule
    
    try {
        var moduleFunction
        var moduleSourceUri
        
        if (require.__preload.hasOwnProperty(moduleUri)) {
            moduleFunction  = require.__preload[moduleUri]
            moduleSourceUri = ""
        }
        else {
            var moduleSource = getModuleSource(moduleUri)
            if (moduleSource == null) {
                throw new Error("unable to load module " + origModuleId)
            }
            
            source = moduleSource.contents
            source += "\n//@ sourceURL=" + moduleUri
            moduleFunction = new Function("require", "exports", "module", source)
            moduleSourceUri = moduleSource.uri
        }

        function get_setExports(module) {
            return function getExports(object) {
                if (module != require.__currentModule) {
                    throw new Error("invalid call to require.setExports")
                }
                
                module.exports = object
            }
        }
        
        var context = {}
        var exports = {}
        var module = { 
            id:         moduleId, 
            uri:        moduleSourceUri, 
            exports:    exports
        }
        
        module.setExports = get_setExports(module)

        require.__modules[moduleUri] = module
        require.__currentModule = module
        
        moduleFunction.call(context, require, exports, module)
        
        return module.exports
    }
    
    finally {
        require.__currentModulePath = originalModulePath
        require.__currentModule     = originalModule
    }
}

//----------------------------------------------------------------------------
// make the require function a global
//----------------------------------------------------------------------------
window.require = require

//----------------------------------------------------------------------------
// set some version information
//----------------------------------------------------------------------------
require.implementation = PROGRAM
require.version        = VERSION

//----------------------------------------------------------------------------
// initialize require.paths
//----------------------------------------------------------------------------
require.paths = [""]

//----------------------------------------------------------------------------
// used by pre-built modules that can be included via <script src=>
//----------------------------------------------------------------------------
require.preload = function require_preload(moduleName, moduleDefFunction) {
    require.__preload[moduleName + ".js"] = moduleDefFunction
}

//----------------------------------------------------------------------------
// initialize internal stuff
//----------------------------------------------------------------------------
require.__currentModulePath = ""
require.__currentModule = undefined
require.__modules = {}
require.__preload = {}

//----------------------------------------------------------------------------
})()