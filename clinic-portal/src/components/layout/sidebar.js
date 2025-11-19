"use client";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, CalendarDays, CreditCard, FileText, Stethoscope, Settings, UserCog, FlaskConical, LineChart } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/services", label: "Services", icon: Stethoscope },
  { href: "/staff", label: "Staff", icon: UserCog },
  { href: "/reports", label: "Reports", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ className }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("h-full border-r border-app-border bg-app-surface p-4", className)}>
      <div className="mb-4 flex items-center justify-between px-2">
        <div className={cn("text-xl font-semibold transition-all", collapsed && "opacity-0 w-0 overflow-hidden")}>Dental Clinic</div>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          className="size-8 grid place-items-center rounded-md hover:bg-app-bg text-app-muted"
        >
          {collapsed ? 
            <span className="text-xs">›</span> :
            <span className="text-xs">‹</span>
          }
        </button>
      </div>
      <div className={cn("px-2 text-xs text-app-muted mb-2", collapsed && "opacity-0 w-0 overflow-hidden")}>Patient Portal</div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                active ? "bg-blue-50 text-blue-700" : "hover:bg-app-bg text-app-foreground"
              )}
            >
              <Icon size={18} />
              <span className={cn("transition-all", collapsed && "opacity-0 w-0 overflow-hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
