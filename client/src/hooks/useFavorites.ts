import { useMutation } from '@tanstack/react-query';
import { addToFavoritesApi, removeFromFavoritesApi } from '../services/favoriteService';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { userActions } from '../store/userSlice';
export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  const addMutation = useMutation({
    mutationFn: addToFavoritesApi,
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      toast.success(data.message);
    },
    onError: () => {
      toast.error('Kunne ikke lagre favoritt');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFavoritesApi,
    onSuccess: (data) => {
      if (data.user) dispatch(userActions.setUser(data.user));
      toast(data.message);
    },
    onError: () => {
      toast.error('Kunne ikke fjerne favoritt');
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
    return user?.favorites?.includes(id) ?? false;
  };

  const isLoading = addMutation.isPending || removeMutation.isPending;

  return { toggleFavorite, isLoading, isInFavorites };
};
