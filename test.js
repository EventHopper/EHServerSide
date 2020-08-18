const test = require('ava');
const f = require('./testing');

test('foo', (t) => {
  t.pass();
});

test('bar', async(t) => {
  const bar = Promise.resolve('bar');
  t.is(await bar, 'bar');
});

test('thisWorks', (t) => {
  t.is(f('a'), f('b'));
});
