import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLogin } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, School, Shield, User, Lock, Mail, Loader2, Image as ImageIcon } from "lucide-react";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { BACKEND_BASE_URL } from "@/constants";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { mutate: login } = useLogin();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          image: imageUrl || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || "Registration failed");
      }

      login(
        {
          email,
          password,
          demoUser: {
            id: json.data?.id || `usr-${Date.now()}`,
            name,
            email,
            role,
            avatar: imageUrl || undefined,
          },
        },
        {
          onSuccess: () => navigate("/"),
          onError: () => navigate("/login"),
        }
      );
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join the UniManager Academic Portal</p>
        </div>

        <Card className="border border-border bg-card text-card-foreground shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Register</CardTitle>
            <CardDescription>
              Sign up as a Student, Teacher, or Administrator
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMsg && (
              <div className="p-3 mb-4 text-sm rounded-lg bg-destructive/15 border border-destructive/30 text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

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
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Interactive Role Buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Account Role
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition cursor-pointer ${
                      role === "student"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition cursor-pointer ${
                      role === "teacher"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <School className="h-5 w-5" />
                    <span>Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition cursor-pointer ${
                      role === "admin"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="avatar" className="text-xs font-medium">
                  Profile Photo URL <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="avatar"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border justify-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
