import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspace";
import { createWorkspaceModalAtom } from "@/features/workspaces/store/use-create-workspace-modal";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const WorksSpaceSwitcher = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [_open, setOpen] = createWorkspaceModalAtom()
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ workspaceId });
    const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces();
    const filteredWorkspaces = workspaces?.filter(ws => ws._id !== workspaceId);
    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                <Button className="size-9 relative overflow-hidden bg-[#ababad] hover:bg-[#ababad]/80 text-slate-800 font-semibold text-xl">
                    {workspaceLoading ? <Loader className="size-5 animate-spin shrink-0" /> :
                        workspace?.name.charAt(0).toUpperCase()}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-64">
                <DropdownMenuItem className="cursor-pointer flex-col justify-start items-start capitalize"
                    onClick={() => router.push(`/workspace/${workspaceId}`)}>
                    {workspace?.name}
                    <span className="text-xs text-muted-foreground">Active Workspace</span>
                </DropdownMenuItem>
                {filteredWorkspaces?.map(ws => (
                    <DropdownMenuItem key={ws._id} className="cursor-pointer  capitalize overflow-hidden"
                        onClick={() => router.push(`/workspace/${ws._id}`)}>
                        <div className="shrink-0 size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md flex items-center justify-center mr-2">
                            {ws.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="truncate">{ws.name}</p>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setOpen(true)}>
                    <div className="size-9 relative overflow-hidden bg-[#f2f2f2] text-slate-800 font-semibold text-xl rounded-md flex items-center justify-center mr-2">
                        <Plus />
                    </div>
                    Create a new workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}