import {memo, useEffect, useRef, useState} from "react"
import {Handle, type Node, type NodeProps, Position} from "@xyflow/react"
import type {ObjectNodeData} from "@/lib/graphUtils"

import {Badge} from "@/components/ui/badge"
import {useSchemaStore} from "@/store/schemaStore"
import {ScrollArea} from "@/components/ui/scroll-area"

/**
 * Custom Node Component for representing JSON Objects/Arrays.
 */
const ObjectNode = memo(({data}: NodeProps<Node<ObjectNodeData>>) => {
    const selectedNodePath = useSchemaStore((s) => s.selectedNodePath)
    const isSelected = selectedNodePath === data.path

    const scrollRef = useRef<HTMLDivElement>(null)
    const [hasOverflow, setHasOverflow] = useState(false)

    useEffect(() => {
        const checkOverflow = () => {
            const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
                setHasOverflow(viewport.scrollHeight > viewport.clientHeight)
            }
        }

        checkOverflow()
        // Re-check on window resize or data changes
        window.addEventListener('resize', checkOverflow)
        return () => window.removeEventListener('resize', checkOverflow)
    }, [data.primitives])

    return (
        <div
            className={`min-w-[250px] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-border"
            }`}
        >
            {!data.isRoot && (
                <Handle type="target" position={Position.Top} className="!bg-muted-foreground"/>
            )}

            <div
                className={`flex items-center justify-between border-b px-3 py-2 ${isSelected ? "bg-indigo-500/10" : "bg-muted/50"}`}>
                <span className="font-mono text-sm font-medium">{data.label}</span>
                {data.isArray && <Badge variant="secondary" className="text-[10px] h-5">Array</Badge>}
            </div>

            <ScrollArea
                ref={scrollRef}
                className={`flex max-h-32 flex-col ${hasOverflow ? "nowheel nodrag custom-scrollbar" : ""}`}
            >
                <div className="p-3 space-y-1.5">
                    {data.primitives.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No properties</span>
                    )}
                    {data.primitives.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground mr-2">{p.key}:</span>
                            <span
                                className={`font-mono truncate max-w-[120px] ${p.type === "string"
                                    ? "text-emerald-400"
                                    : p.type === "number"
                                        ? "text-amber-400"
                                        : p.type === "boolean"
                                            ? "text-purple-400"
                                            : "text-zinc-500"
                                }`}
                                title={String(p.value)}
                            >
                                {String(p.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {data.hasChildren && (
                <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground"/>
            )}
        </div>
    )
})

ObjectNode.displayName = "ObjectNode"
export {ObjectNode}
