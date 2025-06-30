import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

export const useBotId = () => {
    const params = useParams();
    return params.botId as Id<"bots">
}