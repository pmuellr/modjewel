var test = require('test')

//------------------------------------------------------------------------------
test.assert(define.amd, "the amd property is available on define()")

//------------------------------------------------------------------------------
define("1/foo", { bar: true })

test.assert(require("1/foo").bar === true, "object as a module")

//------------------------------------------------------------------------------
define("2/foo", function() {
    return { baz: true }
})

test.assert(require("2/foo").baz === true, "object as a module via return")

//------------------------------------------------------------------------------
define("3/foo", ["exports"], function(exports) {
//    return { bam: true }
    exports.bam = true
})

define("3/bar", ["exports", "./foo"], function(exports, foo) {
    exports.bam = function bam() {
        return foo.bam
    }
})

test.assert(require("3/bar").bam() === true, "module pre-reqs")

//------------------------------------------------------------------------------
test.print('DONE', 'info')
