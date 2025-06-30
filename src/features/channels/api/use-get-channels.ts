import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../convex/_generated/dataModel";
interface useGetWorkspaceProps {
    workspaceId: Id<"workspaces">;
}
export const useGetChannels = ({ workspaceId }: useGetWorkspaceProps) => {
    const data = useQuery(api.channels.get, { workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
}