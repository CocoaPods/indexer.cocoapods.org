import { getLicense } from '../getLicense';
import { SpecificationData } from '../../types';

it('keeps strings as is', () => {
  const spec = { license: 'hello there' } as SpecificationData;
  expect(getLicense(spec)).toBe('hello there');
});

it('picks the `name` of objects', () => {
  const spec = { license: { name: 'MIT or something' } } as SpecificationData;
  expect(getLicense(spec)).toBe('MIT or something');
});
