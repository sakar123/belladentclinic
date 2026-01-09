"use client";
import { cn } from "../../lib/utils";
import Input from "../ui/input";
import { Search, Menu } from "lucide-react";
import Button from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header({ className }) {
  const { user, logout } = useAuth();

  return (
    <header className={cn("sticky top-0 z-30 border-b border-app-border bg-app-surface/80 backdrop-blur supports-[backdrop-filter]:bg-app-surface/60", className)}>
      <div className="container-max flex items-center justify-between gap-3 p-3 md:p-4">
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu size={18} />
          </Button>
          <Link href="/" className="font-semibold">Dental Clinic</Link>
        </div>
        <div className="relative flex-1 max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" size={18} />
          <Input placeholder="Search patients, appointments, invoices…" className="pl-9 text-black" />
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Avatar>
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button onClick={logout}>Log out</Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
