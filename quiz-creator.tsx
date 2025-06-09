import { AppSidebar } from "@/components/Sidebar/app-sidebar"
import { useLocation } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "../components/Sidebar/mode-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TimeSelector } from "../components/time-selector"

import type React from "react"
import { useState } from "react"
import { PlusCircle, Trash2, Clock } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"


function generateRandomId(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

interface QuizOption {
  id: string
  text: string
}

interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  correctOptionId: string
  marksForCorrect: number
  marksForIncorrect: number
}

export default function QuizCreator() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)
  const currentPage = pathnames[pathnames.length - 1]

  const [quizTitle, setQuizTitle] = useState<string>("")
  const [quizDurationSeconds, setQuizDurationSeconds] = useState<number>(1800)
  const [quizLevel, setQuizLevel] = useState<string>("Beginner")
  const [quizCategory, setQuizCategory] = useState<string>("General")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: generateRandomId(),
      question: "",
      options: [
        { id: generateRandomId(), text: "" },
        { id: generateRandomId(), text: "" },
        { id: generateRandomId(), text: "" },
        { id: generateRandomId(), text: "" },
      ],
      correctOptionId: "",
      marksForCorrect: 10,
      marksForIncorrect: -1,
    },
  ])

  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: generateRandomId(),
      question: "",
      options: [
        { id: generateRandomId(), text: "" },
        { id: generateRandomId(), text: "" },
        { id: generateRandomId(), text: "" },
        { id: generateRandomId(), text: "" },
      ],
      correctOptionId: "",
      marksForCorrect: 10,
      marksForIncorrect: -1,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, question: text } : q)))
  }

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedOptions = q.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt))
          return { ...q, options: updatedOptions }
        }
        return q
      }),
    )
  }

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, correctOptionId: optionId } : q)))
  }

  const handleTimeChange = (totalSeconds: number) => {
    setQuizDurationSeconds(totalSeconds)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    const quizData = {
      title: quizTitle,
      playingTime: quizDurationSeconds,
      level: quizLevel,
      category: quizCategory,
      questions: questions,
    }

    formData.append("quizDTO", new Blob([JSON.stringify(quizData)], { type: "application/json" }))

    if (thumbnail) formData.append("thumbnail", thumbnail)

    const token = localStorage.getItem("token")

    try {
      const response = await fetch("http://localhost:9092/auth/create-quiz", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      console.log(quizData)
      const message = await response.text()

      if (!response.ok) {
        console.error("❌ Error message:", message)
        toast.error("Error creating quiz!", {
          description: message,
          style: { backgroundColor: "#dc2626", color: "white" },
        })
      } else {
        console.log("✅ Success message:", message)
        toast.success("Quiz created successfully!", {
          description: message,
          style: { backgroundColor: "#16a34a", color: "white" },
        })
        setTimeout(() => window.location.reload(), 4000)
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      toast.error("Network error!", {
        description: "Please check console for details.",
        style: { backgroundColor: "#dc2626", color: "white" },
      })
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
          <h1 className="text-3xl font-bold">Quiz Creator</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Quiz Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="quiz-title" className="mb-[16px]">
                    Title
                  </Label>
                  <Input
                    id="quiz-title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                    required
                  />
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Quiz Level */}
                  <div>
                    <Label htmlFor="quiz-level" className="mb-[16px]">Quiz Level</Label>
                    <Select value={quizLevel} onValueChange={setQuizLevel}>
                      <SelectTrigger id="quiz-level" className="w-full">
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quiz Category */}
                  <div>
                    <Label htmlFor="quiz-category" className="mb-[16px]">Quiz Category</Label>
                    <Select value={quizCategory} onValueChange={setQuizCategory}>
                      <SelectTrigger id="quiz-category" className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Quiz Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="quiz-thumbnail" className="mb-[16px] block">
                    Upload Image (JPG, PNG)
                  </Label>
                  <Input
                    id="quiz-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                    required
                  />
                </CardContent>
              </Card>


              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Quiz Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label className="mb-4 block">Set the time limit for this quiz</Label>
                  <TimeSelector onTimeChange={handleTimeChange} initialTime={{ hours: 0, minutes: 30, seconds: 0 }} />
                </CardContent>
              </Card>

              {questions.map((quiz, index) => (
                <Card key={quiz.id} className="shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Question {index + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(quiz.id)}
                        className="hover:bg-destructive-foreground/20"
                        aria-label={`Remove Question ${index + 1}`}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`${quiz.id}`} className="mb-[16px]">
                        Question
                      </Label>
                      <Input
                        id={`${quiz.id}`}
                        value={quiz.question}
                        onChange={(e) => updateQuestionText(quiz.id, e.target.value)}
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Options</Label>
                      <RadioGroup
                        value={quiz.correctOptionId}
                        onValueChange={(value) => setCorrectOption(quiz.id, value)}
                      >
                        {quiz.options.map((option, optionIndex) => (
                          <div key={option.id} className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              aria-label={`Mark option ${optionIndex + 1} as correct`}
                            />
                            <div className="flex-1">
                              <Input
                                value={option.text}
                                onChange={(e) => updateOptionText(quiz.id, option.id, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                      <p className="text-sm text-muted-foreground">
                        Select the radio button next to the correct answer.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <Label htmlFor={`marks-correct-${quiz.id}`} className="mb-[16px]">Marks (Correct)</Label>
                        <Input
                          type="number"
                          id={`marks-correct-${quiz.id}`}
                          value={quiz.marksForCorrect}
                          onChange={(e) =>
                            setQuestions(questions.map((q) =>
                              q.id === quiz.id ? { ...q, marksForCorrect: Number(e.target.value) } : q
                            ))
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor={`marks-incorrect-${quiz.id}`} className="mb-[16px]">Marks (Incorrect)</Label>
                        <Input
                          type="number"
                          id={`marks-incorrect-${quiz.id}`}
                          value={quiz.marksForIncorrect}
                          onChange={(e) =>
                            setQuestions(questions.map((q) =>
                              q.id === quiz.id ? { ...q, marksForIncorrect: Number(e.target.value) } : q
                            ))
                          }
                        />
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Button type="button" variant="outline" onClick={addNewQuestion} className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Add Another Question
              </Button>
              <Button type="submit" className="sm:ml-auto">
                Save Quiz
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
