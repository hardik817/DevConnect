import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@radix-ui/react-separator"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { SignInFlow } from "../types"
import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlertIcon } from "lucide-react"

interface SignInCardProps {
    setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const { signIn } = useAuthActions();
    const onProvider = (value: "github" | "google") => {
        setPending(true);
        signIn(value)
            .finally(() => {
                setPending(false);
            })
    }

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0"><CardTitle>Sign In Card</CardTitle>
                <CardDescription>
                    Use your email or other service to continue
                </CardDescription></CardHeader>
            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6" >
                    <TriangleAlertIcon className="size-4" />
                    <p>{error}</p>
                </div>

            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        setPending(true);
                        void signIn("password", { email, password, flow: "signIn" })
                            .catch((err) => {
                                setError("Invalid email or password");
                            })
                            .finally(() => {
                                setPending(false);
                            });

                    }} className="space-y-2.5">
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value) }}
                        placeholder="Email"
                        type="email"
                        required>
                    </Input>
                    <Input
                        disabled={pending}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                        placeholder="Password"
                        type="password"
                        required>
                    </Input>
                    <Button type="submit" className="w-full" size="lg" disabled={false}>continue</Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-2.5">

                    <Button disabled={pending} onClick={() => onProvider("google")} variant="outline" size="lg" className="w-full relative">
                        <FcGoogle className="size-5 absolute top-2.5 left-2.5" />Continue with Google</Button>
                    <Button disabled={pending} onClick={() => onProvider("github")} variant="outline" size="lg" className="w-full relative">
                        <FaGithub className="size-5 absolute top-2.5 left-2.5" />Continue with Github</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Don't have an account?<span className="text-sky-700 hover:underline cursor-pointer" onClick={() => setState("signUp")}>Sign Up</span>
                </p>
            </CardContent>
        </Card>
    )
}