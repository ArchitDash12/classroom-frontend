import React, { useEffect, useState } from "react";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  School,
  Shield,
  UserPlus,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  KeyRound,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardStats } from "@/types";
import { BACKEND_BASE_URL } from "@/constants";
import { UserIdentity } from "@/providers/auth";
import { toast } from "sonner";

interface MyEnrollmentItem {
  enrollmentId: number;
  enrolledAt: string;
  class: {
    id: number;
    name: string;
    bannerUrl?: string;
    status: string;
    capacity: number;
    description?: string;
    schedules?: Array<{ day: string; startTime: string; endTime: string }>;
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

function StudentDashboard({ identity }: { identity?: UserIdentity | null }) {
  const [enrollments, setEnrollments] = useState<MyEnrollmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { show, list } = useNavigation();

  const fetchMyEnrollments = async () => {
    try {
      const studentId = identity?.id || "";
      const studentEmail = identity?.email || "";
      const res = await fetch(
        `${BACKEND_BASE_URL}/enrollments/my?studentId=${encodeURIComponent(studentId)}&studentEmail=${encodeURIComponent(studentEmail)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const json = await res.json();
        setEnrollments(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch my enrollments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEnrollments();
  }, [identity?.id, identity?.email]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsJoining(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/classes/join-by-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          inviteCode: joinCode.trim().toUpperCase(),
          studentId: identity?.id,
          studentEmail: identity?.email,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to join class");
      }
      toast.success(json.message || "Enrolled in class successfully!");
      setJoinCode("");
      fetchMyEnrollments();
    } catch (err: any) {
      toast.error(err?.message || "Invalid invite code or class is full");
    } finally {
      setIsJoining(false);
    }
  };

  // Compute schedules
  const allScheduleSlots: Array<{
    day: string;
    startTime: string;
    endTime: string;
    className: string;
    classId: number;
    subjectCode?: string;
    teacherName?: string;
  }> = [];

  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  enrollments.forEach((item) => {
    const sch = item.class?.schedules;
    if (Array.isArray(sch)) {
      sch.forEach((s) => {
        if (s.day && s.startTime) {
          allScheduleSlots.push({
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            className: item.class.name,
            classId: item.class.id,
            subjectCode: item.subject?.code,
            teacherName: item.teacher?.name,
          });
        }
      });
    }
  });

  allScheduleSlots.sort((a, b) => {
    const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const uniqueSubjectsCount = new Set(enrollments.map((e) => e.subject?.id).filter(Boolean)).size;

  return (
    <div className="space-y-6 pb-8">
      {/* Student Welcome Header */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-semibold">
                Student Learning Portal
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {identity?.name || "Student"}!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track your enrolled courses, check your weekly lecture timetable, and join new classes using invite codes from your teachers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => list("classes")} variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" /> Browse Course Catalog
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Enrolled Classes</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active course batches</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Lectures</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{allScheduleSlots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled sessions per week</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Academic Subjects</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueSubjectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Disciplines studied</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Join Card + Enrolled Classes + Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Join Card & Enrolled Classes Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Join with Invite Code Card */}
          <Card className="border-primary/20 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <KeyRound className="w-5 h-5 text-primary" /> Join Class with Invite Code
              </CardTitle>
              <CardDescription className="text-xs">
                Received a class invite key from your teacher? Enter it below to immediately enroll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinClass} className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  placeholder="Enter 7-character invite code (e.g. CS101A)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="font-mono uppercase tracking-wider text-center sm:text-left flex-1"
                />
                <Button type="submit" disabled={isJoining || !joinCode.trim()} className="w-full sm:w-auto gap-2">
                  {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Join Class
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Enrolled Classes Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    My Enrolled Courses ({enrollments.length})
                  </CardTitle>
                  <CardDescription className="text-xs">Courses you are currently participating in.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs">Loading your course enrollments...</p>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <GraduationCap className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">No courses joined yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Ask your instructor for a class invite code and enter it above to get started with your classes!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrollments.map((item) => (
                    <div
                      key={item.enrollmentId}
                      className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Banner thumbnail */}
                      <div className="h-28 w-full bg-slate-900 relative overflow-hidden">
                        {item.class?.bannerUrl ? (
                          <img src={item.class.bannerUrl} alt={item.class.name} className="w-full h-full object-cover opacity-75" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-slate-900 to-primary/40 opacity-80" />
                        )}
                        <div className="absolute top-2.5 right-2.5">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] capitalize">
                            {item.class?.status || "active"}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5">
                          <p className="font-semibold text-white text-sm line-clamp-1 drop-shadow-sm">{item.class?.name}</p>
                          <p className="text-[11px] text-white/80 line-clamp-1">
                            {item.subject?.code ? `${item.subject.code} • ` : ""}{item.subject?.name || "Subject"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        {/* Instructor */}
                        <div className="flex items-center gap-2.5 text-xs">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={item.teacher?.image} alt={item.teacher?.name} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {item.teacher?.name?.slice(0, 2).toUpperCase() || "T"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-foreground font-medium truncate">{item.teacher?.name || "Instructor Unassigned"}</span>
                        </div>

                        {/* Schedules */}
                        {Array.isArray(item.class?.schedules) && item.class.schedules.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {item.class.schedules.map((slot, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                                >
                                  <Clock className="w-2.5 h-2.5" /> {slot.day?.slice(0, 3)} {slot.startTime}–{slot.endTime}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            Enrolled {new Date(item.enrolledAt).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => show("classes", item.class.id)}
                            className="h-7 text-xs gap-1 text-primary hover:text-primary font-medium"
                          >
                            View Class <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Weekly Schedule Timetable */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> My Weekly Schedule
              </CardTitle>
              <CardDescription className="text-xs">
                Upcoming lecture sessions across your courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allScheduleSlots.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg space-y-2">
                  <Calendar className="w-8 h-8 opacity-40 mx-auto" />
                  <p className="text-xs">No active lectures scheduled this week.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allScheduleSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-border bg-card/60 hover:bg-muted/40 transition flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-semibold text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                            {slot.day}
                          </Badge>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground text-xs line-clamp-1">{slot.className}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{slot.teacherName || "Instructor"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => show("classes", slot.classId)}
                        className="h-7 px-2 text-[11px] shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const Dashboard = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();
  const isStudent = identity?.role === "student";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { show, list } = useNavigation();

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/dashboard/stats`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isStudent) {
      fetchStats();
    }
  }, [isStudent]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  // If student, render the Student Learning Portal!
  if (isStudent) {
    return <StudentDashboard identity={identity} />;
  }

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading dashboard analytics...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalUsers: 0,
    studentsCount: 0,
    teachersCount: 0,
    adminsCount: 0,
    totalDepartments: 0,
    totalSubjects: 0,
    totalClasses: 0,
    activeClasses: 0,
    totalCapacity: 0,
    totalEnrollments: 0,
    avgFillRate: 0,
  };

  const charts = stats?.charts || {
    enrollmentTrends: [],
    classesByDepartment: [],
    capacityStatus: [],
    userDistribution: [],
  };

  const capacityWarnings = stats?.capacityWarnings || [];
  const activityFeed = stats?.activityFeed || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Academic Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time enrollment trends, capacity status, and institutional metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Button size="sm" onClick={() => list("classes")} className="gap-1.5">
            <GraduationCap className="w-4 h-4" /> View All Classes
          </Button>
        </div>
      </div>

      {/* 4 Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Classes */}
        <Card className="border-border hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total Classes
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {metrics.totalClasses}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-500">{metrics.activeClasses} active</span>
              <span>• {metrics.totalCapacity} total seats</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Enrollments */}
        <Card className="border-border hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total Enrollments
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {metrics.totalEnrollments}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Average Seat Fill:</span>
              <Badge variant="outline" className="font-semibold">
                {metrics.avgFillRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Academic Community */}
        <Card className="border-border hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Community Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <School className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {metrics.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span className="text-blue-400 font-medium">{metrics.studentsCount} Students</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{metrics.teachersCount} Faculty</span>
            </p>
          </CardContent>
        </Card>

