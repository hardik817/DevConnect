import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createChannelModalAtom } from "../store/use-create-channel-modal"
import { useState } from "react"
import { useCreateChannel } from "../api/use-create-channel"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { Toaster } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
export const CreateChannelModal = () => {
    const router = useRouter();
    const [open, setOpen] = createChannelModalAtom()
    const [name, setName] = useState("");
    const HandleClose = () => {
        setOpen(false);
        setName("");
    }
    const HandlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase()
        setName(value)
    }
    const workspaceId = useWorkspaceId()
    const { mutate, isPending } = useCreateChannel()
    const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await mutate({ name, workspaceId }, {
            onSuccess(data) {
                toast.success("Channel created")
                router.push(`/workspace/${workspaceId}/channel/${data}`);
                HandleClose();
            },
            onError: () => {
                toast.error("Failed to create a channel")
            }
        });
    }
    return (
        <Dialog open={open} onOpenChange={HandleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add a Channel
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={HandleSubmit} className="space-y-4">
                    <Input
                        value={name}
                        placeholder="Plan Budget"
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        onChange={HandlChange}
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>Create</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}