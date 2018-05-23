import { SpecificationData } from '../types';

export function getAlternativeNames(
  { name }: SpecificationData,
  objectID: string
) {
  const specialChars = /[-_\/]/g;
  const concatenatedName = name ? name.replace(specialChars, '') : '';
  const splitName = name ? name.replace(specialChars, ' ') : '';
  const names = new Set([concatenatedName, splitName, objectID]);
  return Array.from(names);
}
