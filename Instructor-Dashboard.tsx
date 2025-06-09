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

import { Card, CardHeader } from "./components/ui/card"
import { ModeToggle } from "./components/Sidebar/mode-toggle"
import { BarComponent } from "./BarComponent"
import { RadialComponent } from "./Radial"
import { TableDemo } from "./Table"
import { AlertCircle, SquareLibrary, SquareSigma, Wallet } from "lucide-react"
import { useEffect, useState } from "react";
import axios from "axios";
import SalesChart from "./Line";

export default function InstructorDashboard() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    const currentPage = pathnames[pathnames.length - 1];
    const [totalCourses, setTotalCourses] = useState<number | null>(null);
    const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
    const [totalQuizzes, setTotalQuizzes] = useState<number | null>(null)

    useEffect(() => {
        const fetchTotalCourses = async () => {
            try {
                const response = await axios.get("http://localhost:9092/auth/instructor/total-courses", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setTotalCourses(response.data.totalCourses);
            } catch (error) {
                console.error("Error fetching total courses:", error);
            }
        };

        fetchTotalCourses();
    }, []);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const response = await axios.get("http://localhost:9092/auth/instructor/total-revenue", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setTotalRevenue(response.data.totalRevenue);
            } catch (error) {
                console.error("Error fetching total revenue:", error);
            }
        };

        fetchRevenue();
    }, []);

     useEffect(() => {
        const fetchTotalQuizzes = async () => {
            try {
                const response = await axios.get("http://localhost:9092/auth/total-quizzes", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
                setTotalQuizzes(response.data.totalQuizzes)
            } catch (error) {
                console.error("Error fetching total quizzes:", error)
            }
        }

        fetchTotalQuizzes()
    }, [])

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
                <div className="flex flex-col gap-4 p-4 pt-0">
                    <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
                        <Card className="flex flex-col justify-center items-center text-center p-4 min-h-[150px]">
                            <CardHeader className="flex flex-col items-center">
                                <SquareLibrary className="h-8 w-8" />
                                <span className="text-lg font-semibold">Total No. of Courses</span>
                                <span className="text-2xl font-bold">{totalCourses !== null ? totalCourses : <span className="text-destructive-foreground text-sm font-medium"><AlertCircle/></span>}</span>
                            </CardHeader>
                        </Card>

                        <Card className="flex flex-col justify-center items-center text-center p-4 min-h-[150px]">
                            <CardHeader className="flex flex-col items-center">
                                <SquareSigma className="h-8 w-8" />
                                <span className="text-lg font-semibold">Total No. of Quizzes</span>
                                <span className="text-2xl font-bold">{totalQuizzes !== null ? totalQuizzes : <span className="text-destructive-foreground text-sm font-medium"><AlertCircle/></span>}</span>
                            </CardHeader>
                        </Card>

                        <Card className="flex flex-col justify-center items-center text-center p-4 min-h-[150px]">
                            <CardHeader className="flex flex-col items-center">
                                <Wallet className="h-8 w-8" />
                                <span className="text-lg font-semibold">Total Revenue</span>
                                <span className="text-2xl font-bold">
                                    {totalRevenue !== null ? `₹${totalRevenue.toLocaleString("en-IN")}` : <span className="text-destructive-foreground text-sm font-medium"><AlertCircle/></span>}
                                </span>

                            </CardHeader>
                        </Card>
                    </div>
                    <div>
                        <SalesChart />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BarComponent />
                        <RadialComponent />
                    </div>
                    <div>
                        <TableDemo />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
