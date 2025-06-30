import Quill from "quill";
import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // ✅ dark code theme

interface RendererProps {
    value: string;
}

const Renderer = ({ value }: RendererProps) => {
    const [isEmpty, setIsEmpty] = useState(false);
    const rendererRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rendererRef.current) return;

        const container = rendererRef.current;
        const quill = new Quill(document.createElement("div"), {
            theme: "snow",
        });

        quill.enable(false);
        const contents = JSON.parse(value);
        quill.setContents(contents);

        const plainText = quill.getText().trim();
        setIsEmpty(plainText.length === 0);

        container.innerHTML = quill.root.innerHTML;

        // 🔥 Apply syntax highlighting
        container.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });

        return () => {
            container.innerHTML = "";
        };
    }, [value]);

    if (isEmpty) return null;

    return (
        <div
            ref={rendererRef}
            className="ql-editor ql-renderer prose max-w-none prose-slate dark:prose-invert"
        />
    );
};

export default Renderer;
