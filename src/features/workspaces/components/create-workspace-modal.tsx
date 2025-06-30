"use client";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useState } from "react";

import { createWorkspaceModalAtom } from "../store/use-create-workspace-modal";
import { useCreateWorkspace } from "../api/use-create-workspace";

import { useRouter } from "next/navigation";
export const CreateWorkspaceModal = () => {
    const router = useRouter();


    const [name, setName] = useState("");

    const [open, setOpen] = createWorkspaceModalAtom();
    const { mutate, isPending } = useCreateWorkspace();
    const HandleClose = () => {
        setOpen(false);
        setName("");
    }
    const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await mutate({ name }, {
            onSuccess(data) {
                toast.success("Workspace created successfully");
                router.push(`/workspace/${data}`);
                HandleClose();
            }
        });
    }
    return (
        <Dialog open={open} onOpenChange={HandleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a workspace</DialogTitle>
                </DialogHeader>
                <form onSubmit={HandleSubmit} className="space-y-4">
                    <Input
                        value={name}
                        placeholder="Workspace name e.g. #ml , #react"
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>Create</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
