"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/Sidebar/mode-toggle"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, LogOut, Settings, Home, BookOpen, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "../AuthContext"
import axios from "axios"
import { MdLeaderboard } from "react-icons/md";
import { useLocation } from "react-router-dom"

interface UserNavbarProps {
  userEmail: string
}

const UserNavbar: React.FC<UserNavbarProps> = ({ userEmail }) => {
  const navigate = useNavigate()
  const { logout, profileImage, setProfileImage } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!profileImage) {
        try {
          const token = localStorage.getItem("token")
          const profileResponse = await axios.get("http://localhost:9092/auth/users/profile-picture", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          })

          const blob = profileResponse.data
          const imageUrl = URL.createObjectURL(blob)
          localStorage.setItem("profileImage", imageUrl)
          setProfileImage(imageUrl)
        } catch (err) {
          console.error("Error fetching profile image in navbar:", err)
        }
      }
    }

    fetchProfileImage()
  }, [profileImage, setProfileImage])

  const getInitials = (email: string) => {
    const [namePart] = email.split("@")
    const parts = namePart.split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return namePart.slice(0, 2).toUpperCase()
  }

  const userProfileImage = profileImage || ""

  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const baseButtonClasses =
    "font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl px-4 py-2 transition-all duration-200"

  const activeClasses = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95 dark:text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          IntelliQuest
        </span>
      </div>

      <div className="hidden md:flex items-center space-x-2">
        <Button
          variant="ghost"
          className={`${baseButtonClasses} ${isActive("/UserDashboard") ? activeClasses : ""}`}
          onClick={() => navigate("/UserDashboard")}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>

        <Button
          variant="ghost"
          className={`${baseButtonClasses} ${isActive("/EnrolledCourses") ? activeClasses : ""}`}
          onClick={() => navigate("/EnrolledCourses")}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          My Courses
        </Button>

        <Button
          variant="ghost"
          className={`${baseButtonClasses} ${isActive("/quiz-list") ? activeClasses : ""}`}
          onClick={() => navigate("/quiz-list")}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Play Quiz
        </Button>

        <Button
          variant="ghost"
          className={`${baseButtonClasses} ${isActive("/quiz-dashboard") ? activeClasses : ""}`}
          onClick={() => navigate("/quiz-dashboard")}
        >
          <MdLeaderboard className="h-4 w-4 mr-2" />
          Leaderboard
        </Button>

      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Avatar className="w-10 h-10 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-200 cursor-pointer">
                <AvatarImage src={userProfileImage || "/placeholder.svg"} alt="User profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                  {getInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2">
            <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Student Account</p>
            </div>

            <DropdownMenuItem
              onClick={() => navigate("/account-settings")}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Account Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

export default UserNavbar
