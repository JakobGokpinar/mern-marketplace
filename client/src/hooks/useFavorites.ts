import { useMutation } from '@tanstack/react-query';
import { addToFavoritesApi, removeFromFavoritesApi } from '../services/favoriteService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { userActions } from '../store/userSlice';
import { uiSliceActions } from '../store/uiSlice';
import type { User } from '../types/user';

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user) as User | Record<string, never>;

  const addMutation = useMutation({
    mutationFn: addToFavoritesApi,
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: data.message }));
    },
    onError: () => {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Kunne ikke lagre favoritt' }));
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFavoritesApi,
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'info', msg: data.message }));
    },
    onError: () => {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Kunne ikke fjerne favoritt' }));
    },
  });

  const toggleFavorite = (id: string, isFavorite: boolean) => {
    if (isFavorite) {
      removeMutation.mutate(id);
    } else {
      addMutation.mutate(id);
    }
  };

  const isInFavorites = (id: string): boolean => {
    const favorites = ('favorites' in user) ? (user as User).favorites : [];
    return favorites.includes(id);
  };

  const isLoading = addMutation.isPending || removeMutation.isPending;

  return { toggleFavorite, isLoading, isInFavorites };
};
