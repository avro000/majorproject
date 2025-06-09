import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, BarChart3, Award, RefreshCw, House } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"

interface QuizResultsProps {
    totalMarks: number
    marksAchieved: number
    correctAnswers: number
    wrongAnswers: number
    quizTitle?: string
    totalQuestions: number;
    attemptedQuestions?: number;
    onGoToHome?: () => void
    onRetryQuiz?: () => void
}

export default function QuizResults({
    totalMarks = 0,
    marksAchieved = 0,
    correctAnswers = 0,
    wrongAnswers = 0,
    quizTitle = "null",
    totalQuestions = 0,
    attemptedQuestions = 0,
    onGoToHome = () => { },
    onRetryQuiz = () => { },
}: QuizResultsProps) {
    const [progress, setProgress] = useState(0)
    const percentage = Math.round((marksAchieved / totalMarks) * 100)
    const completionPercentage = Math.round((attemptedQuestions / totalQuestions) * 100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(percentage)
        }, 300)

        if (percentage >= 80) {
            const duration = 3 * 1000
            const end = Date.now() + duration

            const runConfetti = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ["#5EEAD4", "#0EA5E9", "#8B5CF6"],
                })

                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ["#5EEAD4", "#0EA5E9", "#8B5CF6"],
                })

                if (Date.now() < end) {
                    requestAnimationFrame(runConfetti)
                }
            }

            runConfetti()
        }

        return () => clearTimeout(timer)
    }, [percentage])

    const getResultMessage = () => {
        if (percentage >= 90) return "Outstanding!"
        if (percentage >= 80) return "Excellent!"
        if (percentage >= 70) return "Great job!"
        if (percentage >= 60) return "Good effort!"
        return "Keep practicing!"
    }

    const getGradientClass = () => {
        if (percentage >= 90) return "from-muted/30 to-accent/20 dark:from-muted/10 dark:to-accent/10"
        if (percentage >= 70) return "from-muted/20 to-secondary/30 dark:from-muted/10 dark:to-secondary/20"
        if (percentage >= 50) return "from-secondary/20 to-muted/30 dark:from-secondary/10 dark:to-muted/20"
        return "from-muted/10 to-secondary/20 dark:from-muted/5 dark:to-secondary/10"
    }

    return (
        <div className="flex min-h-[80vh] w-full items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className={`overflow-hidden bg-gradient-to-br ${getGradientClass()} shadow-lg`}>
                    <CardHeader className="pb-2 text-center">
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        >
                            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Quiz Submitted Successfully!</CardTitle>
                            <CardDescription className="text-lg font-medium">{quizTitle}</CardDescription>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="space-y-6 pb-2">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2 text-center"
                        >
                            <h3 className="text-xl font-bold text-primary">{getResultMessage()}</h3>
                            <div className="text-3xl font-bold">
                                {marksAchieved} <span className="text-muted-foreground">/ {totalMarks}</span>
                            </div>
                            <Progress value={progress} className="h-2.5" />
                            <p className="text-sm text-muted-foreground">{percentage}% Score</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="rounded-lg bg-black/20 p-4 text-center dark:bg-white/10">
                                <div className="mb-1 flex items-center justify-center gap-1.5">
                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    <span className="font-medium">Correct</span>
                                </div>
                                <p className="text-2xl font-bold">{correctAnswers}</p>
                            </div>

                            <div className="rounded-lg bg-black/20 p-4 text-center dark:bg-white/10">
                                <div className="mb-1 flex items-center justify-center gap-1.5">
                                    <XCircle className="h-5 w-5 text-rose-500" />
                                    <span className="font-medium">Wrong</span>
                                </div>
                                <p className="text-2xl font-bold">{wrongAnswers}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="rounded-lg bg-black/10 p-4 dark:bg-white/10"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <h4 className="font-medium">Performance Summary</h4>
                            </div>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span>Accuracy</span>
                                    <span className="font-medium">
                                        {Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Completion</span>
                                    <span className="font-medium">{completionPercentage}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Time Efficiency</span>
                                    <span className="font-medium">Good</span>
                                </div>
                            </div>
                        </motion.div>
                    </CardContent>

                    <CardFooter className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="w-full" onClick={onGoToHome}>
                            <House className="h-4 w-4" /> Home
                        </Button>
                        <Button className="w-full" onClick={onRetryQuiz}>
                            <RefreshCw className="h-4 w-4" /> Retry Quiz
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
