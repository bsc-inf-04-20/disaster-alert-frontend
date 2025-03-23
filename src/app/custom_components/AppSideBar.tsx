import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuItem,
    SidebarMenu,
    SidebarMenuButton
  } from "@/components/ui/sidebar"

  import { Calendar, Home, Book, Search, Settings } from "lucide-react"

  // Menu items.
const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Disaster management modules",
      url: "/modules",
      icon: Book,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ]
  
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader className="text-white w-full text-xl font-bold sm:bg-inherit font-inter">
          disaster alert system
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  