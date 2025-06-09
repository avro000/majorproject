import { useEffect, useState } from "react"
import { UserNavbar } from "../components/UserDashboard/UserNavbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Trophy, Zap, Star, Clock, Users, AlertCircleIcon } from "lucide-react"

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

export default function PlayQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch("http://localhost:9092/auth/get-all-quizzes")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        return res.json();
      })
      .then(data => {
        setQuizzes(data);

        const fetchCounts = data.map((quiz: Quiz) =>
          fetch(`http://localhost:9092/auth/quiz/${quiz.id}/participants`)
            .then(res => res.json())
            .then(result => ({ quizId: quiz.id, count: result.totalParticipants || 0 }))
            .catch(() => ({ quizId: quiz.id, count: 0 }))
        );

        Promise.all(fetchCounts).then(results => {
          const countsMap: Record<number, number> = {};
          results.forEach(({ quizId, count }) => {
            countsMap[quizId] = count;
          });
          setParticipantCounts(countsMap);
        });
      })
      .catch(err => console.error("Error fetching quizzes:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <UserNavbar />
        <div className="mt-10 text-center text-gray-400">Loading quizzes...</div>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="flex justify-center items-center mt-10">
        <UserNavbar />
        <div className="mt-10 text-center text-red-500 flex flex-row items-center gap-2"><AlertCircleIcon/> No quizzes available.</div>
      </div>
    )
  }

  return (
    <div>
      <UserNavbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 p-4">
        {quizzes.map((quiz) => {
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
                    <span className="text-sm text-primary">
                      {participantCounts[quiz.id] !== undefined
                        ? `${participantCounts[quiz.id]} participants`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-primary">{totalPoints} Points</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  onClick={() => window.location.href = `/play-quiz/${quiz.id}`}
                >
                  Play Quiz
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    By:{" "}
                    <span className="font-medium">
                      {quiz.instructorName} | {quiz.instructorEmail}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
