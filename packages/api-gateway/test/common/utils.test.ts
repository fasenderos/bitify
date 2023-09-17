import { test } from 'tap';
import { trim } from '../../src/common/utils';

test('trim', ({ equal, same, end }) => {
  equal(trim(' foobar '), 'foobar');
  same(trim([' foobar ']), ['foobar']);
  same(trim({ foo: ' bar ' }), { foo: 'bar' });
  same(trim({ foo: ' bar ' }, 'foo'), { foo: ' bar ' });
  end();
});
