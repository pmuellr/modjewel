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

var assert = exports

//----------------------------------------------------------------------------
function AssertionError(parms) {
    this.message  = parms.message
    this.actual   = parms.actual
    this.expected = parms.expected
}

assert.AssertionError = AssertionError

var T = function() {}
T.prototype = Error.prototype
AssertionError.prototype = new T()

//----------------------------------------------------------------------------
assert.ok = function ok(guard, message) {
    return assert.equal(true, !!guard, message)
}

//----------------------------------------------------------------------------
assert.equal = function equal(actual, expected, message) {
    if (actual == expected) return
    if (!message) {
        message = buildMessage("actual did not equal expected", actual, expected)
    }
    
    throw new AssertionError({message: message, actual: actual, expected: expected})
}

//----------------------------------------------------------------------------
assert.notEqual = function notEqual(actual, expected, message) {
    if (actual != expected) return
    if (!message) {
        message = buildMessage("actual equal to expected", actual, expected)
    }
    
    throw new AssertionError({message: message, actual: actual, expected: expected})
}

//----------------------------------------------------------------------------
assert.deepEqual = function deepEqual(actual, expected, message) {
    if (isDeepEqual(actual, expected)) return
    if (!message) {
        message = buildMessage("actual did not deepEqual expected", actual, expected)
    }
    
    throw new AssertionError({message: message, actual: actual, expected: expected})
}

//----------------------------------------------------------------------------
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected)) return
    if (!message) {
        message = buildMessage("actual deepEqual to expected", actual, expected)
    }
    
    throw new AssertionError({message: message, actual: actual, expected: expected})
}

//----------------------------------------------------------------------------
assert.strictEqual = function strictEqual(actual, expected, message) {
    if (actual === expected) return
    if (!message) {
        message = buildMessage("actual did not strict equal expected", actual, expected)
    }
    
    throw new AssertionError({message: message, actual: actual, expected: expected})
}

//----------------------------------------------------------------------------
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
    if (actual !== expected) return
    if (!message) {
        message = buildMessage("actual strictEqual to expected", actual, expected)
    }
    
    throw new AssertionError({message: message, actual: actual, expected: expected})
}

//----------------------------------------------------------------------------
assert["throws"] = function throwz(func, errorClass, message) {
    var caught
    
    try {
        func()
    }
    catch (e) {
        caught = e
    }

    if (!caught) {
        if (!message) {
            message = "no exception thrown"
        }
        throw new AssertionError({message: message, actual: null, expected: errorClass})
    }
    
    if (!errorClass) return
    
    if (caught instanceof errorClass) return
    
//    if (!message) {
//        message = "exception thrown not expected type; actual: [" + caught + "]; expected: [" + errorClass + "]"
//    }
//    throw new AssertionError({message: message, actual: caught, expected: errorClass})
    throw caught
}

//----------------------------------------------------------------------------
function buildMessage(text, actual, expected) {
    return text + "; actual: [" + actual + "]; expected: [" + expected + "]"
}

//----------------------------------------------------------------------------
function isDeepEqual(x, y) {
    
    // All identical values are equivalent, as determined by ===
    if (x === y) return true
    
    // If the expected value is a Date object, the actual value is equivalent 
    // if it is also a Date object that refers to the same time
    if ((x instanceof Date) && (y instanceof Date)) {
        return x.getTime() === y.getTime()
    }
    
    // Other pairs that do not both pass typeof value == "object", 
    // equivalence is determined by ==
    if ((typeof x != "object") && (typeof y != "object")) {
        return x == y
    }
    
    // mismatch, one object, one !object
    if ((typeof x != "object") || (typeof y != "object")) {
        return false
    }
    
    // equivalence is determined by 
    // - having the same number of owned properties,
    // - the same set of keys,
    // - equivalent values for every corresponding key, 
    // - an identical "prototype" property
    
    var xKeys = ownPropertyNames(x)
    var yKeys = ownPropertyNames(y)
    
    if (xKeys.length != yKeys.length) return false
    
    for (var i=0; i<xKeys.length; i++) {
        if (xKeys[i] != yKeys[i]) return false
        
        if (!isDeepEqual(x[xKeys[i]], y[yKeys[i]])) return false
    }
    
    if (x.prototype && y.prototype && (x.prototype !== y.prototype)) return false
    
    return true
}

//----------------------------------------------------------------------------
function ownPropertyNames(object) {
    var result = []
    
    for (var name in object)
        if (object.hasOwnProperty(name))
            result.push(name)
            
    result.sort()
    return result
}

