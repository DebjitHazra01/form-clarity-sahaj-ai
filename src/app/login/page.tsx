'use client';

import Image from "next/image";
import { useState } from 'react';
import { useAuth } from '@/components/app/auth-context';
import { authenticateUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSignInWithCredentials = (emailToUse: string, passwordToUse: string) => {
    setIsLoading(true);
    try {
      const response = authenticateUser(emailToUse, passwordToUse);
      if (!response.success || !response.token) {
        toast({
          variant: "destructive",
          title: "Sign in notice",
          description: response.error || "Please check your email and password.",
        });
        return;
      }

      login(response.token);
      toast({
        title: "Welcome to Sahaj AI!",
        description: `Signed in successfully as ${emailToUse.split('@')[0]}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignInWithCredentials(email, password);
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleSignInWithCredentials(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9] text-slate-900">
      {/* Official National Tricolor Top Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Official Utility Bar */}
      <div className="bg-[#1e293b] text-slate-200 text-xs py-2 px-4 border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span className="font-medium">Government of India</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Simple Form Interface for Citizens (SFIC)
          </span>
        </div>
      </div>

      {/* Main Login Card Stage */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="text-center space-y-3 pb-4 pt-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-center">
              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                <Image
                  src="/logof.png"
                  alt="Sahaj AI Logo"
                  width={44}
                  height={44}
                  priority
                  className="object-contain"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Badge className="bg-blue-700 text-white text-[10px] font-semibold">
                  Citizen Portal Access
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Sahaj AI</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Universal Government Paperwork Assistant • सहज एआई
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address / ईमेल</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-10 bg-white border-slate-300 text-slate-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password / पासवर्ड</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password (min 4 characters)"
                    className="pl-10 h-10 bg-white border-slate-300 text-slate-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-700">
                  Demo logins: <span className="font-mono font-medium text-slate-800">user123</span> (Citizen) or <span className="font-mono font-medium text-slate-800">admin123</span> (Admin)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In / प्रवेश करें'
                )}
              </Button>
            </form>

            {/* Quick 1-Click Demo Access Bar */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-700 block text-center">
                Instant 1-Click Testing Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                  onClick={() => fillDemo('citizen@sahaj.ai', 'user123')}
                  disabled={isLoading}
                >
                  <User className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
                  Citizen Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                  onClick={() => fillDemo('admin@sahaj.ai', 'admin123')}
                  disabled={isLoading}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-700" />
                  Admin Login
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-center pt-2 pb-4 bg-slate-50 border-t border-slate-100">
            <p className="text-[11px] text-slate-700 w-full flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Secured with DPDP Act 2023 compliance • Sahaj AI GovTech
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
