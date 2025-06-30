import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useUpdatejoincode } from "@/features/workspaces/api/use-update-joincode "
import { useConfirm } from "@/hooks/use-confirm"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { strict } from "assert"
import { CopyIcon, RefreshCcw } from "lucide-react"
import { toast } from "sonner"


interface InviteModalProps {
    open: boolean,
    setOpen: (open: boolean) => void,
    joinCode: string,
    name: string
}


export const InviteModal = ({ open, setOpen, joinCode, name }: InviteModalProps) => {
    const workspaceId = useWorkspaceId()
    const { mutate, isPending } = useUpdatejoincode()
    const [ConfirmDialog, confirm] = useConfirm("Are you sure?", "This will deactivate the current invite code and generate a new one")
    const handleCopy = () => {
        const inviteLink = `${window.location.origin}/join/${workspaceId}`;
        navigator.clipboard
            .writeText(inviteLink)
            .then(() => toast.success("Invite link copied to the clipboard"))
    }
    const handleNewCode = async () => {
        const ok = await confirm()
        if (!ok) {
            return
        }
        mutate({ workspaceId }, {
            onSuccess: () => {
                toast.success("Invite code regenerated")
            },
            onError: () => {
                toast.error("Failed to regenerate invite code")
            }
        })
    }
    return (
        <>
            <ConfirmDialog />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Invite people to {name}
                        </DialogTitle>
                        <DialogDescription>
                            Use the code below to invite people to your workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-4 items-center justify-center py-10">
                        <p className="text-4xl font-bold tracking-widest uppercase">
                            {joinCode}
                        </p>
                        <Button variant={"ghost"} size="sm" onClick={handleCopy}>
                            Copy Link
                            <CopyIcon className="size-4 ml-2" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <Button onClick={handleNewCode} disabled={isPending} variant={"outline"}>
                            New Code
                            <RefreshCcw className="size-4 ml-2" />
                        </Button>
                        <DialogClose asChild>
                            <Button>Close</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
