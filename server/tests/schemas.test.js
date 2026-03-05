import { favoriteBody } from '../schemas/favorites.schema.js';
import { createRoom, newMessage, resetUnread } from '../schemas/chat.schema.js';
import { verifyEmail } from '../schemas/email.schema.js';
import { updateUserInfo } from '../schemas/profile.schema.js';
import { findUserQuery } from '../schemas/user.schema.js';

const validId = '507f1f77bcf86cd799439011';

describe('favorites schema', () => {
  it('accepts valid ObjectId', () => {
    expect(() => favoriteBody.parse({ id: validId })).not.toThrow();
  });

  it('rejects invalid ObjectId', () => {
    expect(() => favoriteBody.parse({ id: 'not-an-id' })).toThrow();
  });

  it('rejects missing id', () => {
    expect(() => favoriteBody.parse({})).toThrow();
  });
});

describe('chat schemas', () => {
  it('createRoom accepts valid data', () => {
    expect(() => createRoom.parse({
      buyer: validId,
      seller: validId,
      product_id: validId,
    })).not.toThrow();
  });

  it('createRoom rejects missing fields', () => {
    expect(() => createRoom.parse({ buyer: validId })).toThrow();
  });

  it('newMessage accepts valid data', () => {
    expect(() => newMessage.parse({ roomId: validId, msg: 'Hello' })).not.toThrow();
  });

  it('newMessage rejects empty message', () => {
    expect(() => newMessage.parse({ roomId: validId, msg: '' })).toThrow();
  });

  it('newMessage rejects too long message', () => {
    expect(() => newMessage.parse({ roomId: validId, msg: 'a'.repeat(5001) })).toThrow();
  });

  it('resetUnread accepts valid roomId', () => {
    expect(() => resetUnread.parse({ roomId: validId })).not.toThrow();
  });
});

describe('email schema', () => {
  it('accepts valid userId and UUID token', () => {
    expect(() => verifyEmail.parse({
      userId: validId,
      token: '550e8400-e29b-41d4-a716-446655440000',
    })).not.toThrow();
  });

  it('rejects non-UUID token', () => {
    expect(() => verifyEmail.parse({
      userId: validId,
      token: 'not-a-uuid',
    })).toThrow();
  });
});

describe('profile schema', () => {
  it('accepts valid name and lastname', () => {
    expect(() => updateUserInfo.parse({ name: 'Jakob', lastname: 'G' })).not.toThrow();
  });

  it('rejects empty name', () => {
    expect(() => updateUserInfo.parse({ name: '', lastname: 'G' })).toThrow();
  });

  it('rejects too long name', () => {
    expect(() => updateUserInfo.parse({ name: 'a'.repeat(101), lastname: 'G' })).toThrow();
  });
});

describe('user schema', () => {
  it('accepts valid userId query', () => {
    expect(() => findUserQuery.parse({ userId: validId })).not.toThrow();
  });

  it('rejects invalid userId', () => {
    expect(() => findUserQuery.parse({ userId: '123' })).toThrow();
  });
});
