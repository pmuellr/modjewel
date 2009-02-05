//-------------------------------------------------------------------
// ModJewel_require_x_y.js: a require() function for module support
//-------------------------------------------------------------------
// version: 0.1
// license:  WTFPL: http://sam.zoy.org/wtfpl/
// copyright (C) 2009 Patrick Mueller <pmuellr@yahoo.com> 
//-------------------------------------------------------------------
// This JavaScript file is intended to be included into an HTML page via
//    <script src="ModJewel_require_x_y.js"></script>
// It will add the require() object to your JavaScript environment,
// as "specified" here:
//    https://wiki.mozilla.org/ServerJS/Modules/SecurableModules
//-------------------------------------------------------------------

(function() {

//-------------------------------------------------------------------
// if require() is already defined, return
//-------------------------------------------------------------------
if ("require" in this) return

//-------------------------------------------------------------------
// define a container for our locals
//-------------------------------------------------------------------
var __locals__ = {}

//-------------------------------------------------------------------
// the version of require()
//-------------------------------------------------------------------
__locals__.version = "0.1"
	
//-------------------------------------------------------------------
// table of loaded modules; uri -> module
//-------------------------------------------------------------------
__locals__.loaded_modules = {}

//-------------------------------------------------------------------
// goop to wrap a module in
//-------------------------------------------------------------------
__locals__.wrapper_src = [
   	    "// module: %uri% ",
   	    "// ---- ",
   	    "",
   		"(function(exports) {",
   	    "//----------------------------------------------------------",               
   		"// ---- module body start",
   	    "//----------------------------------------------------------",
   	    "",
   		"%body%",
   	    "",
   	    "//----------------------------------------------------------",               
   		"// ---- module body end",
   	    "//----------------------------------------------------------",               
   		"})(__module__)"	               
   	].join("\n") 

//-------------------------------------------------------------------
// load a resource via XHR, synchronously
//-------------------------------------------------------------------
__locals__.load_resource = function(uri) {
	var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest()
	xhr.open("GET", uri, false)
	xhr.send(null)
	return xhr.responseText
}

//-------------------------------------------------------------------
// eval the module
//-------------------------------------------------------------------
__locals__.eval_module = function(__module__, __source__) {
    eval(__source__)
}

//-------------------------------------------------------------------
// load a module
//-------------------------------------------------------------------
require = function(uri) {
	
	// is module already loaded?
	var module = __locals__.loaded_modules[uri]
	if (module) return module

	// obtain the source for the module
	var module_src  = __locals__.load_resource(uri)

    // morph the module source
	var uri_pattern  = /%uri%/mg
	var body_pattern = /%body%/mg
	
	var gen_src = __locals__.wrapper_src.replace(uri_pattern, uri)
	gen_src = gen_src.replace(body_pattern, module_src)
	
	// create the module
	module = {
	    __meta__: {
	        uri: uri
	    }
    }
	
	// add the module to the table
	__locals__.loaded_modules[uri] = module
	
	// execute the morphed module source to define the module
	__locals__.eval_module(module, gen_src)
	
	// return the module
	return module
}

//-------------------------------------------------------------------
// property indicating the version
//-------------------------------------------------------------------
require.version = __locals__.version

//-------------------------------------------------------------------
// property which is a function which returns list of loaded modules
//-------------------------------------------------------------------
require.get_loaded_modules = function(uri) {
	var result = []
	for (var module_uri in loaded_modules) {
		var module = loaded_modules[module_uri]
		result.push(module)
	}
	return result
}


})()