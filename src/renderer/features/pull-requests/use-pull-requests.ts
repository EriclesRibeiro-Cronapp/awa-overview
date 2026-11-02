import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { PullRequestsView } from '@shared/contracts';
import { ptBR } from '../../i18n/pt-BR';

interface UsePullRequestsInput {
  organization: string;
  projectId: string | null;
}

export interface PullRequestsQueryState {
  data: PullRequestsView | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refreshError: string | null;
  refresh: () => void;
}

export function usePullRequests({
  organization,
  projectId,
}: UsePullRequestsInput): PullRequestsQueryState {
  const queryClient = useQueryClient();
  const queryKey = ['pull-requests', organization, projectId] as const;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<PullRequestsView> => {
      const result = await window.api.pullRequests.load();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(projectId),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  async function refresh(): Promise<void> {
    if (refreshing || !projectId) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      const result = await window.api.pullRequests.load({ force: true });
      if (!result.ok) {
        setRefreshError(result.error.message);
        return;
      }
      queryClient.setQueryData(queryKey, result.data);
    } catch {
      setRefreshError(ptBR.errors.unexpected);
    } finally {
      setRefreshing(false);
    }
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching || refreshing,
    error: query.isError
      ? query.error instanceof Error
        ? query.error.message
        : ptBR.errors.unexpected
      : null,
    refreshError,
    refresh: () => void refresh(),
  };
}
