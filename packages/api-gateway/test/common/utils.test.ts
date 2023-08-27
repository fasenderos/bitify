import { test } from 'tap';
import { trim } from '../../src/common/utils';

test('trim', ({ same, end }) => {
  same(trim(' foobar '), 'foobar');
  same(trim([' foobar ']), ['foobar']);
  same(trim({ foo: ' bar ' }), { foo: 'bar' });
  same(trim({ foo: ' bar ' }, 'foo'), { foo: ' bar ' });
  same(true, true);
  same(null, null);
  end();
});
