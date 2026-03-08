import { favoriteBody } from '../modules/user/user.schema';
import { createRoom, newMessage, resetUnread } from '../modules/chat/chat.schema';
import { verifyEmail } from '../modules/auth/auth.schema';
import { findUserQuery, updateUserInfo } from '../modules/user/user.schema';

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
  it('accepts valid fullName', () => {
    expect(() => updateUserInfo.parse({ fullName: 'Jakob Gokpinar' })).not.toThrow();
  });

  it('rejects empty fullName', () => {
    expect(() => updateUserInfo.parse({ fullName: '' })).toThrow();
  });

  it('rejects too long fullName', () => {
    expect(() => updateUserInfo.parse({ fullName: 'a'.repeat(201) })).toThrow();
  });
});

describe('user schema', () => {
  it('accepts valid id param', () => {
    expect(() => findUserQuery.parse({ id: validId })).not.toThrow();
  });

  it('rejects invalid id', () => {
    expect(() => findUserQuery.parse({ id: '123' })).toThrow();
  });
});
