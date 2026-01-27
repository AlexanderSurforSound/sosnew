import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    error,
    refetch,
  } = useQuery({
    queryKey: ['owner-user'],
    queryFn: () => api.getMe(),
    enabled: isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    api.getToken().then((token) => {
      setIsInitialized(true);
    });
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['owner-user'], data.user);
    },
  });

  const logout = useCallback(async () => {
    await api.logout();
    queryClient.setQueryData(['owner-user'], null);
    queryClient.invalidateQueries({ queryKey: ['owner-user'] });
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      return loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  return {
    user,
    isLoading: !isInitialized || isLoadingUser,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refetch,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
