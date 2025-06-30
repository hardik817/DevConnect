import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetMemberProps {
    workspaceId: Id<"workspaces">
}
export const useGetBots = ({ workspaceId }: useGetMemberProps) => {
    const data = useQuery(api.bots.get, { workspaceId });
    const isLoading = data === undefined;

    return { data: data, isLoading };
}