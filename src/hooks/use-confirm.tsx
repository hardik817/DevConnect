import { JSX, useState } from "react"
import {
    Button
} from "@/components/ui/button"

import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"



export const useConfirm = (title: string, message: string): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null)

    const confirm = () => new Promise((resolve, reject) => {
        setPromise({ resolve })
    })
    const handleCancel = () => {
        setPromise(null)
    }
    const handleClose = () => {
        promise?.resolve(false);
        setPromise(null)
    }
    const handleConfirm = () => {
        promise?.resolve(true);
        setPromise(null)
    }
    const ConfirmDialog = () => {
        return (
            <Dialog open={promise !== null}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {title}
                        </DialogTitle>
                        <DialogDescription>
                            {message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-2">
                        <Button
                            onClick={handleCancel}
                            variant="outline">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }
    return [ConfirmDialog, confirm]

}