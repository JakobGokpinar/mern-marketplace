export interface User {
  _id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  isEmailVerified?: boolean;
  profilePicture?: string;
  favorites: string[];
  lastActive?: string;
  lastActiveAt?: string;
  userCreatedAt?: string;
  createdAt?: string;
}
