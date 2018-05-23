import { getAuthor, getAvatar, getAuthors } from '../getAuthors';
import { SpecificationData } from '../../types';

describe('getAuthors', () => {
  it('works with arrays of strings', () => {
    const authors = ['apple', 'google'];

    expect(getAuthors({ authors } as SpecificationData)).toEqual([
      { name: 'apple' },
      { name: 'google' },
    ]);
  });

  it('works with arrays of objects and strings', () => {
    const authors = [
      'Dustin Voss',
      {
        'Robbie Hanson': 'robbiehanson@deusty.com',
      },
    ];

    expect(getAuthors({ authors } as SpecificationData)).toEqual([
      {
        name: 'Dustin Voss',
      },
      {
        name: 'Robbie Hanson',
        email: 'robbiehanson@deusty.com',
        avatar: expect.any(String),
      },
    ]);
  });

  it('works with objects', () => {
    const authors = {
      'Dustin Voss': 'dustins@email.com',
      'Robbie Hanson': 'robbiehanson@deusty.com',
    };

    // @ts-ignore not actually sure how to type this correctly ({name: email}, {name, email},string, mixed[])
    expect(getAuthors({ authors } as SpecificationData)).toEqual([
      {
        name: 'Dustin Voss',
        email: 'dustins@email.com',
        avatar: expect.any(String),
      },
      {
        name: 'Robbie Hanson',
        email: 'robbiehanson@deusty.com',
        avatar: expect.any(String),
      },
    ]);
  });
});

describe('getAuthor', () => {
  it('flips keys around', () => {
    const author = {
      Haroen: 'hello@haroen.me',
    };

    expect(getAuthor(author)[0]).toEqual({
      avatar: expect.any(String),
      email: 'hello@haroen.me',
      name: 'Haroen',
    });
  });

  it('ignores undefined', () => {
    expect(getAuthor(undefined)).toEqual([]);
  });
});

describe('getAvatar', () => {
  it('ignores non-emails', () => {
    ['', 'hello <at> haroen.me', '666'].forEach(badEmail =>
      expect(getAvatar(badEmail)).toBe(undefined)
    );
  });

  it('hashes an email and gives a gravatar url', () => {
    expect(getAvatar('hello@haroen.me')).toEqual({
      avatar: 'https://gravatar.com/avatar/2b75707b777becc1c837c8cd935e696a',
    });
  });
});
