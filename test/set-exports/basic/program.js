var test = require('test');
var foo = require('foo');
test.print("foo: " + JSON.stringify(foo))
test.assert(foo == 234, 'basic use of setExports works');
test.print('DONE', 'info');
