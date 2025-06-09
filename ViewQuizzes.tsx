import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { AppSidebar } from "@/components/Sidebar/app-sidebar"
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
import { ModeToggle } from "../components/Sidebar/mode-toggle"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "../components/ui/badge"
import { Clock, Star, Trophy, Users, Zap } from "lucide-react"

type Quiz = {
    id: number
    title: string
    playingTime: number
    instructorId: number
    instructorName: string
    instructorEmail: string
    level: string
    category: string
    thumbnailUrl: string
    questions: {
        id: string
        question: string
        correctOptionId: string
        marksForCorrect: number
        marksForIncorrect: number
        options: { id: string; text: string }[]
    }[]
}

export default function ViewQuizzes() {
    const location = useLocation()
    const pathnames = location.pathname.split("/").filter((x) => x)
    const currentPage = pathnames[pathnames.length - 1]

    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [message, setMessage] = useState("")
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
    const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({})
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await axios.get("http://localhost:9092/auth/get-all-instructor-quizzes", {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (Array.isArray(res.data)) {
                    setQuizzes(res.data)
                    setMessage("")
                    fetchParticipantCounts(res.data)
                } else {
                    setQuizzes([])
                    setMessage(res.data)
                }
            } catch (error: any) {
                setMessage(error.response?.data || "Failed to load quizzes.")
            }
        }

        fetchQuizzes()
    }, [])

    const fetchParticipantCounts = async (quizzes: Quiz[]) => {
        const token = localStorage.getItem("token")
        const counts: Record<number, number> = {}
        await Promise.all(
            quizzes.map(async (quiz) => {
                try {
                    const res = await fetch(`http://localhost:9092/auth/quiz/${quiz.id}/participants`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    const data = await res.json()
                    counts[quiz.id] = data.totalParticipants ?? 0
                } catch (err) {
                    counts[quiz.id] = 0
                }
            })
        )

        setParticipantCounts(counts)
    }

    const confirmDelete = (quiz: Quiz) => {
        setSelectedQuiz(quiz)
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!selectedQuiz) return

        try {
            const token = localStorage.getItem("token")
            await axios.delete(`http://localhost:9092/auth/delete-quizzes/${selectedQuiz.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            setQuizzes((prev) => prev.filter((quiz) => quiz.id !== selectedQuiz.id))
            toast.success(`Quiz "${selectedQuiz.title}" deleted successfully.`, {
                style: { backgroundColor: "#16a34a", color: "white" },
            })

            setTimeout(() => {
                window.location.reload()
            }, 4000)
        } catch (error: any) {
            toast.error(error.response?.data || "Something went wrong.", {
                style: { backgroundColor: "#dc2626", color: "white" },
            })
        } finally {
            setDialogOpen(false)
            setSelectedQuiz(null)
        }
    }

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
                                <BreadcrumbItem className="hidden md:block">Admin</BreadcrumbItem>
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

                <div className="pt-0 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {message ? (
                        <p className="text-muted-foreground">{message}</p>
                    ) : (
                        quizzes.map((quiz) => {
                            const totalPoints = quiz.questions.reduce((acc, q) => acc + q.marksForCorrect, 0)
                            const durationMinutes = Math.floor(quiz.playingTime / 60)

                            return (
                                <Card
                                    key={quiz.id}
                                    className="gap-4 overflow-hidden rounded-2xl border-0 bg-secondary p-0 transition duration-300 group"
                                >
                                    <CardHeader className="p-0">
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={quiz.thumbnailUrl}
                                                alt={quiz.title}
                                                width={400}
                                                height={240}
                                                className="w-full h-60 object-cover rounded-t-2xl transform transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge variant="secondary" className="bg-white/90 text-gray-800 font-semibold">
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                    Featured
                                                </Badge>
                                                <Badge className="bg-cyan-500 text-white font-semibold">
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Live
                                                </Badge>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <Badge variant="outline" className="bg-white/90 text-gray-800 border-yellow-400">
                                                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                                    4.8
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="px-6 pb-6 space-y-4">
                                        <div className="mb-4">
                                            <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                                                    {quiz.level}
                                                </Badge>
                                                <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                                                    {quiz.category}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                            <div className="bg-gray-200 rounded-xl p-3 text-center">
                                                <div className="text-2xl font-bold text-black">{quiz.questions.length}</div>
                                                <div className="text-sm text-black">Questions</div>
                                            </div>
                                            <div className="bg-gray-200 rounded-xl p-3 text-center">
                                                <div className="flex items-center justify-center mb-1">
                                                    <Clock className="w-4 h-4 mr-1 text-black" />
                                                    <span className="text-2xl font-bold text-black">{durationMinutes}</span>
                                                </div>
                                                <div className="text-sm text-black">Minutes</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-primary" />
                                                <span className="text-sm text-primary"> {participantCounts[quiz.id] !== undefined
                                                    ? `${participantCounts[quiz.id]} participant${participantCounts[quiz.id] === 1 ? "" : "s"}`
                                                    : "Loading..."}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Trophy className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-semibold text-primary">{totalPoints} Points</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-primary font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl"
                                            onClick={() => confirmDelete(quiz)}
                                        >
                                            Delete Quiz
                                        </Button>

                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">
                                                By: <span className="font-medium">{quiz.instructorName} | {quiz.instructorEmail} </span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you sure you want to delete "{selectedQuiz?.title}" quiz?
                            </AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="text-foreground bg-destructive-foreground hover:bg-destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SidebarInset>
        </SidebarProvider>
    )
}