        {/* Curricula & Faculties */}
        <Card className="border-border hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Departments & Subjects
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Building2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {metrics.totalDepartments}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>{metrics.totalSubjects} distinct subjects offered</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4 Interactive Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Enrollment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Enrollment Trends (Past 14 Days)
            </CardTitle>
            <CardDescription>Daily course registrations across all academic batches</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.enrollmentTrends}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  name="Enrollments"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#enrollmentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Classes by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Classes & Subjects by Department
            </CardTitle>
            <CardDescription>Curriculum distribution across faculty branches</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.classesByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="code" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="classesCount" name="Active Classes" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="subjectsCount" name="Subjects" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Capacity Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" /> Class Capacity Breakdown
            </CardTitle>
            <CardDescription>Seat saturation distribution among all active courses</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.capacityStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.capacityStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> User Role Demographics
            </CardTitle>
            <CardDescription>Ratio of students, faculty instructors, and staff</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Capacity Alerts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity Warning Center */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Capacity Safeguard Alerts ({capacityWarnings.length})
            </CardTitle>
            <CardDescription>
              Classes at or approaching seat limits (≥80% capacity)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {capacityWarnings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-medium text-foreground">All classes have healthy seat availability</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No batches have currently exceeded 80% capacity.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {capacityWarnings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between gap-3 hover:bg-muted/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{item.name}</span>
                        <Badge
                          variant={item.warningLevel === "critical" ? "destructive" : "secondary"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {item.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.enrolledCount} of {item.capacity} spots filled • Code: {item.inviteCode || "—"}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => show("classes", item.id)}
                      className="shrink-0 gap-1"
                    >
                      Manage <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Recent Institutional Activity
            </CardTitle>
            <CardDescription>Live timeline of recent enrollments, courses, and signups</CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No recent activity recorded.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="py-2.5 flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      {activity.type === "enrollment" && <GraduationCap className="w-3.5 h-3.5" />}
                      {activity.type === "class_created" && <BookOpen className="w-3.5 h-3.5" />}
                      {activity.type === "user_joined" && <UserPlus className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {activity.title}
                      </p>
                      {activity.subtitle && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{activity.subtitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
