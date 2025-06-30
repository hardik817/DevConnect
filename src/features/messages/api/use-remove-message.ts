import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo } from "react";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
type RequestType = { id: Id<"messages"> };
type ResponseType = Id<"messages"> | null;
type Options = {
    onSuccess?: (
        data: (Id<"messages"> | ResponseType)
    ) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useRemoveMessage = (options: Options = {}) => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<null | "settled" | "pending" | "success" | "error">(null);
    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    const Mutation = useMutation(api.messages.remove);

    const mutate = useCallback(async (values: RequestType, options?: Options) => {

        try {
            setData(null);
            setError(null);
            setStatus("pending")


            const response = await Mutation(values)
            options?.onSuccess?.(response);
            return response
        }
        catch (error) {
            options?.onError?.(error as Error);
            if (options?.throwError) {
                throw error;
            }
        } finally {
            setStatus("settled");
            options?.onSettled?.();
        }
    }, [Mutation]);

    return { mutate, data, error, status, isPending, isSuccess, isError, isSettled };
};
