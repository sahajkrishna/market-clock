import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Bell,
  Settings,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, section: "hero" },
  { title: "Sessions", url: "/dashboard", icon: Clock, section: "sessions" },
  { title: "Economic Calendar", url: "/dashboard", icon: CalendarDays, section: "economicCalendar" },
  { title: "Alerts", url: "/dashboard", icon: Bell, section: "alerts" },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  activeSection?: string;
  onScrollToSection?: (section: string) => void;
}

export function AppSidebar({ activeSection = "hero", onScrollToSection }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleClick = (item: typeof navItems[0]) => {
    if (item.section && onScrollToSection) {
      onScrollToSection(item.section);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight">Market Clock</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.url === "/settings" ? (
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-2 hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    ) : (
                      <button
                        onClick={() => handleClick(item)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                          activeSection === item.section
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
