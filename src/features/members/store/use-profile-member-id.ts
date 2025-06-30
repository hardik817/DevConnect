import { useQueryState } from "nuqs"
import { useState } from "react";

export const useProfileMemberId = () => {
    return useQueryState("profileMemberId");
}