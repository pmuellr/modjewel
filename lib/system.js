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

var system = exports

var oo = require("modjewels/oo")

//----------------------------------------------------------------------------
system.stdin  = new StdinStream()
system.stdout = new StdoutStream()
system.stderr = new StderrStream()

//----------------------------------------------------------------------------
system.env = {} 

//----------------------------------------------------------------------------
system.args = ["-"]

//----------------------------------------------------------------------------
system.print = function() {
    var data = Array.prototype.slice(arguments).join()
    system.stdout.print.call(system.stdout, data)
}

//----------------------------------------------------------------------------
system.log = function log(message, label) {
    if      (label == "log")   console.log(message)
    else if (label == "debug") console.debug(message)
    else if (label == "warn")  console.warn(message)
    else if (label == "error") console.error(message)
    else if (label == "pass")  console.log("PASS: " + message)
    else if (label == "fail")  console.log("FAIL: " + message)
}

//----------------------------------------------------------------------------
if (typeof require.implementation == "string") {
    system.platform = require.implementation
}

//----------------------------------------------------------------------------
system.global = window

//----------------------------------------------------------------------------
function Stream() {
    this.__closed = false
}

oo.addMethod(Stream, function isClosed() {
    return this.__closed
})

oo.addMethod(Stream, function __errorIfClosed() {
    if (!this.isClosed()) return
    throw new Error("stream is closed")
})

oo.addMethod(Stream, function read() {
    throw new Error("can't read from this stream")
})

oo.addMethod(Stream, function write(data) {
    throw new Error("can't write to this stream")
})

oo.addMethod(Stream, function print(data) {
    this.write(data)
})

oo.addMethod(Stream, function flush() {
})

oo.addMethod(Stream, function close() {
    this.__closed = true
})

//----------------------------------------------------------------------------
function StdinStream() {
    this.$super()
}

oo.extend(StdinStream, Stream)

oo.addMethod(StdinStream, function read() {
    return prompt("Program reading from stdin", "")
})

//----------------------------------------------------------------------------
function StdoutStream() {
    this.$super()
}

oo.extend(StdoutStream, Stream)

oo.addMethod(StdoutStream, function write(data) {
    console.log(data)
})


//----------------------------------------------------------------------------
function StderrStream() {
    this.$super()
}

oo.extend(StderrStream, Stream)

oo.addMethod(StderrStream, function write(data) {
    console.error(data)
})

