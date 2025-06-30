import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { useDeleteWorkspace } from "@/features/workspaces/api/use-delete-workspace";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace ";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";

interface PreferencesModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialValue: string;
}

export const Preferences = ({ open, setOpen, initialValue }: PreferencesModalProps) => {
    const [ConfirmDialog, confirm] = useConfirm("Are you sure", "This action is irreversible")
    const workspaceId = useWorkspaceId()
    const [value, setValue] = useState(initialValue)
    const { mutate: UpdateWorkspace, isPending: isUpdatingWorkspace } = useUpdateWorkspace()
    const { mutate: removeWorkspace, isPending: isRemovingWorkspace } = useDeleteWorkspace()
    const [editOpen, setEditOpen] = useState(false)
    const router = useRouter()
    const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        UpdateWorkspace({
            workspaceId: workspaceId,
            name: value
        }, {
            onSuccess: () => {
                toast.success("Workspace updated");
                setEditOpen(false);
            },
            onError: () => {
                toast.error("Failed to update workspace")
            }
        })
    }
    const handleRemove = async () => {
        const ok = await confirm()
        if (!ok) {
            return
        }
        removeWorkspace({
            id: workspaceId
        }, {
            onSuccess: () => {
                toast.success("Workspace deleted");
                router.replace("/")
            },
            onError: () => {
                toast.error("Failed to delete workspace")
            }
        })
    }




    return (
        <>
            <ConfirmDialog />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-white">
                        <DialogTitle>
                            {value}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-4 pb-4 flex flex-col gap-y-2">
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">
                                            Workspace Name
                                        </p>
                                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                                            Edit
                                        </p>
                                    </div>
                                    <p className="text-sm">
                                        {value}
                                    </p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Rename this workspace
                                    </DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleEdit}>
                                    <Input
                                        value={value}
                                        disabled={isUpdatingWorkspace}
                                        onChange={(e) => setValue(e.target.value)}
                                        required
                                        autoFocus
                                        minLength={3}
                                        maxLength={80}
                                        placeholder="Workspace name e.g. 'Work,Personal,'Home'">

                                    </Input>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isUpdatingWorkspace}>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isUpdatingWorkspace}>Save</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <button
                            disabled={false}
                            onClick={handleRemove}
                            className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600">
                            <TrashIcon className="size-4" />
                            <p className="text-sm font-semibold">Delete Workspace</p>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}