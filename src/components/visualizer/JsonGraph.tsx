import {useCallback, useEffect, useMemo, useState} from "react"
import {
    Background,
    Controls,
    type Edge,
    type Node,
    type NodeTypes,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {useSchemaStore} from "@/store/schemaStore"
import {getLayoutedElements, type ObjectNodeData} from "@/lib/graphUtils"
import {ObjectNode} from "@/components/visualizer/ObjectNode"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {Button} from "@/components/ui/button"
import {Check, Copy} from "lucide-react"

/** Registered custom node types for React Flow. */
const nodeTypes: NodeTypes = {
    objectNode: ObjectNode,
}

/** Interactive graph visualizer for parsed JSON data. */
/**
 * Interactive Graph Visualizer Component.
 *
 * Renders the parsed JSON data as a node-based graph using React Flow.
 * Features:
 * - Auto-layout using Dagre
 * - Collapsible/Expandable nodes (visual representation)
 * - Path highlighting and breadcrumbs
 * - "Copy Path" functionality
 */
export function JsonGraph() {
    const parsedData = useSchemaStore((s) => s.parsedData)
    const selectedNodePath = useSchemaStore((s) => s.selectedNodePath)
    const setSelectedNodePath = useSchemaStore((s) => s.setSelectedNodePath)

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<ObjectNodeData>>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (!parsedData) {
            setNodes([])
            setEdges([])
            return
        }

        const {nodes: layoutedNodes, edges: layoutedEdges} =
            getLayoutedElements(parsedData)
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
    }, [parsedData, setNodes, setEdges])

    const proOptions = useMemo(() => ({hideAttribution: true}), [])

    const onInit = useCallback((instance: { fitView: () => void }) => {
        setTimeout(() => instance.fitView(), 50)
    }, [])

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        const data = node.data as ObjectNodeData
        setSelectedNodePath(data.path)
    }, [setSelectedNodePath])

    const copyPath = () => {
        if (selectedNodePath) {
            navigator.clipboard.writeText(selectedNodePath)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        }
    }

    if (!parsedData) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <p className="text-sm">Waiting for valid JSON…</p>
            </div>
        )
    }

    const pathSegments = selectedNodePath ? selectedNodePath.split('.').flatMap(p => p.split('[').map(s => s.replace(']', ''))) : []

    return (
        <div className="relative h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                onInit={onInit}
                onNodeClick={onNodeClick}
                fitView
                minZoom={0.1}
                maxZoom={2}
                nodesConnectable={false}
                defaultEdgeOptions={{animated: true, type: "default", style: {stroke: "#6366f1", strokeWidth: 1.5}}}
            >
                <Background color="#27272a" gap={16} size={1}/>
                <Controls
                    position="top-right"
                    showInteractive={false}
                    className="!bg-zinc-800 !border-zinc-700 !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700"
                />
            </ReactFlow>

            {/* Path Finder UI */}
            <div
                className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-4">
                <div className="flex items-center overflow-hidden min-w-0 flex-1">
                    <span
                        className="mr-2 text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">Path:</span>
                    {selectedNodePath ? (
                        <div className="overflow-x-auto custom-scrollbar py-1">
                            <Breadcrumb>
                                <BreadcrumbList className="flex-nowrap w-max">
                                    {pathSegments.map((segment, i) => (
                                        <div key={i} className="flex items-center">
                                            <BreadcrumbItem>
                                                <BreadcrumbLink className="text-xs font-mono">{segment}</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {i < pathSegments.length - 1 && <BreadcrumbSeparator/>}
                                        </div>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    ) : (
                        <span
                            className="text-xs text-muted-foreground italic truncate">Select a node to view its path</span>
                    )}
                </div>

                {selectedNodePath && (
                    <Button variant="outline" size="sm" className="ml-4 h-7 text-xs" onClick={copyPath}>
                        {isCopied ? <Check className="mr-2 h-3 w-3"/> : <Copy className="mr-2 h-3 w-3"/>}
                        {isCopied ? "Copied" : "Copy Path"}
                    </Button>
                )}
            </div>
        </div>
    )
}
