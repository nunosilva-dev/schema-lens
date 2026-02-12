import {useEffect, useRef, useState} from "react"
import Editor from "@monaco-editor/react"
import type {TargetLanguage} from "@/store/schemaStore"
import {useSchemaStore} from "@/store/schemaStore"
import {InputData, jsonInputForTargetLanguage, quicktype,} from "quicktype-core"

/**
 * Map our store language keys to quicktype's internal string identifiers.
 * "typescript", "java", "sql" are valid language names in quicktype-core.
 */
function getQuicktypeLang(lang: TargetLanguage): string {
    return lang
}

function getMonacoLang(lang: TargetLanguage): string {
    return lang
}

/**
 * Generates type definitions or schema code using `quicktype-core`.
 *
 * @param jsonString - Raw JSON input string.
 * @param targetLang - Target language ('typescript' or 'java').
 * @param javaOptions - Configuration for Java generation (package, Lombok).
 * @returns Generated code string.
 */
async function generateSchema(
    jsonString: string,
    targetLang: TargetLanguage,
    javaOptions: { package: string; useLombok: boolean }
): Promise<string> {
    const langName = getQuicktypeLang(targetLang)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonInput = jsonInputForTargetLanguage("typescript" as any)

    const sourceName = "Root"
    await jsonInput.addSource({name: sourceName, samples: [jsonString]})

    const inputData = new InputData()
    inputData.addInput(jsonInput)

    const rendererOptions: Record<string, string> = {}

    if (targetLang === "java") {
        rendererOptions["package"] = javaOptions.package
        rendererOptions["array-type"] = "list"
        rendererOptions["just-types"] = "true"
        rendererOptions["lombok"] = javaOptions.useLombok ? "true" : "false"
    } else if (targetLang === "typescript") {
        rendererOptions["just-types"] = "true"
    }


    const result = await quicktype({
        inputData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lang: langName as any,
        rendererOptions,
    })

    let output = result.lines.join("\n")

    // DATA CLEANUP: Java sometimes generates a Converter class even with just-types.
    if (targetLang === "java") {
        // Remove the Converter class block
        output = output.replace(/class Converter \{[\s\S]*?\}/g, "").trim()
        // Remove imports that might be left over if Converter was the only user (rudimentary)
        output = output.replace(/import java\.io\.IOException;/g, "")
        output = output.replace(/import com\.fasterxml\.jackson\..*;/g, "")

        if (javaOptions.useLombok) {
            output = output.replace(/@lombok\.Data/g, "@Data")
        }

        // Remove package declaration
        output = output.replace(/package .*?;/g, "").trim()
        // Remove ALL imports
        output = output.replace(/import .*?;/g, "").trim()
        // Clean up multiple newlines
        output = output.replace(/\n\s*\n\s*\n/g, "\n\n")
    }

    return output
}

/**
 * Code Viewer Dialog Content.
 *
 * Displays the generated types/schema for the current JSON input.
 * Handles generation asynchronously with debouncing to prevent freezing.
 */
export function CodeViewer({isOpen}: { isOpen: boolean }) {
    const jsonInput = useSchemaStore((s) => s.jsonInput)
    const parsedData = useSchemaStore((s) => s.parsedData)
    const targetLanguage = useSchemaStore((s) => s.targetLanguage)
    const javaOptions = useSchemaStore((s) => s.javaOptions)

    const [code, setCode] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [genError, setGenError] = useState<string | null>(null)

    // Debounce ref
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        // Clear previous timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        if (!isOpen) return

        if (!parsedData) {
            setCode("")
            setGenError(null)
            return
        }

        setIsGenerating(true)
        setGenError(null)

        // Debounce generation by 500ms
        timeoutRef.current = setTimeout(async () => {
            try {
                const generated = await generateSchema(jsonInput, targetLanguage, javaOptions)
                setCode(generated)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setGenError("Failed to generate code. Please check your JSON.")
                setCode("// Error generating code")
            } finally {
                setIsGenerating(false)
            }
        }, 500)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [jsonInput, targetLanguage, parsedData, javaOptions, isOpen])


    if (!parsedData) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <p className="text-sm">Waiting for valid JSON…</p>
            </div>
        )
    }

    return (
        <div className="relative flex h-full w-full flex-col">
            {/* Loading Badge */}
            {isGenerating && (
                <div
                    className="absolute top-2 right-2 z-10 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] text-indigo-400 backdrop-blur-sm shadow-sm animate-pulse">
                    Generating...
                </div>
            )}

            {/* Error Badge */}
            {genError && !isGenerating && (
                <div
                    className="absolute top-2 right-2 z-10 max-w-xs rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-destructive backdrop-blur-sm">
                    {genError}
                </div>
            )}

            <Editor
                height="100%"
                language={getMonacoLang(targetLanguage)}
                theme="vs-dark"
                value={code}
                options={{
                    readOnly: true,
                    minimap: {enabled: false},
                    automaticLayout: true,
                    fontSize: 13,
                    lineNumbers: "on",
                    padding: {top: 12, bottom: 12},
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    )
}
