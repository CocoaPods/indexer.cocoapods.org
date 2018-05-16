import { SpecificationData } from '../types';

export function getLicense({ license }: SpecificationData) {
  return typeof license === 'string' || license === undefined
    ? license
    : license.name;
}
