import type React from "react"
import { useState } from "react"
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
import { ModeToggle } from "./components/Sidebar/mode-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Trash, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function Settings() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)
  const currentPage = pathnames[pathnames.length - 1]

  // User data state
  const [username, setUsername] = useState("aohndoe")
  const [email] = useState("john.doe@example.com")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get user initials for avatar fallback
  const getInitials = () => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Handle profile picture upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulate file upload with a timeout
    const reader = new FileReader()
    reader.onload = (e) => {
      setTimeout(() => {
        setProfilePicture(e.target?.result as string)
        setIsUploading(false)
        setIsDialogOpen(false)
        toast("Profile picture updated!", {
          description: "Your profile picture has been updated successfully.",
          style: {backgroundColor:"green",border:"green"},
        })
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  // Handle profile picture deletion
  const handleDeletePicture = () => {
    setIsUploading(true)

    // Simulate deletion with a timeout
    setTimeout(() => {
      setProfilePicture(null)
      setIsUploading(false)
      setIsDialogOpen(false)
      toast("Profile picture removed!", {
        description: "Your profile picture has been removed successfully.",
        style: {backgroundColor:"green",border:"green"},
      })
    }, 1000)
  }

  // Handle save changes
  const handleSaveChanges = () => {
    setIsSaving(true)

    // Simulate API call with a timeout
    setTimeout(() => {
      setIsSaving(false)
      toast("Settings saved!", {
        description: "Your account settings have been saved successfully.",
        style: {backgroundColor:"green",border:"green"},
      })
    }, 1500)
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
          <Card className="border-0 shadow-none bg-sidebar">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-30 h-30 border-2 border-muted">
                    <AvatarImage src={profilePicture || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg">
                        <Camera className="w-4 h-4 text-primary-foreground" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Profile Picture</DialogTitle>
                        <DialogDescription>Upload a new profile picture or remove your current one.</DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-8 py-4">
                        {isUploading ? (
                          <div className="flex items-center justify-center p-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-center">
                              <Avatar className="w-50 h-50">
                                <AvatarImage src={profilePicture || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                                  {getInitials()}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="picture" className="sr-only">
                                  Upload
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="picture"
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                  />
                                  <Button variant="outline" className="w-full">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                  </Button>
                                </div>
                              </div>

                              <Button variant="destructive" onClick={handleDeletePicture} disabled={!profilePicture}>
                                <Trash className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{username}</h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <Separator />

              {/* Username Settings */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
