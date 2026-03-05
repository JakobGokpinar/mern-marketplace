import { useAppSelector, useAppDispatch } from '../store/hooks';
import { sendLoginRequest, sendSignUpRequest, logoutRequest } from '../store/authThunks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const login = (credentials: { email: string; password: string }) =>
    dispatch(sendLoginRequest(credentials));

  const signup = (userData: { name: string; lastname: string; email: string; password: string }) =>
    dispatch(sendSignUpRequest(userData));

  const logout = () => dispatch(logoutRequest());

  return { user, isLoggedIn, login, signup, logout };
};
