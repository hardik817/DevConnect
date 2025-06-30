import { useQueryState } from "nuqs"
import { useState } from "react";

export const useParentMessageId = () => {
    return useQueryState("parentMessageId");
}