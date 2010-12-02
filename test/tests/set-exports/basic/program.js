var test = require('test');
var foo = require('foo');
test.assert(foo == 234, 'basic use of "module.exports = ..."');
test.print('DONE', 'info');
