"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AiRendererProps {
    content: string;
    className?: string;
}

const AiRenderer: React.FC<AiRendererProps> = ({ content, className }) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopiedCode(null), 1500);
    };

    // Helper function to extract plain text from React children (including nested elements)
    const getTextContent = (children: any): string => {
        if (typeof children === 'string') {
            return children;
        }
        if (typeof children === 'number') {
            return children.toString();
        }
        if (Array.isArray(children)) {
            return children.map(child => getTextContent(child)).join('');
        }
        if (children?.props?.children) {
            return getTextContent(children.props.children);
        }
        return '';
    };

    return (
        <div className={cn("prose prose-invert max-w-none break-words", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                    code({ node, className = "", children, ...props }) {
                        const isInline = !className.includes("language-");

                        if (isInline) {
                            return (
                                <code className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-sm">
                                    {children}
                                </code>
                            );
                        }

                        // Extract plain text for copying while preserving syntax highlighting for display
                        const codeText = getTextContent(children);

                        return (
                            <div className="relative group my-4">
                                <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm text-white">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                                <button
                                    onClick={() => handleCopy(codeText)}
                                    className="absolute top-2 right-2 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/20"
                                    title="Copy code"
                                >
                                    {copiedCode === codeText ? (
                                        <>
                                            <Check className="h-3 w-3" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default AiRenderer;