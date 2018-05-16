import gravatarUrl from 'gravatar-url';
import { SpecificationData } from '../types';

export function getAuthors({ authors }: SpecificationData) {
  if (typeof authors === 'string') {
    const [name, email] = authors.split(' => '); // can also be a ruby hash (should be fixed in the DB)
    return [{ name, email, ...getAvatar(email) }];
  }
  if (Array.isArray(authors)) {
    return authors.map(author => getAuthor(author));
  }
  return [getAuthor(authors)];
}

export function getAuthor(author?: { [name: string]: string }) {
  return Object.entries(author || {}).map(([name, email]) => ({
    name,
    email,
    ...getAvatar(email),
  }))[0];
}

export function getAvatar(email: string = '') {
  if (email && email.includes('@')) {
    return { avatar: gravatarUrl(email) };
  }
}
