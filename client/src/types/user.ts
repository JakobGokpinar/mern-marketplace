export interface User {
  _id: string;
  name: string;
  lastname: string;
  username?: string;
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
