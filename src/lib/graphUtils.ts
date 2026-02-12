import dagre from "@dagrejs/dagre"
import type {Edge, Node} from "@xyflow/react"

/** Primitive values shown inside the parent ObjectNode card. */
export interface PrimitiveEntry {
    key: string
    value: string | number | boolean | null
    type: "string" | "number" | "boolean" | "null"
}

/** Data payload attached to each ObjectNode. */
export interface ObjectNodeData extends Record<string, unknown> {
    label: string
    primitives: PrimitiveEntry[]
    isArray: boolean
    /** Path of the currently selected graph node (e.g., "root.users[0]"). */
    path: string
    isRoot: boolean
    hasChildren: boolean
}

/** Classify a JSON value's type for display. */
function primitiveType(value: unknown): "string" | "number" | "boolean" | "null" | null {
    if (value === null) return "null"
    const t = typeof value
    if (t === "string") return "string"
    if (t === "number") return "number"
    if (t === "boolean") return "boolean"
    return null
}

/** Truncate long string values for display. */
function truncate(value: string, max = 30): string {
    if (value.length <= max) return value
    return value.slice(0, max) + "…"
}

/**
 * Recursively traverse a parsed JSON value and produce React Flow nodes + edges.
 */
function traverse(
    value: unknown,
    label: string,
    path: string,
    parentId: string | null,
    nodes: Node<ObjectNodeData>[],
    edges: Edge[],
    idCounter: { current: number }
): void {
    if (value === null || typeof value !== "object") return

    const nodeId = `node-${idCounter.current++}`
    const isArray = Array.isArray(value)
    const primitives: PrimitiveEntry[] = []

    const entries = isArray
        ? (value as unknown[]).map((v, i) => [String(i), v] as const)
        : Object.entries(value as Record<string, unknown>)

    for (const [key, val] of entries) {
        const pType = primitiveType(val)
        if (pType !== null) {
            primitives.push({
                key,
                value: typeof val === 'string' ? truncate(val) : (val as number | boolean | null),
                type: pType,
            })
        }
    }

    const hasChildren = entries.some(([, val]) => val !== null && typeof val === "object")
    const isRoot = parentId === null

    nodes.push({
        id: nodeId,
        type: "objectNode",
        position: {x: 0, y: 0},
        data: {
            label: isArray ? `${label} []` : label,
            primitives,
            isArray,
            path,
            isRoot,
            hasChildren,
        },
    })

    if (parentId) {
        edges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            animated: true,
            type: "default", // Bezier curve
            style: {stroke: "#6366f1", strokeWidth: 1.5},
        })
    }

    const traversalEntries = isArray ? [...entries].reverse() : entries

    for (const [key, val] of traversalEntries) {
        if (val !== null && typeof val === "object") {
            const childPath = isArray
                ? `${path}[${key}]`
                : path ? `${path}.${key}` : key

            traverse(val, key, childPath, nodeId, nodes, edges, idCounter)
        }
    }
}

/** Node dimensions used by dagre for layout calculation. */
const NODE_WIDTH = 250
const NODE_HEIGHT_BASE = 80
const NODE_HEIGHT_PER_ROW = 24

/**
 * Computes the layout of the graph using Dagre.
 *
 * @param json - The parsed JSON data.
 * @returns An object containing `nodes` and `edges` ready for React Flow.
 */
export function getLayoutedElements(json: unknown): {
    nodes: Node<ObjectNodeData>[]
    edges: Edge[]
} {
    if (json === null || typeof json !== "object") {
        return {nodes: [], edges: []}
    }

    const nodes: Node<ObjectNodeData>[] = []
    const edges: Edge[] = []

    traverse(json, "root", "root", null, nodes, edges, {current: 0})

    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({rankdir: "TB", nodesep: 60, ranksep: 100})

    nodes.forEach((node) => {
        const height = NODE_HEIGHT_BASE + (node.data.primitives.length * NODE_HEIGHT_PER_ROW)
        g.setNode(node.id, {width: NODE_WIDTH, height: height})
    })

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target)
    })

    dagre.layout(g)

    const layoutedNodes = nodes.map((node) => {
        const dagreNode = g.node(node.id)
        return {
            ...node,
            position: {
                x: dagreNode.x - NODE_WIDTH / 2,
                y: dagreNode.y - (dagreNode.height / 2),
            },
            style: {opacity: 1},
        }
    })

    return {nodes: layoutedNodes, edges}
}
