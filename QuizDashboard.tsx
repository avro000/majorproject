import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Star, Clock, Diamond, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { UserNavbar } from "@/components/UserDashboard/UserNavbar"
import axios from "axios"
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    sub: string;
    name: string;
}

const getTierIcon = (tier: string) => {
    switch (tier) {
        case "diamond":
            return <Diamond className="h-5 w-5 text-blue-400" />
        case "gold":
            return <Medal className="h-5 w-5 text-amber-500" />
        case "silver":
            return <Medal className="h-5 w-5 text-gray-400" />
        case "bronze":
            return <Medal className="h-5 w-5 text-amber-700" />
        default:
            return <Medal className="h-5 w-5 text-gray-500" />
    }
}

const getTierName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1)
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
        },
    },
}

export default function QuizDashboard() {

    const [activeTab, setActiveTab] = useState("overview")

    const [userData, setUserData] = useState<any>({
        name: "",
        username: "",
        avatar: "/placeholder.svg?height=80&width=80",
        points: 0,
        badges: [
            { name: "Quick Thinker", icon: <Star className="h-4 w-4" />, earned: true },
            { name: "Knowledge Master", icon: <Award className="h-4 w-4" />, earned: true },
            { name: "Perfect Score", icon: <Star className="h-4 w-4" />, earned: true },
            { name: "Speed Demon", icon: <Clock className="h-4 w-4" />, earned: false },
            { name: "Quiz Champion", icon: <Trophy className="h-4 w-4" />, earned: false },
        ],
        stats: {},
        rank: 0,
        tier: "participant",
        quizHistory: [],
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    throw new Error("No auth token found")
                }

                const decoded = jwtDecode<JwtPayload>(token);
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                }

                const [marksRes, statsRes, historyRes, leaderboardRes] = await Promise.all([
                    axios.get("http://localhost:9092/auth/total-marks", config),
                    axios.get("http://localhost:9092/auth/quiz-stats", config),
                    axios.get("http://localhost:9092/auth/quiz-results", config),
                    axios.get("http://localhost:9092/auth/leaderboard-data", config),
                ])

                const currentUserData = leaderboardRes.data.find((user: any) => user.isCurrentUser);

                setUserData((prev: any) => ({
                    ...prev,
                    name: decoded.name,
                    username: decoded.sub,
                    points: marksRes.data.totalMarks,
                    stats: statsRes.data,
                    rank: currentUserData ? currentUserData.rank : 0,
                    tier: currentUserData ? currentUserData.tier : "participant",
                    quizHistory: historyRes.data
                        .sort((a: any, b: any) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime())
                        .map((q: any, i: number) => ({
                            id: i + 1,
                            title: q.quizTitle,
                            score: Math.round((q.marksAchieved / q.totalMarks) * 10000) / 100,
                            totalQuestions: q.totalQuestions,
                            category: q.category,
                            date: new Date(q.submissionTime).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            }),
                        })),
                }))
            } catch (error) {
                console.error("Error loading quiz dashboard data", error)
            }
        }
        fetchData()
    }, [])

    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No auth token found");

                const decoded = jwtDecode<JwtPayload & { sub?: string }>(token);
                const currentUserEmail = decoded.sub;

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const res = await axios.get(
                    "http://localhost:9092/auth/leaderboard-data",
                    config
                );

                const leaderboardFromBackend = res.data.map((user: any) => ({
                    ...user,
                    isCurrentUser: user.email === currentUserEmail,
                    avatar: user.avatar || "/placeholder.svg?height=40&width=40",
                }));

                setLeaderboardData(leaderboardFromBackend);

            } catch (error) {
                console.error("Error fetching leaderboard data", error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <>
            <div className="fixed z-10">
                <UserNavbar />
            </div>
            <div className="container mx-auto px-4 py-8 max-w-6xl mt-10">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* User Stats Card */}
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="md:col-span-1">
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-lg overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-800">
                                                    <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                                                    <AvatarFallback>{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-xl">{userData.name}</CardTitle>
                                                <CardDescription>@{userData.username}</CardDescription>
                                                <div className="flex items-center mt-1">
                                                    {getTierIcon(userData.tier)}
                                                    <span className="ml-1 text-sm font-medium">{getTierName(userData.tier)} Tier</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <motion.div className="space-y-2">
                                        <div className="flex items-center">
                                            <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                                            <h3 className="font-semibold">Total Points</h3>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <motion.div
                                                className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                                            >
                                                {userData.points}
                                            </motion.div>
                                        </div>
                                    </motion.div>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Medal className="h-5 w-5 mr-2 text-blue-500" />
                                            <h3 className="font-semibold">Rank #{userData.rank}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {userData.badges.map((badge: { name: string; icon: React.ReactElement; earned: boolean }, index: number) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <Badge
                                                        variant={badge.earned ? "default" : "outline"}
                                                        className={cn(
                                                            "py-1 px-2 flex items-center gap-1",
                                                            badge.earned ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "text-muted-foreground",
                                                        )}
                                                    >
                                                        {badge.icon}
                                                        <span className="text-xs">{badge.name}</span>
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <motion.div
                                variants={itemVariants}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-6"
                            >
                                <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center">
                                            <Star className="h-5 w-5 mr-2 text-yellow-500" />
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.div
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card"
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <span className="text-xs text-muted-foreground">Average Score</span>
                                                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                    {userData.stats.averageScore}%
                                                </span>
                                            </motion.div>
                                            <motion.div
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card"
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <span className="text-xs text-muted-foreground">Quizzes Completed</span>
                                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {userData.stats.quizzesCompleted}
                                                </span>
                                            </motion.div>
                                            <motion.div
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card"
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <span className="text-xs text-muted-foreground">Best Category</span>
                                                <span className="text-sm font-bold text-center text-purple-600 dark:text-purple-400">
                                                    {userData.stats.bestCategory}
                                                </span>
                                            </motion.div>
                                            <motion.div
                                                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card"
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <span className="text-xs text-muted-foreground">Highest Score</span>
                                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {userData.stats.highestScore}
                                                </span>
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div className="md:col-span-2 space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="overview" className="data-[state=active]:!bg-background data-[state=active]:!text-foreground">Quiz History</TabsTrigger>
                                <TabsTrigger value="leaderboard" className="data-[state=active]:!bg-background data-[state=active]:!text-foreground">Leaderboard</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 pt-4">
                                <motion.div variants={itemVariants}>
                                    <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-md h-[600px] overflow-scroll scrollbar-hidden">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-xl flex items-center">
                                                    <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                                                    Quiz History
                                                </CardTitle>
                                                <Badge variant="outline" className="font-normal">
                                                    {userData.quizHistory.length} Quizzes
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                                                {userData.quizHistory.map((quiz: any, index: number) => (
                                                    <motion.div
                                                        key={quiz.id}
                                                        variants={itemVariants}
                                                        whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--accent) / 0.1)" }}
                                                        className="flex items-center p-3 rounded-lg border bg-muted transition-colors"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium truncate">{quiz.title}</h4>
                                                                <Badge variant="secondary" className="ml-2">
                                                                    {quiz.category}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <p className="text-sm text-muted-foreground">{quiz.date}</p>
                                                                <div className="flex items-center">
                                                                    <span className="text-sm font-medium">Score: {quiz.score}%</span>
                                                                    <div className="ml-2 h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${quiz.score}%` }}
                                                                            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                                                            className={cn(
                                                                                "h-full rounded-full",
                                                                                quiz.score >= 90
                                                                                    ? "bg-green-500"
                                                                                    : quiz.score >= 70
                                                                                        ? "bg-yellow-500"
                                                                                        : "bg-red-500",
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="leaderboard" className="pt-4">
                                <motion.div variants={itemVariants}>
                                    <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-md">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-xl flex items-center">
                                                    <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                                                    Global Leaderboard
                                                </CardTitle>
                                                <Badge variant="outline" className="font-normal">
                                                    This Month
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                                                {leaderboardData.map((user) => (
                                                    <motion.div
                                                        key={user.rank}
                                                        variants={itemVariants}
                                                        whileHover={{ scale: 1.01 }}
                                                        className={cn(
                                                            "flex items-center p-3 rounded-lg transition-colors",
                                                            user.isCurrentUser
                                                                ? "bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800"
                                                                : "hover:bg-accent/50 border",
                                                            user.tier === "diamond" && "border-blue-200 dark:border-blue-800/30",
                                                            user.tier === "gold" && "border-amber-200 dark:border-amber-800/30",
                                                            user.tier === "silver" && "border-gray-200 dark:border-gray-700",
                                                            user.tier === "bronze" && "border-amber-800/30 dark:border-amber-700/30",
                                                        )}
                                                    >
                                                        <div className="flex items-center flex-1">
                                                            <div
                                                                className={cn(
                                                                    "w-8 h-8 flex items-center justify-center rounded-full mr-3 font-bold text-sm",
                                                                    user.tier === "diamond" &&
                                                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                                                    user.tier === "gold" &&
                                                                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                                                                    user.tier === "silver" &&
                                                                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                                                                    user.tier === "bronze" &&
                                                                    "bg-amber-100/70 text-amber-800 dark:bg-amber-900/20 dark:text-amber-700",
                                                                )}
                                                            >
                                                                {user.rank}
                                                            </div>
                                                            <Avatar className="h-8 w-8 mr-3">
                                                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                                                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-medium truncate">{user.username}</p>
                                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="flex items-center mr-3">
                                                                {getTierIcon(user.tier)}
                                                                <span className="text-xs font-medium ml-1">{getTierName(user.tier)}</span>
                                                            </div>
                                                            <div className="font-bold text-right min-w-[80px]">
                                                                {user.points}
                                                                <span className="text-xs text-muted-foreground ml-1">pts</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </>
    )
}
