'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, RegisterRequest } from '@/types';

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
    enabled: isInitialized && !!api.getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Check for existing token on mount
    const token = api.getToken();
    setIsInitialized(true);
    if (!token) {
      // No token, no need to fetch user
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => api.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const logout = useCallback(() => {
    api.logout();
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
    async (data: RegisterRequest) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  return {
    user: user as User | null | undefined,
    isLoading: !isInitialized || (!!api.getToken() && isLoadingUser),
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
