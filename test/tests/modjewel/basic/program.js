var test = require('test')

var foo = require('foo')
var bar = require('bar')

var modjewel = require("modjewel")

//------------------------------------------------------------------------------
test.assert("string" == typeof(modjewel.VERSION), "modjewel.VERSION is a string")

//------------------------------------------------------------------------------
var loadedModules = modjewel.getLoadedModuleIds()
var expected = '["program","test","foo","bar","modjewel"]'
var actual   = JSON.stringify(loadedModules)

test.assert(expected == actual, "modjewel.getLoadedModuleIds() returned expected results")

//------------------------------------------------------------------------------
var preloadedModules = modjewel.getPreloadedModuleIds()

var expected = '["modjewel","assert","bar","foo","program","system","test"]'
var actual   = JSON.stringify(preloadedModules)

test.assert(expected == actual, "modjewel.getPreLoadedModuleIds() returned expected results")

//------------------------------------------------------------------------------
var module_foo = modjewel.getModule("foo")
var module_bar = modjewel.getModule("bar")

test.assert(module_foo.id == "foo", "modjewel.getModule('foo') returned expected results")
test.assert(module_bar.id == "bar", "modjewel.getModule('bar') returned expected results")

//------------------------------------------------------------------------------
var required_foo  = JSON.stringify(modjewel.getModuleIdsRequired("foo"))
var required_bar  = JSON.stringify(modjewel.getModuleIdsRequired("bar"))
var required_nope = JSON.stringify(modjewel.getModuleIdsRequired("nope"))
var required_main = JSON.stringify(modjewel.getModuleIdsRequired())

var expected_required_foo  = '["bar"]'
var expected_required_bar  = '["foo"]'
var expected_required_nope = 'null'
var expected_required_main = '["program"]'

test.assert(expected_required_foo  == required_foo,  "modjewel.getModuleIdsRequired('foo') returned expected results")
test.assert(expected_required_bar  == required_bar,  "modjewel.getModuleIdsRequired('bar') returned expected results")
test.assert(expected_required_nope == required_nope, "modjewel.getModuleIdsRequired('nope') returned expected results")
test.assert(expected_required_main == required_main, "modjewel.getModuleIdsRequired() returned expected results")
    
//------------------------------------------------------------------------------
test.assert(!modjewel.warnOnRecursiveRequire(), "modjewel.warnOnRecursiveRequire() is false by default")
modjewel.warnOnRecursiveRequire(true)
test.assert(modjewel.warnOnRecursiveRequire(),  "modjewel.warnOnRecursiveRequire() can be set to true")

//------------------------------------------------------------------------------
test.print('DONE', 'info')
