//----------------------------------------------------------------------------
// The MIT License
// 
// Copyright (c) 2010 Patrick Mueller
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

var oo = exports

//-----------------------------------------------------------------------------
// some class-based OO stuff
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// add a function to an object
//-----------------------------------------------------------------------------
oo.addFunction = function addFunction(object, func) {
    if (typeof(object)    != "object")   throw new Error("first parameter must be an object")
    if (typeof(func)      != "function") throw new Error("second parameter must be a function")
    if (typeof(func.name) != "string")   throw new Error("second parameter must be a named function")
    
    object[func.name] = func
    
    return oo
}

//-----------------------------------------------------------------------------
// set a class's superclass
//-----------------------------------------------------------------------------
oo.addFunction(oo, function extend(clazz, superClazz) {
    if (typeof(clazz)      != "function") throw new Error("first parameter must be a function")
    if (typeof(superClazz) != "function") throw new Error("second parameter must be a function")
    
    function T() {}
    
    T.prototype                 = superClazz.prototype
    clazz.prototype             = new T()
    clazz.__superClass__        = superClazz
    clazz.prototype.constructor = clazz
    
    // not a great super, won't work nested > 2
    oo.addMethod(clazz, getSuperFunction(clazz))
    
    return oo
})

//-----------------------------------------------------------------------------
// add a method to a class
//-----------------------------------------------------------------------------
oo.addFunction(oo, function addMethod(clazz, method) {
    if (typeof(clazz)       != "function") throw new Error("first parameter must be a function")
    if (typeof(method)      != "function") throw new Error("second parameter must be a function")
    if (typeof(method.name) != "string")   throw new Error("second parameter must be a named function")
    
    oo.addFunction(clazz.prototype, method)

    method.__definedClass__ = clazz
    
    return oo
})

//-----------------------------------------------------------------------------
// add a static method to a class
//-----------------------------------------------------------------------------
oo.addFunction(oo, function addStaticMethod(clazz, method) {
    if (typeof(clazz)       != "function") throw new Error("first parameter must be a function")
    if (typeof(method)      != "function") throw new Error("second parameter must be a function")
    if (typeof(method.name) != "string")   throw new Error("second parameter must be a named function")
    
    oo.addFunction(clazz, method)
    
    method.__definedClass__ = clazz
    method.__isStatic__     = true
    
    return oo
})

//-----------------------------------------------------------------------------
// add a function to an object
//-----------------------------------------------------------------------------
oo.addFunction(oo, function exportSingletonClass(module, exports, func) {
    if (module.setExports) {
        module.setExports(func)
    }
    
    else {
        if ("string" != typeof func.name) throw new Error("function is unnamed")
        exports[func.name] = func
    }
})

//-----------------------------------------------------------------------------
// return a super() method
// 
// The super method is invoked with a method name and then the arguments to
// be passed to that method.  The method is looked up in the superclass's method
// hierarchy.  You can pass a named function instead of the method name.  If
// you call the method with null, it calls the superclass's constructor method.
//-----------------------------------------------------------------------------
function getSuperFunction(clazz) {
    return function $super(methodName) {
        var args = Array.prototype.slice.call(arguments, 1)

        var superClass = clazz.__superClass__
        if (!superClass) throw new Error("$super can't be use with this superclass")

        if (typeof methodName == "function") {
            methodName = methodName.name
            if (!methodName) throw new Error("first argument must be named function")
        }
        
        if (!methodName) 
            return superClass.apply(this, arguments)
            
        var method = superClass.prototype[methodName]
        if (typeof method != "function") throw new Error("$super called with method on superclass that doesn't exist")
            
        return method.apply(this, arguments)
    }
}

