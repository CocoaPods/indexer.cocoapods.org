import { getAuthor, getAvatar } from '../getAuthors';

describe('getAuthor', () => {
  it('flips keys around', () => {
    const author = {
      Haroen: 'hello@haroen.me',
    };

    expect(getAuthor(author)).toEqual({
      avatar: expect.any(String),
      email: 'hello@haroen.me',
      name: 'Haroen',
    });
  });

  it('ignores undefined', () => {
    expect(getAuthor(undefined)).toBe(undefined);
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
