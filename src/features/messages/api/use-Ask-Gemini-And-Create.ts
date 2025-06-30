import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useState, useMemo } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = {
  prompt: string;
  workspaceId: Id<"workspaces">;
  parentMessageId?: Id<"messages">;
  conversationId?: Id<"conversations">;
  channelId?: Id<"channels">;
};

type ResponseType = Id<"messages"> | null;

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useAskGeminiAndCreate = (options: Options = {}) => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<null | "pending" | "success" | "error" | "settled">(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const action = useAction(api.ai.askGeminiAndCreateMessage);

  const mutate = useCallback(
    async (values: RequestType, customOptions?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const response = await action(values);
        setData(response);
        setStatus("success");

        customOptions?.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setStatus("error");

        customOptions?.onError?.(error);
        if (customOptions?.throwError) throw error;
      } finally {
        setStatus("settled");
        customOptions?.onSettled?.();
      }
    },
    [action]
  );

  return { mutate, data, error, status, isPending, isSuccess, isError, isSettled };
};
