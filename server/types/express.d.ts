import type { Types } from 'mongoose';

/** Fields available on req.user after passport deserialization */
interface AuthUser {
  _id: Types.ObjectId;
  /** String representation of _id (Mongoose virtual — may be undefined in type, always present at runtime) */
  id?: string;
  fullName: string;
  email: string;
  password: string;
  profilePicture?: string | null;
  favorites: Types.ObjectId[];
  lastActiveAt?: Date | null;
  userCreatedAt: Date;
  isEmailVerified: boolean;
}

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AuthUser {}
  }
}
