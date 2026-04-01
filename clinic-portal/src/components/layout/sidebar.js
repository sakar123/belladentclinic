"use client";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, CalendarDays, CreditCard, FileText, Stethoscope, Settings, UserCog, LineChart } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: LineChart },
];

const adminNavItems = [
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/services", label: "Services", icon: Stethoscope },
  // Move Lookups under Settings and update icon to Settings
  { href: "/settings/lookups", label: "Lookups", icon: Settings },
]

export default function Sidebar({ className }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("h-full border-r border-app-border bg-app-surface p-4", className)}>
      {/* Brand */}
      <div className="mb-4 flex items-center justify-between px-2">
        <Link href="/" className={cn("flex items-center gap-2 transition-all", collapsed && "opacity-0 w-0 overflow-hidden")}
          aria-label="BellaDent Portal">
          <img src="/images/belladent_logo.jpg" alt="BellaDent" className="h-16 w-16 rounded-sm object-cover" />
          <div className="text-lg font-semibold">BellaDent</div>
        </Link>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          className="size-8 grid place-items-center rounded-md hover:bg-app-bg text-app-muted"
        >
          {collapsed ? <span className="text-xs">›</span> : <span className="text-xs">‹</span>}
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
                active ? "bg-teal-600/10 text-teal-700 ring-1 ring-teal-600/30" : "hover:bg-app-bg text-app-foreground"
              )}
            >
              <Icon size={18} />
              <span className={cn("transition-all", collapsed && "opacity-0 w-0 overflow-hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={cn("px-2 text-xs text-app-muted my-2", collapsed && "opacity-0 w-0 overflow-hidden")}>Admin</div>
      <nav className="space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                active ? "bg-teal-600/10 text-teal-700 ring-1 ring-teal-600/30" : "hover:bg-app-bg text-app-foreground"
              )}
            >
              <Icon size={18} />
              <span className={cn("transition-all", collapsed && "opacity-0 w-0 overflow-hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 pt-4 border-t border-app-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-app-muted hover:text-app-foreground hover:bg-app-bg",
            collapsed && "justify-center"
          )}
        >
          <Settings size={18} />
          <span className={cn("transition-all", collapsed && "opacity-0 w-0 overflow-hidden")}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
