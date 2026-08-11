"use client";
import { cn } from "../../lib/utils";
import Input from "../ui/input";
import { Search, Menu, CalendarPlus, UserPlus, Bell } from "lucide-react";
import Button from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BellaDentLogo from "@/components/brand/belladent-logo";

export default function Header({ className }) {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const [term, setTerm] = useState("");

  return (
    <header className={cn("sticky top-0 z-30 border-b border-app-border/0 bg-gradient-to-r from-teal-600 to-sky-500 text-white", className)}>
      <div className="container-max flex items-center justify-between gap-4 p-3 md:p-4">
        {/* Left: Brand + Mobile menu */}
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden text-white/90 hover:bg-white/10">
            <Menu size={18} />
          </Button>
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <BellaDentLogo
              alt="BellaDent Clinic"
              priority
              className="hidden h-20 w-auto max-w-[260px] sm:block lg:h-24 lg:max-w-[330px]"
            />
            <span className="font-semibold text-white truncate sm:hidden">BellaDent</span>
          </Link>
        </div>

        {/* Middle: Search */}
        <div className="relative flex-1 max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" size={18} />
          <Input
            placeholder="Search patients, appointments, invoices…"
            className="pl-9 bg-white/90 text-slate-900 placeholder:text-slate-500 border-white/40 focus-visible:ring-2 focus-visible:ring-pink-400"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') router.push(`/search?q=${encodeURIComponent(term)}`);
            }}
          />
        </div>

        {/* Right: Quick actions + User */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button asChild variant="ghost" size="icon" className="text-white/90 hover:bg-white/10">
            <Link href="/appointments/new" aria-label="New appointment"><CalendarPlus size={18} /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="text-white/90 hover:bg-white/10">
            <Link href="/patients/new" aria-label="New patient"><UserPlus size={18} /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="text-white/90 hover:bg-white/10">
            <Bell size={18} />
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="ring-2 ring-white/40">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="bg-white/20 text-white">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" className="text-white/90 hover:bg-white/10" onClick={logout}>Log out</Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="text-white/90 hover:bg-white/10"
              onClick={() => login('/')}
            >
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
