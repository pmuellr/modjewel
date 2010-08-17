var test = require('test');
var foo = require('foo');

var threw = false
try {
    foo.foo()
}
catch (e) {
    threw = true
}

test.assert(threw === true, 'require.setExports() correctly threw exception when called out of place');

test.print('DONE', 'info');
