import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Shield, School, Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { BACKEND_BASE_URL } from "@/constants";

const DEMO_ACCOUNTS = [
  {
    role: "admin" as const,
    label: "Admin",
    name: "Sarah Mitchell",
    email: "admin@classroom.com",
    icon: Shield,
    badgeVariant: "default" as const,
  },
  {
    role: "teacher" as const,
    label: "Teacher",
    name: "Prof. Alex Rivera",
    email: "teacher@classroom.com",
    icon: School,
    badgeVariant: "secondary" as const,
  },
  {
    role: "student" as const,
    label: "Student",
    name: "Liam Johnson",
    email: "student1@classroom.com",
    icon: GraduationCap,
    badgeVariant: "outline" as const,
  },
];

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setErrorMsg("");
    login(
      { email, password },
      {
        onSuccess: () => navigate("/"),
        onError: (err: any) => setErrorMsg(err?.message || "Invalid credentials. Please try again."),
      }
    );
  };

  const handleDemoLogin = async (demo: (typeof DEMO_ACCOUNTS)[0]) => {
    setErrorMsg("");
    let resolvedId = `demo-${demo.role}`;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/users?search=${encodeURIComponent(demo.email)}&limit=1`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.[0]?.id) {
          resolvedId = json.data[0].id;
        }
      }
    } catch {
      // ignore
    }

    login(
      {
        email: demo.email,
        password: "Password123!",
        demoUser: {
          id: resolvedId,
          name: demo.name,
          email: demo.email,
          role: demo.role,
        },
      },
      {
        onSuccess: () => navigate("/"),
        onError: (err: any) => setErrorMsg(err?.message || "Demo login failed."),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm mb-3">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">UniManager</h1>
          <p className="text-sm text-muted-foreground mt-1">Academic & Classroom Management Portal</p>
        </div>

        <Card className="border border-border bg-card text-card-foreground shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials or choose a 1-click demo account below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm rounded-lg bg-destructive/15 border border-destructive/30 text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full mt-2 font-medium">
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Instant Demo Access
                </span>
              </div>
            </div>

            {/* 1-Click Demo Profiles */}
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoLogin(demo)}
                    disabled={isPending}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted hover:border-primary/40 transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-background border border-border group-hover:border-primary/50 group-hover:bg-primary/10 transition">
                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{demo.name}</p>
                        <p className="text-[11px] text-muted-foreground">{demo.email}</p>
                      </div>
                    </div>
                    <Badge variant={demo.badgeVariant} className="text-[10px] uppercase font-bold tracking-wider">
                      {demo.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border justify-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
