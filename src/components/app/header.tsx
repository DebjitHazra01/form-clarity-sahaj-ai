'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-context";
import { LogOut, ShieldCheck, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="py-2.5 px-4 sm:px-8 print:hidden sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-30 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative p-1 bg-slate-50 border border-slate-200 rounded-lg">
            <Image
              src="/logof.png"
              alt="Sahaj AI Logo"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Sahaj AI
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 border-blue-200 font-semibold px-2 py-0.5 rounded"
              >
                SFIC Citizen Portal
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Universal Government Paperwork Assistant • सहज एआई • সহজ এআই
            </p>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Session</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-300 text-xs rounded-md transition-colors h-8 font-medium"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
