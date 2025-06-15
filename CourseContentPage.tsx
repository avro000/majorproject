"use client"

import React, { useRef } from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ReactPlayer from "react-player"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  FileText,
  Play,
  Download,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  DownloadIcon,
  Share2,
  ArrowLeft,
  Trophy,
  Star,
  Target,
  Zap,
  Users,
  TrendingUp,
} from "lucide-react"
import axios from "axios"

import { Worker, Viewer } from "@react-pdf-viewer/core"
import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"

import {
  CertificateDialog,
  CertificateDialogContent,
  CertificateDialogHeader,
  CertificateDialogTitle,
} from "@/components/ui/certificate-dialog"
import jsPDF from "jspdf"
import { toPng } from "html-to-image";

interface Lesson {
  id: string
  title: string
  type: "video" | "pdf"
  url: string
  completed: boolean
  duration?: string
}

type Props = {
  userName: string
  courseTitle: string
  lessons: { id: string }[]
}

const CourseContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [courseTitle, setCourseTitle] = useState("")
  const token = localStorage.getItem("token")
  const certificateRef = useRef<HTMLDivElement | null>(null)

  const [showCertificate, setShowCertificate] = useState(false)
  const [certificateGenerated, setCertificateGenerated] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [course, setCourse] = useState<any>(null)

  // Calculate progress
  const completedLessons = lessons.filter((lesson) => lesson.completed).length
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:9092/auth/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const user = res.data
        setUserName(user.username || user.email || "Student")
      } catch (err) {
        console.error("Failed to fetch user name", err)
      }
    }

    if (token) fetchUser()
  }, [token])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)

        const [courseRes, progressRes] = await Promise.all([
          axios.get(`http://localhost:9092/auth/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:9092/auth/courses/${id}/progress`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const courseData = courseRes.data
        const completedLessonIds: string[] = progressRes.data

        setCourseTitle(courseData.title || "Course Content")
        setCourse(courseData)

        const videoLessons: Lesson[] = courseData.topics.flatMap((topic: any) =>
          topic.subtopics.flatMap((sub: any) =>
            sub.videos.map((video: any, index: number) => {
              const id = `video-${topic.name}-${sub.name}-${index}`
              return {
                id,
                title: video.title,
                type: "video",
                url: video.url,
                completed: completedLessonIds.includes(id),
                duration: video.duration || "5 min",
              }
            }),
          ),
        )

        const pdfLessons: Lesson[] = (courseData.studyMaterials || []).map((doc: any, index: number) => {
          const id = `pdf-${index}`
          return {
            id,
            title: doc.name,
            type: "pdf",
            url: doc.fileUrl,
            completed: completedLessonIds.includes(id),
          }
        })

        const allLessons = [...videoLessons, ...pdfLessons]
        setLessons(allLessons)
        setSelectedLesson(allLessons[0])
      } catch (err) {
        console.error("Failed to fetch course lessons", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  useEffect(() => {
    let currentBlobUrl: string | null = null

    const fetchPdfBlob = async () => {
      if (selectedLesson?.type === "pdf") {
        try {
          const response = await axios.get(selectedLesson.url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          })

          const blob = new Blob([response.data], { type: "application/pdf" })
          const blobUrl = URL.createObjectURL(blob)
          currentBlobUrl = blobUrl
          setPdfBlobUrl(blobUrl)
        } catch (error) {
          console.error("Failed to fetch PDF blob:", error)
          setPdfBlobUrl(null)
        }
      } else {
        setPdfBlobUrl(null)
      }
    }

    fetchPdfBlob()

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }
    }
  }, [selectedLesson, token])

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
      }
    }
  }, [pdfBlobUrl])

  // Check for course completion and show certificate
  useEffect(() => {
    const certificateSeenKey = `certificateSeen-${id}`

    const hasSeenCertificate = localStorage.getItem(certificateSeenKey) === "true"

    if (lessons.length > 0 && completedLessons === lessons.length && !hasSeenCertificate) {
      setShowCertificate(true)
      setCertificateGenerated(true)
      localStorage.setItem(certificateSeenKey, "true")
    }
  }, [completedLessons, lessons.length, id])

  const markLessonComplete = async () => {
    if (!selectedLesson || selectedLesson.completed) return

    try {
      await axios.put(
        `http://localhost:9092/auth/courses/${id}/lessons/${selectedLesson.id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setLessons((prev) =>
        prev.map((lesson) => (lesson.id === selectedLesson.id ? { ...lesson, completed: true } : lesson)),
      )
    } catch (err) {
      console.error("Failed to mark lesson as complete:", err)
    }
  }

  const handleDownloadPdf = async () => {
    if (!selectedLesson?.url) return
    try {
      const downloadUrl = selectedLesson.url.replace("download=false", "download=true")

      const response = await axios.get(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      })

      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedLesson.title}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed", error)
    }
  }

  const generateCertificatePDF = async () => {
    if (!certificateRef.current) {
      console.error("Certificate element not found.");
      return;
    }

    const certificateElement = certificateRef.current;
    const originalBg = certificateElement.style.backgroundColor;
    const originalBorder = certificateElement.style.border;
    const originalBorderRadius = certificateElement.style.borderRadius;

    certificateElement.style.backgroundColor = "#ffffff";
    certificateElement.style.border = "none";
    certificateElement.style.borderRadius = "0";

    try {
      const dataUrl = await toPng(certificateElement, {
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const pdf = new jsPDF("landscape", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgAspect = img.width / img.height;
        const pageAspect = pageWidth / pageHeight;

        let imgWidth, imgHeight;

        if (imgAspect > pageAspect) {
          imgWidth = pageWidth - 20;
          imgHeight = imgWidth / imgAspect;
        } else {
          imgHeight = pageHeight - 20;
          imgWidth = imgHeight * imgAspect;
        }

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.setDrawColor(184, 134, 11)
        pdf.setLineWidth(3)
        pdf.rect(3, 3, pageWidth - 6, pageHeight - 6)

        pdf.setDrawColor(55, 65, 81) 
        pdf.setLineWidth(1)
        pdf.rect(8, 8, pageWidth - 16, pageHeight - 16)

        pdf.setDrawColor(184, 134, 11)
        pdf.setLineWidth(2)

        pdf.line(15, 15, 25, 15)
        pdf.line(15, 15, 15, 25)
        pdf.line(15, 20, 20, 20)
        pdf.line(20, 15, 20, 20)

        pdf.line(pageWidth - 25, 15, pageWidth - 15, 15)
        pdf.line(pageWidth - 15, 15, pageWidth - 15, 25)
        pdf.line(pageWidth - 20, 15, pageWidth - 20, 20)
        pdf.line(pageWidth - 20, 20, pageWidth - 15, 20)

        pdf.line(15, pageHeight - 25, 15, pageHeight - 15)
        pdf.line(15, pageHeight - 15, 25, pageHeight - 15)
        pdf.line(15, pageHeight - 20, 20, pageHeight - 20)
        pdf.line(20, pageHeight - 20, 20, pageHeight - 15)

        pdf.line(pageWidth - 15, pageHeight - 25, pageWidth - 15, pageHeight - 15)
        pdf.line(pageWidth - 25, pageHeight - 15, pageWidth - 15, pageHeight - 15)
        pdf.line(pageWidth - 20, pageHeight - 20, pageWidth - 15, pageHeight - 20)
        pdf.line(pageWidth - 20, pageHeight - 20, pageWidth - 20, pageHeight - 15)

        pdf.setLineWidth(0.5)
        pdf.setDrawColor(156, 163, 175) 

        for (let i = 30; i < pageWidth - 30; i += 10) {
          pdf.line(i, 6, i + 5, 6)
          pdf.line(i, pageHeight - 6, i + 5, pageHeight - 6)
        }

        for (let i = 30; i < pageHeight - 30; i += 10) {
          pdf.line(6, i, 6, i + 5)
          pdf.line(pageWidth - 6, i, pageWidth - 6, i + 5)
        }

        pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
        pdf.save(`${courseTitle}-Certificate.pdf`);
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      certificateElement.style.backgroundColor = originalBg;
      certificateElement.style.border = originalBorder;
      certificateElement.style.borderRadius = originalBorderRadius;
    }
  };

  const ProfessionalCertificate = React.forwardRef<HTMLDivElement, Props>(({ userName, courseTitle, lessons }, ref) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return (
      <div
        ref={ref}
        role="document"
        aria-label={`Certificate for ${userName}`}
        className="bg-white text-gray-900 rounded-3xl border border-gray-300 dark:border-gray-700 shadow-none px-12 py-10 md:px-20 md:py-16 font-serif max-w-5xl mx-auto"
        style={{
          width: "900px",
          aspectRatio: "9 / 7",
        }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full shadow-md">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Certificate of Completion</h1>
        </div>

        {/* Body */}
        <div className="text-center mb-12">
          <p className="text-lg mb-3">This certifies that</p>
          <h2 className="text-3xl md:text-4xl font-bold underline underline-offset-4 decoration-blue-600 mb-4">
            {userName}
          </h2>
          <p className="text-lg mb-4">has successfully completed the course</p>
          <h3 className="text-2xl font-semibold italic text-gray-800 mb-6">{courseTitle}</h3>
          <p className="text-base leading-relaxed text-gray-700 max-w-2xl mx-auto">
            Through {lessons.length} structured and in-depth lessons, the student demonstrated consistent effort,
            critical thinking, and the ability to apply concepts effectively — reflecting both academic growth and
            essential professional skills.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-8 border-gray-300 gap-8">
          {/* Date */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 mb-1 uppercase">Date of Completion</p>
            <p className="text-lg font-semibold">{currentDate}</p>
          </div>

          {/* Signature */}
          <div className="text-center">
            <img
              src="/signature.png"
              alt="Signature"
              className="h-16 object-contain mb-1"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <p className="font-semibold text-gray-800 ">Arjun Verma</p>
            <p className="text-sm text-gray-500 ">CEO, IntelliQuest</p>
          </div>

          {/* Issuer */}
          <div className="text-center md:text-right">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-md">
              <p className="text-sm uppercase mb-1 opacity-80">Issued by</p>
              <p className="text-lg font-bold">IntelliQuest</p>
              <p className="text-xs opacity-75">Learning Platform</p>
            </div>
          </div>
        </div>
      </div>
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xl font-medium">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (!selectedLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950">
        <div className="text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4 inline-block">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Content Available</h2>
          <p className="text-gray-600 dark:text-gray-400">This course doesn't have any lessons yet.</p>
          <Button
            onClick={() => navigate("/UserDashboard")}
            className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 overflow-hidden">
      <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col h-full">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0 bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200/100 dark:border-gray-700/50 px-8 py-6 shadow-none backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate("/UserDashboard")}
                  variant="outline"
                  className="rounded-xl px-6 py-2
             bg-gray-100/80 dark:bg-white/10 
             backdrop-blur-sm 
             border border-gray-300 dark:border-white/20 
             text-gray-800 dark:text-white 
             hover:bg-gray-200 dark:hover:bg-white/20 
             hover:text-black dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                    {courseTitle}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {completedLessons} of {lessons.length} lessons completed
                    </p>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(progressPercentage)}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</p>
                </div>
                <div className="w-40">
                  <Progress value={progressPercentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Content Viewer with separate scroll */}
          <div className="flex-1 p-8 overflow-y-auto scrollbar-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 border-b border-gray-200/100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                        {selectedLesson.type === "video" ? (
                          <Play className="h-6 w-6 text-white" />
                        ) : (
                          <FileText className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedLesson.type === "video" ? "Video Lesson" : "Study Material"}
                        </p>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={selectedLesson.completed ? "default" : "secondary"}
                        className={`font-medium px-4 py-2 rounded-xl ${selectedLesson.completed
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                      >
                        {selectedLesson.completed ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          "In Progress"
                        )}
                      </Badge>
                      {selectedLesson.type === "video" && selectedLesson.duration && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-2 font-medium px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                        >
                          <Clock className="h-4 w-4" />
                          <span>{selectedLesson.duration}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-6">
                  {selectedLesson.type === "video" ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
                      <ReactPlayer
                        url={selectedLesson.url}
                        controls
                        width="100%"
                        height="500px"
                        onEnded={markLessonComplete}
                      />
                    </div>
                  ) : pdfBlobUrl ? (
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <Button
                          onClick={handleDownloadPdf}
                          variant="outline"
                          className="flex items-center gap-2 font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-6 py-3"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download PDF</span>
                        </Button>
                      </div>
                      <div className="w-full h-[500px] border border-gray-200/100 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-none">
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                          <Viewer fileUrl={pdfBlobUrl} />
                        </Worker>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl">
                      <div className="text-center">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 mx-auto mb-4"></div>
                          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading content...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Sidebar with fixed header, scrollable content, and fixed footer */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-96 bg-white/90 dark:bg-gray-800/90 border-l border-gray-200/100 dark:border-gray-700/50 shadow-none flex flex-col h-full"
        >
          {/* Fixed Sidebar Header */}
          <div className="flex-shrink-0 p-8 border-b border-gray-200/100 dark:border-gray-700/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Content</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Overall Progress</span>
                <span className="font-bold text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {completedLessons} of {lessons.length} lessons completed
                </p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
            </div>
            {progressPercentage === 100 && (
              <Button
                onClick={() => setShowCertificate(true)}
                className="w-full mt-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Award className="h-5 w-5 mr-2" />
                <span>View Certificate</span>
              </Button>
            )}
          </div>

          {/* Scrollable Lessons List */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hidden">
            <div className="space-y-3">
              <AnimatePresence>
                {lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${selectedLesson.id === lesson.id
                      ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border-blue-300 dark:border-blue-600 shadow-lg transform scale-105"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {lesson.completed ? (
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-full shadow-lg">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        ) : lesson.type === "video" ? (
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-full shadow-lg">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-full shadow-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Lesson {index + 1}
                          </span>
                          {lesson.completed && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                              ✓ Done
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-tight">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium px-3 py-1 rounded-lg ${lesson.type === "video"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-700"
                              : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-700"
                              }`}
                          >
                            {lesson.type === "video" ? "Video" : "PDF"}
                          </Badge>
                          {lesson.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed Action Button */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200/100 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
            <Button
              onClick={markLessonComplete}
              disabled={selectedLesson?.completed}
              className={`w-full font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${selectedLesson?.completed
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white"
                }`}
            >
              {selectedLesson?.completed ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Lesson Completed
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Professional Certificate Modal */}
      <CertificateDialog open={showCertificate} onOpenChange={setShowCertificate}>
        <CertificateDialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto scrollbar-hide p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50">
          <CertificateDialogHeader className="pb-6">
            <CertificateDialogTitle className="flex justify-center items-center gap-4 text-2xl">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-full shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Congratulations! Course Completed
              </span>
            </CertificateDialogTitle>
          </CertificateDialogHeader>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50 rounded-3xl border-2 border-green-200/50 dark:border-green-800/50 shadow-xl"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-4 rounded-full shadow-lg animate-pulse">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
                🎉 Outstanding Achievement!
              </h3>
              <p className="text-green-700 dark:text-green-300 font-medium leading-relaxed text-lg">
                You have successfully completed all {lessons.length} lessons in "
                <span className="font-bold">{courseTitle}</span>". Your commitment to excellence is truly commendable!
              </p>
              <div className="flex justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Join</p>
                    <p className="font-bold text-gray-900 dark:text-white">5,000+ Graduates</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Skill Level</p>
                    <p className="font-bold text-gray-900 dark:text-white">Advanced</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center overflow-x-auto"
            >
              <div className="min-w-fit">
                <ProfessionalCertificate
                  ref={certificateRef}
                  userName={userName}
                  courseTitle={courseTitle}
                  lessons={lessons}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center gap-4 pt-6"
            >
              <Button
                onClick={generateCertificatePDF}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <DownloadIcon className="h-5 w-5" />
                <span>Download Certificate</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Course Completion Certificate",
                      text: `I just completed the course "${courseTitle}"!`,
                      url: window.location.href,
                    })
                  }
                }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Share2 className="h-5 w-5" />
                <span>Share Achievement</span>
              </Button>
            </motion.div>
          </div>
        </CertificateDialogContent>
      </CertificateDialog>
    </div>
  )
}

export default CourseContentPage
