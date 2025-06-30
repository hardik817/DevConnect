import { Button } from "@/components/ui/button"
import { FaChevronDown } from "react-icons/fa"
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { TrashIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useChannelId } from "@/hooks/use-channel-id"
import { useUpdateChannel } from "@/features/channels/api/use-update-channel"
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/hooks/use-confirm"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { useCurrentMember } from "@/features/members/api/use-current-member"

interface HeaderProps {
    channelName: string
}

export const Header = ({ channelName }: HeaderProps) => {
    const channelId = useChannelId()
    const workspaceId = useWorkspaceId()
    const { data: member } = useCurrentMember({ workspaceId })
    const router = useRouter()
    const [ConfirmDialog, confirm] = useConfirm("Delete this channel?", "You are about to delete this channel")

    const [value, setValue] = useState(channelName)
    const [editOpen, setEditOpen] = useState(false)
    const { mutate: updateChannel, isPending: isUpdating } = useUpdateChannel()
    const { mutate: removeChannel, isPending: isRemoving } = useRemoveChannel()
    const HandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase()
        setValue(value)
    }
    const handleEditOpen = (value: boolean) => {
        if (member?.role === "admin") {
            setEditOpen(true)
        }
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        updateChannel({
            id: channelId,
            name: value
        }, {
            onSuccess: () => {
                toast.success("Channel updated");
                setEditOpen(false);
            },
            onError: () => {
                toast.error("Failed to update Channel")
            }
        })
    }
    const handleRemove = async () => {
        const ok = await confirm()
        if (!ok) {
            return
        }
        removeChannel({
            id: channelId
        }, {
            onSuccess: () => {
                toast.success("Channel deleted");
                router.replace(`/workspace/${workspaceId}`)
            },
            onError: () => {
                toast.error("Failed to delete Channel")
            }
        })
    }
    return (
        <>
            <ConfirmDialog />
            <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className="text-lg font-semibold px-2 overflow-hidden w-auto"
                            size="sm">
                            <span className="truncate">
                                #{channelName}
                            </span>
                            <FaChevronDown className="size-2.5 ml-2" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-gray-50 overflow-hodden">
                        <DialogHeader className="p-4 border-b bg-white">
                            <DialogTitle>
                                #{channelName}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="px-4 pb-4 flex flex-col gap-y-2">
                            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                                <DialogTrigger asChild>
                                    <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold">Channel Name</p>
                                            {member?.role === "admin" && <p className="text-sm text-[#1264a3] hover:underline font-semibold">Edit</p>
                                            }
                                        </div>
                                        <p className="text-sm">#{channelName}</p>
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Rename this Channel</DialogTitle>
                                    </DialogHeader>
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <Input
                                            value={value}
                                            disabled={isUpdating}
                                            onChange={HandleChange}
                                            required
                                            autoFocus
                                            minLength={3}
                                            maxLength={80}
                                            placeholder="Channel name e.g. 'plan-budget'">

                                        </Input>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" disabled={isUpdating}>
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button disabled={isUpdating}>Save</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            {
                                member?.role === "admin" &&
                                <button
                                    disabled={false}
                                    onClick={handleRemove}
                                    className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600">
                                    <TrashIcon className="size-4" />
                                    <p className="text-sm font-semibold">Delete Channel</p>
                                </button>
                            }

                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}