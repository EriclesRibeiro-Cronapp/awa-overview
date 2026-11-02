import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { PipelinesView } from '@shared/contracts';
import { ptBR } from '../../i18n/pt-BR';

interface UsePipelinesInput {
  organization: string;
  projectId: string | null;
}

export interface PipelinesQueryState {
  data: PipelinesView | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refreshError: string | null;
  refresh: () => void;
}

export function usePipelines({
  organization,
  projectId,
}: UsePipelinesInput): PipelinesQueryState {
  const queryClient = useQueryClient();
  const queryKey = ['pipelines', organization, projectId] as const;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<PipelinesView> => {
      const result = await window.api.pipelines.load();
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
      const result = await window.api.pipelines.load({ force: true });
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
