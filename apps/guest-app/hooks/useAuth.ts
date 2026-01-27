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
    queryKey: ['user'],
    queryFn: () => api.getMe(),
    enabled: isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Check for existing token on mount
    api.getToken().then((token) => {
      setIsInitialized(true);
    });
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => api.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const logout = useCallback(async () => {
    await api.logout();
    queryClient.setQueryData(['user'], null);
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      return loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  return {
    user,
    isLoading: !isInitialized || isLoadingUser,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    refetch,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
