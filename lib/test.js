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
// CommonJS Unit Testing/1.0
// see: http://wiki.commonjs.org/wiki/Unit_Testing 
//----------------------------------------------------------------------------

var test = exports
var system = require("system")
var assert = require("assert")

require("es5-compat")

//----------------------------------------------------------------------------
// test objects are used throughout this module.  A test object models an 
// individual test function and has the following properties:
//
//    name:      name of the test function 
//    func:      the actual test function
//    container: object that contains the test function
//    state:     state of the test ("waiting", "passed", "failed", "exception")
//    exception: exception that occurred while running the test
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// a testContainer can contain a property called logger.  The logger object
// will be sent the following methodsmethods:
//    beforeAll(tests) - called before running all tests
//    afterAll(tests)  - called after  running all tests
//    beforeOne(test)  - called before running a single test 
//    afterOne(test)   - called after  running a single test 
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
test.run = function(testContainer) {
    if (typeof(testContainer) != "object") {
        throw new Error("expecting an objects as the first parameter")
    }
    
    var errors = 0
    var tests  = collectTests(testContainer)
    var logger = getLogger(testContainer.logger)

    logger.beforeAll(tests)
    
    tests.forEach(function(test) {
        logger.beforeOne(test)
        
        try {
            test.func.call(test.container)
            test.state = "passed"
        }
        catch (e) {
            test.exception = e
            errors += 1
            
            if (e instanceof assert.AssertionError) {
                test.state = "failed"
            }
            else {
                test.state = "exception"
            }
        }
        
        logger.afterOne(test)
    })
    
    logger.afterAll(tests)
    
    return errors
}

//----------------------------------------------------------------------------
// recurse through testContainer, looking for tests.
// returns array of test objects
//----------------------------------------------------------------------------
function collectTests(testContainer, namePrefix, tests) {
    if (!namePrefix) namePrefix = ""
    if (!tests)      tests = []
    
    for (var propertyName in testContainer) {
        if (!propertyName.match(/^test.+/)) continue

        var propertyValue = testContainer[propertyName]
        var prefixedName  = buildPrefixedName(namePrefix, propertyName)
        
        if (typeof(propertyValue) == "function") {
            tests.push({
                name:      prefixedName,
                func:      propertyValue,
                container: testContainer,
                state:     "waiting",
                exception: undefined
            })
        }
    }
    
    for (var propertyName in testContainer) {
        if (!propertyName.match(/^test.+/)) continue

        var propertyValue = testContainer[propertyName]
        var prefixedName  = buildPrefixedName(namePrefix, propertyName)
        
        if (typeof(propertyValue) != "function") {
            collectTests(propertyValue, prefixedName, tests)
        }
    }
    
    return tests
}

//----------------------------------------------------------------------------
function getLogger(logger) {
    var newLogger = {}

    if (logger) {
        if (typeof logger != "object") throw new Error("logger expected to be an object")
    }

    addDelegatedMethod(newLogger, logger, "beforeAll")
    addDelegatedMethod(newLogger, logger, "afterAll")
    addDelegatedMethod(newLogger, logger, "beforeOne")
    addDelegatedMethod(newLogger, logger, "afterOne")
    
    return newLogger
}

//----------------------------------------------------------------------------
function addDelegatedMethod(targetObject, sourceObject, methodName) {
    targetObject[methodName] = function() {
        if (!sourceObject) return
        
        var method = sourceObject[methodName]
        
        if (!method) return
        if ("function" != typeof method) return
        
        var args = Array.prototype.slice.call(arguments)
        return method.apply(sourceObject, args)
    }
}

//----------------------------------------------------------------------------
function buildPrefixedName(prefix, name) {
    if (!prefix) return name
    return prefix + ":" + name
}
