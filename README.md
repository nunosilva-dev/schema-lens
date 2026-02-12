# Schema Lens

**Schema Lens** is a visualizer-first JSON analysis and code generation tool. It transforms complex JSON structures into
interactive graphs, allowing developers to understand data relationships at a glance and instantly generate type
definitions for TypeScript and Java.

## 🚀 Features

- **Visualizer-First Approach**: View JSON data as an interactive node graph using [React Flow](https://reactflow.dev/).
- **Interactive Graph**:
    - Auto-layout powered by [Dagre](https://github.com/dagrejs/dagre).
    - Expand/Collapse nodes to focus on specific data segments.
    - Path Highlighting: Select any node to see its path (e.g., `root.users[0].address`).
    - "Copy Path" functionality for quick access to data selectors.
- **Code Generation**:
    - Instantly generate **TypeScript** interfaces.
    - Generate **Java** classes (with optional Lombok `@Data` support).
    - Clean, production-ready output powered by [Quicktype](https://quicktype.io/).
- **Powerful Editor**:
    - Built-in [Monaco Editor](https://microsoft.github.io/monaco-editor/) for JSON input.
    - Real-time syntax validation and error reporting.
    - Auto-formatting.
- **Modern UI**:
    - Built with [Tailwind CSS](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/).

## 🛠️ Technology Stack

- **Frontend Framework
  **: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistence).
- **Visualization**: [React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre).
- **Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react).
- **Code Generation**: [quicktype-core](https://github.com/quicktype/quicktype).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/).

## 💡 Philosophy

Working with massive JSON responses from APIs can be overwhelming. Standard collapsible tree views often fail to show
the "big picture" of data relationships.

**Schema Lens** was built with a simple philosophy: **See the structure, then see the code.**

Instead of just formatting JSON text, Schema Lens treats JSON as a graph of connected objects. This allows developers
to:

1. **Explore**: Navigate deeply nested structures visually.
2. **Understand**: See how arrays, objects, and primitives relate.
3. **Implement**: Immediately get the type definitions needed to consume that data in their application.

## 📦 Installation & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/nunosilva-dev/schema-lens.git
   cd schema-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the **MIT License**.
