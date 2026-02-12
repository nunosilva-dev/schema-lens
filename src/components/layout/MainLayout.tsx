import {useState} from "react"
import {Group as PanelGroup, Panel, Separator as PanelResizeHandle} from "react-resizable-panels"
import {Code, Github, GripVertical, Moon, ShieldCheck, Sun, Trash2} from "lucide-react"
import {JsonEditor} from "@/components/editor/JsonEditor"
import {JsonGraph} from "@/components/visualizer/JsonGraph"
import {CodeViewer} from "@/components/code/CodeViewer"
import {useSchemaStore} from "@/store/schemaStore"
import {Tooltip, TooltipContent, TooltipTrigger,} from "@/components/ui/tooltip"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"

/** Header bar with logo, privacy badge, theme toggle, and GitHub link. */
function Header() {
    const isDark = useSchemaStore((s) => s.isDark)
    const toggleDarkMode = useSchemaStore((s) => s.toggleDarkMode)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const targetLanguage = useSchemaStore((s) => s.targetLanguage)
    const setTargetLanguage = useSchemaStore((s) => s.setTargetLanguage)
    const javaOptions = useSchemaStore((s) => s.javaOptions)
    const setJavaOptions = useSchemaStore((s) => s.setJavaOptions)

    return (
        <header
            className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm">
            {/* Left — Logo + Privacy Badge */}
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold tracking-tight">
                    <span className="text-primary">Schema</span>
                    <span className="text-muted-foreground">Lens</span>
                </h1>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="outline"
                            className="hidden cursor-default gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 sm:flex"
                        >
                            <ShieldCheck className="size-3"/>
                            <span className="text-[10px]">Private</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-xs">
                        Client-side processing only. Your data never leaves this tab.
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="hidden sm:flex mr-2">
                            <Code className="mr-2 h-4 w-4"/>
                            Export Types
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Export Types</DialogTitle>
                            <DialogDescription>
                                Generate type definitions or schemas for your JSON data.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Toolbar for Code Viewer (Language Selector, etc) */}
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Select
                                value={targetLanguage}
                                onValueChange={(val) => setTargetLanguage(val as any)}
                            >
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                    <SelectValue placeholder="Language"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                </SelectContent>
                            </Select>

                            {targetLanguage === "java" && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="lombok" className="text-xs">Lombok</Label>
                                        <Switch
                                            id="lombok"
                                            checked={javaOptions.useLombok}
                                            onCheckedChange={(checked) => setJavaOptions({useLombok: checked})}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden min-h-0 mt-2 rounded-md border">
                            <CodeViewer isOpen={isDialogOpen}/>
                        </div>
                    </DialogContent>
                </Dialog>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={toggleDarkMode}
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <Sun className="size-4"/>
                            ) : (
                                <Moon className="size-4"/>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Toggle theme</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            asChild
                        >
                            <a
                                href="https://github.com/nunosilva-dev/schema-lens"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                            >
                                <Github className="size-4"/>
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">GitHub</TooltipContent>
                </Tooltip>
            </div>
        </header>
    )
}

/**
 * Main application layout.
 * Visualizer-First: Left Sidebar (JSON Editor) + Main Canvas (Graph).
 */
/**
 * Main application layout component.
 *
 * Structures the app with a Visualizer-First approach:
 * - Header: Logo, controls, and settings.
 * - Left Panel: JSON Editor input.
 * - Right Panel: Interactive Graph Visualizer.
 *
 * Uses `react-resizable-panels` for adjustable layout.
 */
export function MainLayout() {
    const isDark = useSchemaStore((s) => s.isDark)
    const clearJsonInput = useSchemaStore((s) => s.clearJsonInput)
    const jsonInput = useSchemaStore((s) => s.jsonInput)

    return (
        <div className={`${isDark ? "dark" : ""} flex h-screen flex-col bg-background text-foreground`}>
            <Header/>

            <div className="flex-1 overflow-hidden">
                <PanelGroup orientation="horizontal" className="h-full w-full">
                    {/* Left — Input Editor (25%) */}
                    <Panel defaultSize="25" minSize="20" maxSize="50" className="flex flex-col">
                        <div
                            className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3">
                            <span className="text-xs font-medium text-muted-foreground">
                                Input — JSON
                            </span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={clearJsonInput}
                                        disabled={!jsonInput}
                                    >
                                        <Trash2 className="size-3"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Clear JSON</TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <JsonEditor/>
                        </div>
                    </Panel>

                    <PanelResizeHandle
                        className="relative flex w-px items-center justify-center bg-border hover:bg-primary/50 transition-colors">
                        <div className="absolute inset-y-0 -inset-x-2 z-10"/>
                        {/* Hit area */}
                        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border">
                            <GripVertical className="size-2.5"/>
                        </div>
                    </PanelResizeHandle>

                    {/* Right — Main Canvas (Graph) (75%) */}
                    <Panel defaultSize="75" minSize="50" className="bg-background">
                        <JsonGraph/>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    )
}
