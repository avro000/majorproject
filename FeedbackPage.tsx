import { AppSidebar } from "@/components/Sidebar/app-sidebar"
import { useLocation } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./components/Sidebar/mode-toggle"
import { FeedbackForm } from "./FeedbackForm";


export default function FeedbackPage() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    const currentPage = pathnames[pathnames.length - 1];
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <span>Admin</span>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="capitalize">{currentPage}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="px-4">
                        <ModeToggle />
                    </div>
                </header>
                <div className="p-5">
                    <FeedbackForm/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
