import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { Clock, GraduationCapIcon, HelpCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Badge } from "../components/ui/badge"
import QuizResults from "./quiz-results"
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    sub?: string;
}

const token = localStorage.getItem("token");
let sub: string | null = null;

if (token) {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
    sub = decoded.sub || null;
}

interface Option {
    id: string
    text: string
}

interface Question {
    id: string
    question: string
    correctOptionId: string
    marksForCorrect: number
    marksForIncorrect: number
    options: Option[]
}

interface Quiz {
    id: number
    title: string
    playingTime: number
    instructorId: number
    instructorName: string
    instructorEmail: string
    level: string
    category: string
    thumbnailUrl: string
    questions: Question[]
}

export default function TestInterface() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>()
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [skippedQuestions, setSkippedQuestions] = useState<string[]>([])
    const [timeLeft, setTimeLeft] = useState(0)
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(true)
    const [resultData, setResultData] = useState<{
        totalMarks: number;
        marksAchieved: number;
        correctAnswers: number;
        wrongAnswers: number;
        totalQuestions: number;
        attemptedQuestions: number;
    } | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    useEffect(() => {
        if (!id) return

        setLoading(true)
        axios
            .get(`http://localhost:9092/auth/get-quiz/${id}`)
            .then((res) => {
                const quizData: Quiz = res.data
                setQuiz(quizData)
                setTimeLeft(quizData.playingTime)
                setCurrentQuestionIndex(0)
                setAnswers({})
                setSkippedQuestions([])
                setProgress(0)
            })
            .catch(() => {
                toast.error(`No quiz found with id: ${id}`)
            })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => {

        if (timeLeft <= 0 || isSubmitted) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    toast("Time's up!", {
                        description: "Your test has been submitted automatically.",
                        style: {
                            background: "green",
                            border: "green",
                        },
                    })
                    handleFinishTest()
                    setIsSubmitted(true);
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, isSubmitted])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    if (loading) return <div className="p-10 text-center">Loading quiz...</div>
    if (!quiz) return <div className="p-10 text-center text-red-600">Quiz not found.</div>
    if (!quiz.questions || quiz.questions.length === 0)
        return <div className="p-10 text-center">No questions available for this quiz.</div>

    const currentQuestion = quiz.questions[currentQuestionIndex]

    const handleAnswerChange = (value: string) => {
        setAnswers((prev) => {
            const newAnswers = {
                ...prev,
                [currentQuestion.id]: value,
            }

            if (skippedQuestions.includes(currentQuestion.id)) {
                setSkippedQuestions((prevSkipped) => prevSkipped.filter((q) => q !== currentQuestion.id))
            }

            const answeredCount = Object.keys(newAnswers).length
            setProgress(Math.round((answeredCount / quiz.questions.length) * 100))

            return newAnswers
        })
    }

    const handleClearAnswer = () => {
        setAnswers((prev) => {
            const newAnswers = { ...prev }
            delete newAnswers[currentQuestion.id]

            const answeredCount = Object.keys(newAnswers).length
            setProgress(Math.round((answeredCount / quiz.questions.length) * 100))

            return newAnswers
        })
    }

    const handleSkip = () => {
        if (!skippedQuestions.includes(currentQuestion.id)) {
            setSkippedQuestions((prev) => [...prev, currentQuestion.id])
        }

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handleFinishTest = async () => {
        if (isSubmitted) return;

        let correct = 0;
        let wrong = 0;
        let score = 0;

        quiz.questions.forEach((q) => {
            const userAnswer = answers[q.id];
            if (userAnswer === q.correctOptionId) {
                correct++;
                score += q.marksForCorrect;
            } else if (userAnswer && userAnswer !== q.correctOptionId) {
                wrong++;
                score += q.marksForIncorrect;
            }
        });

        const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marksForCorrect, 0);
        const totalQuestions = quiz.questions.length;
        const attemptedQuestions = Object.keys(answers).length;

        const submittedData = {
            quizId: quiz.id,
            sub: sub,
            totalMarks,
            marksAchieved: score,
            correctAnswers: correct,
            wrongAnswers: wrong,
            totalQuestions,
            attemptedQuestions,
        };

        try {
            await axios.post("http://localhost:9092/auth/submit-quiz", submittedData);
            setResultData(submittedData);

            toast.success("Test Submitted!", {
                description: `You answered ${attemptedQuestions} out of ${totalQuestions} questions.`,
                style: {
                    background: "green",
                    border: "green",
                },
            });
            setIsSubmitted(true);
            setShowResults(true);
        } catch (error: any) {
            toast.error("Failed to submit test result", {
                description: error.response?.data || "Something went wrong!",
            });
        }
    };

    const handleQuestionNavigation = (index: number) => {
        setCurrentQuestionIndex(index)
    }

    if (showResults && resultData && quiz) {
        return (
            <QuizResults
                totalMarks={resultData.totalMarks}
                marksAchieved={resultData.marksAchieved}
                correctAnswers={resultData.correctAnswers}
                wrongAnswers={resultData.wrongAnswers}
                quizTitle={quiz.title}
                totalQuestions={resultData.totalQuestions}
                attemptedQuestions={resultData.attemptedQuestions}
                onGoToHome={() => navigate("/quiz-list")}
                onRetryQuiz={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="border-b shrink-0">
                <div className="container mx-auto px-6 flex items-center justify-between py-5">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold">
                            <div className="flex justify-center items-center">
                                <div className="bg-[oklch(0.488_0.243_264.376)] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg mr-2">
                                    <GraduationCapIcon className="size-4" />
                                </div>
                                <span className="text-foreground">
                                    Intelliquest<span className="text-blue-500 text-3xl">.</span>
                                </span>
                            </div>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="border border-red-500 text-red-500 hover:text-red-500 px-6 py-2"
                            onClick={handleFinishTest}
                        >
                            <span className="mr-2">■</span> FINISH TEST
                        </Button>
                        <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-16 h-4" />
                            <span className="text-sm font-medium">{progress}%</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                            <Clock className="h-5 w-5" />
                            <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="container px-6 flex flex-1 gap-8 py-6 overflow-hidden">
                {/* Question area */}
                <div className="flex-1 !max-w-[920px] overflow-y-auto scrollbar-hidden">
                    <h2 className="text-3xl font-bold mb-8">
                        Q{currentQuestionIndex + 1}: {currentQuestion.question}
                    </h2>

                    <RadioGroup
                        value={answers[currentQuestion.id] || ""}
                        onValueChange={handleAnswerChange}
                        className="space-y-3"
                    >
                        {currentQuestion.options.map((option) => (
                            <div
                                key={option.id}
                                className={`flex items-center border rounded-lg p-4 transition-colors cursor-pointer ${answers[currentQuestion.id] === option.id
                                    ? "bg-background border-blue-500"
                                    : "hover:bg-muted"
                                    }`}
                                onClick={() => handleAnswerChange(option.id)}
                            >
                                <RadioGroupItem
                                    value={option.id}
                                    id={`option-${option.id}`}
                                    className="mr-4 h-4 w-4 rounded-full border border-gray-400 data-[state=checked]:bg-background"
                                />
                                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer text-base break-words">
                                    {option.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    <div className="flex gap-4 mt-8">
                        <Button
                            variant="outline"
                            className="px-6 py-5"
                            onClick={handleClearAnswer}
                            disabled={!answers[currentQuestion.id]}
                        >
                            <RotateCcw /> CLEAR ANSWER
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-10 w-10 p-5">
                                        <HelpCircle className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Need help with the test?</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Navigation sidebar */}
                <div className="w-106 border-l shrink-0 overflow-y-auto max-h-full scrollbar-hidden">
                    <div className="py-5 pl-8">
                        <h3 className="text-lg font-semibold">
                            {quiz.title} - {quiz.category}/{quiz.level}
                        </h3>
                        <div className="mb-5">
                            <span className="text-muted-foreground mr-1">by -</span> <Badge className="bg-cyan-500 text-foreground">{quiz.instructorName}</Badge> | <Badge>{quiz.instructorEmail}</Badge>
                        </div>
                        <div className="grid grid-cols-7 gap-3 justify-items-center">
                            {quiz.questions.map((q, i) => {
                                const answered = answers[q.id] !== undefined
                                const skipped = skippedQuestions.includes(q.id)
                                const isCurrent = i === currentQuestionIndex
                                return (
                                    <Button
                                        key={q.id}
                                        variant="outline"
                                        className={`h-10 w-10 p-0 text-sm font-medium transition-all ${isCurrent
                                            ? skipped
                                                ? "bg-red-500 text-foreground ring-2 ring-red-300 ring-offset-1 hover:bg-red-800"
                                                : answered
                                                    ? "bg-blue-600 text-foreground hover:bg-blue-700 ring-2 ring-blue-300 ring-offset-1"
                                                    : "bg-muted text-foreground ring-2 ring-foreground ring-offset-1"
                                            : answered
                                                ? "bg-blue-600 text-foreground hover:bg-blue-700"
                                                : skipped
                                                    ? "bg-red-500 text-foreground hover:bg-red-800"
                                                    : "hover:bg-muted"
                                            }`}
                                        onClick={() => handleQuestionNavigation(i)}
                                    >
                                        {i + 1}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-5 pl-8">
                        <div className="w-4 h-4 rounded-sm bg-red-500"></div>
                        <span className="text-sm text-muted-foreground">Skipped Question</span>
                    </div>

                    <div className="text-sm text-center ml-8 my-5 py-4 bg-gray-100 rounded-lg">
                        <span className="text-green-600 font-medium">Correct answer: +{quiz.questions[currentQuestionIndex]?.marksForCorrect ?? 0}</span>
                        <span className="mx-3 text-gray-400">|</span>
                        <span className="text-red-600 font-medium">Wrong answer: {quiz.questions[currentQuestionIndex]?.marksForIncorrect ?? 0}</span>
                    </div>

                    <div className="flex gap-3 py-5 pl-8">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            PREVIOUS
                        </Button>
                        <Button variant="outline" className="flex-1 py-3" onClick={handleSkip} disabled={!!answers[currentQuestion.id]}>
                            SKIP
                        </Button>
                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                                onClick={handleFinishTest}
                            >
                                SUBMIT
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                                onClick={handleNext}
                            >
                                NEXT
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
