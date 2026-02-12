import Editor from "@monaco-editor/react"
import {useSchemaStore} from "@/store/schemaStore"

/**
 * Full-height Monaco editor configured for JSON input.
 * Connects directly to the Zustand store — no props needed.
 */
/**
 * JSON Input Editor Component.
 *
 * Uses Monaco Editor to provide a rich code editing experience for JSON data.
 * Features:
 * - Syntax highlighting
 * - Error reporting via `parseError` from store
 * - Automatic formatting
 *
 * Connects directly to `schemaStore` for state management.
 */
export function JsonEditor() {
    const jsonInput = useSchemaStore((s) => s.jsonInput)
    const setJsonInput = useSchemaStore((s) => s.setJsonInput)
    const parseError = useSchemaStore((s) => s.parseError)

    return (
        <div className="relative flex h-full w-full flex-col">
            {parseError && (
                <div
                    className="absolute top-2 right-2 z-10 max-w-xs rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-destructive backdrop-blur-sm">
                    {parseError}
                </div>
            )}
            <Editor
                height="100%"
                language="json"
                theme="vs-dark"
                value={jsonInput}
                onChange={(value) => setJsonInput(value ?? "")}
                options={{
                    minimap: {enabled: false},
                    formatOnPaste: true,
                    automaticLayout: true,
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    padding: {top: 12, bottom: 12},
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    renderLineHighlight: "gutter",
                    bracketPairColorization: {enabled: true},
                    tabSize: 2,
                }}
            />
        </div>
    )
}
