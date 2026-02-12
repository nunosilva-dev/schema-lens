import {TooltipProvider} from "@/components/ui/tooltip"
import {Toaster} from "@/components/ui/sonner"
import {MainLayout} from "@/components/layout/MainLayout"

function App() {
    return (
        <TooltipProvider delayDuration={300}>
            <MainLayout/>
            <Toaster/>
        </TooltipProvider>
    )
}

export default App
