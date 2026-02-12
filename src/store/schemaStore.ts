import {create} from "zustand"
import {persist} from "zustand/middleware"

/** Sample JSON used as the default editor content. */
const SAMPLE_JSON = JSON.stringify(
    {
        id: 1,
        name: "Example",
        version: "1.0.0",
        features: ["visualizer", "type-gen", "dark-mode"],
        author: {
            name: "Example",
            email: "example@example.com",
            social: {
                github: "https://github.com/example",
                twitter: "@example",
            },
        },
        isOpenSource: true,
        stats: {
            stars: 1200,
            forks: 84,
            contributors: [
                {name: "Alice", commits: 142},
                {name: "Bob", commits: 97},
            ],
        },
    },
    null,
    2,
)

/** Validates that the input string is valid JSON. */
function tryParseJson(input: string): { data: unknown; error: string | null } {
    try {
        const data = JSON.parse(input)
        return {data, error: null}
    } catch (e) {
        return {data: null, error: (e as Error).message}
    }
}

/** Supported target languages for code generation. */
export type TargetLanguage = "typescript" | "java"

export interface JavaOptions {
    package: string
    useLombok: boolean
}

interface SchemaState {
    /** Raw JSON string from the editor. */
    jsonInput: string
    /** Parsed JSON object (or null if invalid). */
    parsedData: unknown | null
    /** Error message if JSON is invalid. */
    parseError: string | null
    /** Selected target language for code generation. */
    targetLanguage: TargetLanguage
    /** UI Theme preference. */
    isDark: boolean
    /** Java-specific generation options. */
    javaOptions: JavaOptions
    /** Path of the currently selected graph node (e.g., "root.users[0]"). */
    selectedNodePath: string | null

    setJsonInput: (input: string) => void
    setTargetLanguage: (lang: TargetLanguage) => void
    toggleDarkMode: () => void
    setJavaOptions: (options: Partial<JavaOptions>) => void
    setSelectedNodePath: (path: string | null) => void
    clearJsonInput: () => void
}

/**
 * Zustand Store for application state.
 *
 * Manages:
 * - JSON Input and Parsing
 * - UI Preferences (Theme, Language)
 * - Graph Selection State
 *
 * Uses `persist` middleware to save state to localStorage.
 */
export const useSchemaStore = create<SchemaState>()(
    persist(
        (set) => ({
            jsonInput: SAMPLE_JSON,
            parsedData: tryParseJson(SAMPLE_JSON).data,
            parseError: null,
            targetLanguage: "typescript",
            isDark: true,
            javaOptions: {
                package: "com.example",
                useLombok: false,
            },
            selectedNodePath: null,

            setJsonInput: (input) => {
                const {data, error} = tryParseJson(input)
                set({
                    jsonInput: input,
                    parsedData: data,
                    parseError: error,
                })
            },

            setTargetLanguage: (lang) => set({targetLanguage: lang}),

            toggleDarkMode: () => set((state) => ({isDark: !state.isDark})),

            setJavaOptions: (options) =>
                set((state) => ({
                    javaOptions: {...state.javaOptions, ...options},
                })),

            setSelectedNodePath: (path) => set({selectedNodePath: path}),

            clearJsonInput: () =>
                set({
                    jsonInput: "",
                    parsedData: null,
                    parseError: null,
                    selectedNodePath: null,
                }),
        }),
        {
            name: "schemalens-storage",
            version: 1,
            partialize: (state) => ({
                jsonInput: state.jsonInput,
                parsedData: state.parsedData,
                parseError: state.parseError,
                targetLanguage: state.targetLanguage,
                isDark: state.isDark,
                javaOptions: state.javaOptions
            }),
        },
    ),
)
