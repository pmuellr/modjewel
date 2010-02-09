var test = require('test');
var foo = require('foo');
test.assert(foo == 234, 'basic use of setExports works');
test.print('DONE', 'info');
