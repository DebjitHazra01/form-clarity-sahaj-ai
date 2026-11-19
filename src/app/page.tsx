'use client';

export const maxDuration = 60;

import { AppHeader } from "@/components/app/header";
import { SahajApp } from "@/components/app/sahaj-app";
import { useAuth } from "@/components/app/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Languages, CheckSquare, MapPin, MessageSquare, PhoneCall, HelpCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg'>('text-base');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-700 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Sahaj AI Citizen Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen flex flex-col bg-[#f4f6f9] text-slate-900 ${fontSizeClass}`}>
      {/* 1. Official National Portal Tricolor Top Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. Official Citizen Utility Bar */}
      <div className="bg-[#1e293b] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-700 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-amber-400">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span className="font-medium text-slate-200">Government of India</span>
            <span className="hidden md:inline text-slate-400 text-[11px] ml-2">
              • राष्ट्रीय नागरिक दस्तावेज़ एवं प्रपत्र सहायता पोर्टल
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden sm:inline text-slate-300">
              Simple Form Interface for Citizens (SFIC)
            </span>
            <div className="flex items-center gap-1 border-l border-slate-600 pl-3">
              <span className="text-slate-400">Font:</span>
              <button
                type="button"
                onClick={() => setFontSizeClass('text-base')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${fontSizeClass === 'text-base' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                title="Standard font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeClass('text-lg')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${fontSizeClass === 'text-lg' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                title="Large font size for seniors"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Global Government Application Header */}
      <AppHeader />

      {/* 4. Main 2D Content Area */}
      <main className="flex-grow flex flex-col items-center justify-start p-3 sm:p-6 py-6 max-w-6xl w-full mx-auto">
        {/* Citizen Portal Banner Card */}
        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge className="bg-blue-700 text-white hover:bg-blue-800 text-xs font-semibold px-2.5 py-0.5">
                  SFIC Citizen Portal
                </Badge>
                <Badge variant="outline" className="text-emerald-800 border-emerald-300 bg-emerald-50 text-xs font-medium">
                  <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
                  DPDP Act 2023 Compliant • Privacy-First
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Sahaj AI <span className="text-blue-700 font-semibold text-lg sm:text-2xl ml-1">सहज एआई • সহজ এআই</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                Universal Government Paperwork Assistant: Upload any government form in PDF or image format.
                Get line-by-line simple explanations in your mother tongue, an official document checklist, nearby verified government service centers, and auto-filled forms.
              </p>
            </div>

            {/* 6 Supported Languages Bar */}
            <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Languages className="h-3.5 w-3.5 text-blue-700" /> 6 Official Languages:
              </span>
              <div className="flex flex-wrap gap-1 text-[11px] text-slate-700 font-medium">
                <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">English</span>
                <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">বাংলা</span>
                <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">हिंदी</span>
                <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">मराठी</span>
                <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">ગુજરાતી</span>
                <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">தமிழ்</span>
              </div>
            </div>
          </div>

          {/* 4 Citizen Feature Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="h-7 w-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">1</span>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">Form Clarification</p>
                <p className="text-[11px] text-slate-500">Demystify legal jargon</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="h-7 w-7 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">2</span>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">Document Checklist</p>
                <p className="text-[11px] text-slate-500">Mandatory & conditional</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="h-7 w-7 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">3</span>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">Official Office Finder</p>
                <p className="text-[11px] text-slate-500">Postal PIN code & centers</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="h-7 w-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">4</span>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">Grounded AI Chat</p>
                <p className="text-[11px] text-slate-500">Voice & text Q&A</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Main Application Workflow (2D SFIC Interface) */}
        <div className="w-full">
          <SahajApp />
        </div>
      </main>

      {/* 6. Official Government Portal Citizen Footer */}
      <footer className="mt-auto bg-[#1e293b] text-slate-300 text-xs border-t border-slate-700 pt-8 pb-6 px-4 print:hidden">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-700">
            {/* Col 1: Portal info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span>Sahaj AI • सहज एआई • সহজ এআই</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Empowering Indian citizens with accessible, high-contrast, multi-lingual paperwork clarity. Designed for every citizen, senior citizen, and local service center.
              </p>
            </div>

            {/* Col 2: Official Statutory Helplines */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-amber-400" /> Official Statutory Helplines
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-slate-200">UIDAI (Aadhaar):</strong> Toll Free 1947</li>
                <li><strong className="text-slate-200">Digital India / CSC:</strong> 1800-121-3468</li>
                <li><strong className="text-slate-200">National Voter Service:</strong> 1950</li>
                <li><strong className="text-slate-200">Passport Seva Kendra:</strong> 1800-258-1800</li>
              </ul>
            </div>

            {/* Col 3: Standards & Accessibility */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Standards & Privacy
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>Guidelines for Indian Government Websites (GIGW 3.0)</li>
                <li>Digital Personal Data Protection (DPDP) Act, 2023</li>
                <li>W3C WCAG 2.1 Level AA Accessibility Standards</li>
                <li>Zero-retention ephemeral form processing</li>
              </ul>
            </div>

            {/* Col 4: Official Portals */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-blue-400" /> Official Gov Portals
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li><a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">india.gov.in (National Portal)</a></li>
                <li><a href="https://uidai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">uidai.gov.in (Aadhaar Portal)</a></li>
                <li><a href="https://services.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">services.india.gov.in (National Services)</a></li>
                <li><a href="https://www.indiapost.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">indiapost.gov.in (India Post)</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
            <p>© {new Date().getFullYear()} Sahaj AI — Universal Government Paperwork Portal. All rights reserved.</p>
            <p>Designed for Simple Form Interface for Citizens (SFIC) • भारत सरकार</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
