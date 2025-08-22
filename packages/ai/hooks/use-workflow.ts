import { useCallback, useState } from 'react';
import { mastra } from '../mastra';

export interface UseWorkflowOptions {
  workflowId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: any) => void;
}

export interface WorkflowState {
  isLoading: boolean;
  data: any;
  error: Error | null;
  progress: any;
}

/**
 * Hook for executing Mastra workflows with progress tracking
 */
export function useWorkflow({
  workflowId,
  onSuccess,
  onError,
  onProgress,
}: UseWorkflowOptions) {
  const [state, setState] = useState<WorkflowState>({
    isLoading: false,
    data: null,
    error: null,
    progress: null,
  });

  const execute = useCallback(
    async (input: any) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Get the workflow instance
        const workflow = mastra.getWorkflow(workflowId);

        // Create a run
        const run = await workflow.createRun();

        // Watch the workflow for updates
        workflow.watch({ runId: run.runId }, (record) => {
          // Update progress state
          setState((prev) => ({ ...prev, progress: record }));
          onProgress?.(record);
        });

        // Start the workflow
        const result = await workflow.startAsync({
          runId: run.runId,
          inputData: input,
        });

        setState((prev) => ({
          ...prev,
          data: result,
          isLoading: false,
        }));
        onSuccess?.(result);
      } catch (err) {
        const error = err as Error;
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
        }));
        onError?.(error);
      }
    },
    [workflowId, onSuccess, onError, onProgress]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      data: null,
      error: null,
      progress: null,
    });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
}
