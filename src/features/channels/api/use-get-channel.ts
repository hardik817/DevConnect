import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../convex/_generated/dataModel";
interface useGetWorkspaceProps {
    channelId: Id<"channels">;
}
export const useGetChannel = ({ channelId }: useGetWorkspaceProps) => {
    const data = useQuery(api.channels.getbyId, { id: channelId });
    const isLoading = data === undefined;

    return { data, isLoading };
}