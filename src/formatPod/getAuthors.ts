import gravatarUrl from 'gravatar-url';
import { SpecificationData } from '../types';

const flatten = <T>(singlyNestedArray: T[][]) =>
  Array.prototype.concat(...singlyNestedArray);

interface Author {
  name: string;
  email?: string;
  avatar?: string;
}

export function getAuthors({ authors }: SpecificationData) {
  if (typeof authors === 'string') {
    const [name, email] = authors.split(' => '); // can also be a ruby hash (should be fixed in the DB)
    return [{ name, email, ...getAvatar(email) }];
  }
  if (Array.isArray(authors)) {
    const auth = flatten<Author>(authors.map(author => getAuthor(author)));
    return auth;
  }
  return [...getAuthor(authors)];
}

export function normalizeName(name: string) {
  switch (name) {
    case 'Google inc.': {
      return 'Google, inc.';
    }
    case 'Name': {
      return '';
    }
    default: {
      return name;
    }
  }
}

export function getAuthor(author?: { [name: string]: string } | string) {
  if (typeof author === 'string') {
    return [
      {
        name: normalizeName(author),
      },
    ];
  }
  return Object.entries(author || {}).map(([name, email]) => ({
    name: normalizeName(name),
    email,
    ...getAvatar(email),
  }));
}

export function getAvatar(email: string = '') {
  if (email && email.includes('@')) {
    return { avatar: gravatarUrl(email) };
  }
}
