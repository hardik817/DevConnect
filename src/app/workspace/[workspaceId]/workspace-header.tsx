import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Doc } from "../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { ChevronDown, Filter, ListFilter, SquarePen } from "lucide-react"
import { Hint } from "@/components/hint"
import { Preferences } from "./preferences"
import { useState } from "react"
import { InviteModal } from "./invite-modal"

interface WorkSpaceHeaderProps {
    workspace: Doc<"workspaces">,
    isAdmin: boolean
}

export const WorkSpaceHeader = ({ workspace, isAdmin }: WorkSpaceHeaderProps) => {
    const [open, setOpen] = useState(false)
    const [inviteopen, setinviteOpen] = useState(false)
    return (
        <>
            <InviteModal open={inviteopen} setOpen={setinviteOpen} joinCode={workspace.joinCode} name={workspace.name} />
            <Preferences open={open} setOpen={setOpen} initialValue={workspace.name} />
            <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="transparent" className="font-semibold text-lg w-auto p-1.5 overflow-hidden" size="sm">
                            <span className="truncate">{workspace.name}</span>
                            <ChevronDown className="size-4 ml-1 shrink-8" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="w-64">
                        <DropdownMenuItem className="cursor-pointer capitalize">
                            <div className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md flex items-center justify-center mr-2">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start">
                                <p className="font-bold">{workspace.name}</p>
                                <p className="text-xs text-muted-foreground">Active Workspace</p>
                            </div>
                        </DropdownMenuItem>
                        {
                            isAdmin &&
                            (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => { setinviteOpen(true) }}>
                                        Invite people to {workspace.name}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => { setOpen(true) }}>
                                        Preferences
                                    </DropdownMenuItem>
                                </>
                            )
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-0.5">
                    <Hint label="Search" side="bottom">


                        <Button variant="transparent" size="iconSm">
                            <ListFilter className="size-4" />
                        </Button>
                    </Hint>
                    <Hint label="New Message" side="bottom">
                        <Button variant="transparent" size="iconSm">
                            <SquarePen className="size-4" />
                        </Button>
                    </Hint>
                </div>
            </div>
        </>
    )
}