import * as React from "react"
import { useLocation } from "react-router-dom"
import {
  Eye,
  FilePlus2,
  GraduationCapIcon,
  LayoutDashboard,
  LifeBuoy,
  Send,
  Settings2,
  SquarePen,
  View,
} from "lucide-react"

import { NavMain } from "@/components/Sidebar/nav-main"
import { NavSecondary } from "@/components/Sidebar/nav-secondary"
import { NavUser } from "@/components/Sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/InstructorDashboard", icon: LayoutDashboard },
    { title: "Create Course", url: "/CreateCourse", icon: SquarePen },
    { title: "View Courses", url: "/ViewCourses", icon: View },
    { title: "Add Quiz", url: "/quiz", icon: FilePlus2 },
    { title: "View Quiz", url: "/view-quiz", icon: Eye },
    { title: "Settings", url: "/settings", icon: Settings2 },
  ],
  navSecondary: [
    { title: "Support", url: "/support", icon: LifeBuoy },
    { title: "Feedback", url: "/feedback", icon: Send },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar variant="inset" {...props} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/InstructorDashboard">
                <div className="bg-[#1447e6] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GraduationCapIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">IntelliQuest</span>
                  <span className="truncate text-xs text-[var(--muted-foreground)]">
                    Private Limited
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-auto custom-scrollbar">
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            isActive: location.pathname === item.url,
          }))}
        />
        <NavSecondary
          items={data.navSecondary.map((item) => ({
            ...item,
            isActive: location.pathname === item.url,
          }))}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
