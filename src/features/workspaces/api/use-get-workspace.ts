import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../convex/_generated/dataModel";
interface useGetWorkspaceProps {
    workspaceId: Id<"workspaces">;
}
export const useGetWorkspace = ({ workspaceId }: useGetWorkspaceProps) => {
    const data = useQuery(api.workspaces.getById, { workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
}