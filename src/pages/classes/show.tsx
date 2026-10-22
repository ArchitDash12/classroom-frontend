import React, { useEffect, useState } from "react";
import { useShow, useBack, useNavigation, useList, useGetIdentity } from "@refinedev/core";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  UserPlus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Building2,
  AlertTriangle,
  Loader2,
  Edit,
  KeyRound,
  Users,
  CheckCircle2,
} from "lucide-react";
import { ClassDetails, EnrollmentStudent, User } from "@/types";
import { UserIdentity } from "@/providers/auth";
import { BACKEND_BASE_URL } from "@/constants";
import { toast } from "sonner";

export const ClassesShow = () => {
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  const back = useBack();
  const { edit } = useNavigation();
  const { data: identity } = useGetIdentity<UserIdentity>();

  const classDetails = query.data?.data;
  const isLoading = query.isLoading;

  const isStudent = identity?.role === "student";

  const [copiedCode, setCopiedCode] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [inviteCodeState, setInviteCodeState] = useState<string>("");

  // Enrollments State
  const [enrollments, setEnrollments] = useState<EnrollmentStudent[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState(false);
  const [unenrollingStudent, setUnenrollingStudent] = useState<EnrollmentStudent | null>(null);

  // Available students list
  const { query: studentsQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { pageSize: 100 },
  });
  const allStudents = studentsQuery.data?.data || [];

  const classId = classDetails?.id;

  useEffect(() => {
    if (classDetails?.inviteCode) {
      setInviteCodeState(classDetails.inviteCode);
    }
  }, [classDetails]);

  // Fetch enrollments for this class
  const fetchEnrollments = async () => {
    if (!classId) return;
    setIsLoadingEnrollments(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/classes/${classId}/enrollments`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setEnrollments(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchEnrollments();
    }
  }, [classId]);

  if (isLoading || !classDetails) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const {
    name,
    description,
    status,
    capacity = 50,
    bannerUrl,
    subject,
    teacher,
    department,
    schedules = [],
  } = classDetails;

  const currentEnrolledCount = enrollments.length;
  const fillPercentage = Math.min(100, Math.round((currentEnrolledCount / capacity) * 100));
  const isFull = currentEnrolledCount >= capacity;
  const isNearCapacity = fillPercentage >= 80 && !isFull;

  const handleCopyCode = () => {
    if (!inviteCodeState) return;
    navigator.clipboard.writeText(inviteCodeState);
    setCopiedCode(true);
    toast.success(`Invite code "${inviteCodeState}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!classId) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/classes/${classId}/regenerate-invite`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        const newCode = json.data?.inviteCode;
        if (newCode) {
          setInviteCodeState(newCode);
          toast.success(`New invite code generated: ${newCode}`);
        }
      }
    } catch {
      toast.error("Failed to regenerate invite code");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !selectedStudentId) return;

    if (isFull) {
      toast.error("Class has reached maximum seat capacity!");
      return;
    }

    setIsSubmittingEnrollment(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/classes/${classId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ studentId: selectedStudentId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Enrollment failed");
      }
      toast.success(json.message || "Student enrolled successfully!");
      setIsEnrollModalOpen(false);
      setSelectedStudentId("");
      fetchEnrollments();
      query.refetch?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to enroll student");
    } finally {
      setIsSubmittingEnrollment(false);
    }
  };

  const handleConfirmUnenroll = async () => {
    if (!classId || !unenrollingStudent) return;
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/classes/${classId}/enrollments/${unenrollingStudent.student.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to unenroll student");
      toast.success(`Unenrolled ${unenrollingStudent.student.name}`);
      setUnenrollingStudent(null);
      fetchEnrollments();
      query.refetch?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to unenroll student");
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const studentIdToSend = identity?.id || allStudents[0]?.id;
    const studentEmailToSend = identity?.email;

    setIsSubmittingEnrollment(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/classes/join-by-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          inviteCode: joinCodeInput.trim().toUpperCase(),
          studentId: studentIdToSend,
          studentEmail: studentEmailToSend,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to join class");
      }
      toast.success(json.message || "Joined class successfully!");
      setIsJoinModalOpen(false);
      setJoinCodeInput("");
      fetchEnrollments();
      query.refetch?.();
    } catch (err: any) {
      toast.error(err?.message || "Invalid invite code or class is full");
    } finally {
      setIsSubmittingEnrollment(false);
    }
  };

  const isCurrentUserEnrolled = enrollments.some(
    (e) => e.student.id === identity?.id || (Boolean(identity?.email) && e.student.email === identity?.email)
  );

  // Filter out students already enrolled
  const enrolledStudentIds = new Set(enrollments.map((e) => e.student.id));
  const availableStudents = allStudents.filter((s) => !enrolledStudentIds.has(s.id));

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header Banner */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="h-44 md:h-52 w-full bg-slate-900 relative">
          {bannerUrl ? (
            <img src={bannerUrl} alt={name} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="icon" onClick={() => back()} className="h-10 w-10 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{name}</h1>
                <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
                  {status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStudent ? (
              isCurrentUserEnrolled ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 py-1.5 px-3 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                </Badge>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsJoinModalOpen(true)} className="gap-1.5 shadow-sm">
                  <KeyRound className="w-4 h-4" /> Join Class with Code
                </Button>
              )
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsJoinModalOpen(true)} className="gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" /> Join with Code
                </Button>
                <Button size="sm" onClick={() => edit("classes", classId)} className="gap-1.5">
                  <Edit className="w-4 h-4" /> Edit Class
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Capacity Alert Banners */}
      {isFull && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-rose-200">Class is at Maximum Capacity (100% Full)</p>
            <p className="text-xs text-rose-300/90 mt-0.5">
              All {capacity} seats are occupied. New student enrollments are currently locked.
            </p>
          </div>
        </div>
      )}

      {isNearCapacity && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-amber-200">Seat Capacity Warning ({fillPercentage}% Filled)</p>
            <p className="text-xs text-amber-300/90 mt-0.5">
              Only {capacity - currentEnrolledCount} spot(s) remaining out of {capacity}.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Overview, Invite Code & Instructor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Capacity Card & Invite Code */}
        <div className="space-y-6 md:col-span-1">
          {/* Capacity Safeguard Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Seat Capacity Status
                </span>
                <Badge
                  variant={isFull ? "destructive" : isNearCapacity ? "secondary" : "outline"}
                  className="font-bold text-xs"
                >
                  {fillPercentage}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Enrolled: <strong>{currentEnrolledCount}</strong></span>
                  <span>Limit: <strong>{capacity}</strong></span>
                </div>
                <Progress
                  value={fillPercentage}
                  className={`h-2.5 ${isFull ? "[&>div]:bg-rose-500" : isNearCapacity ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {isFull
                  ? "No seats remaining."
                  : `${capacity - currentEnrolledCount} seat(s) available for new students.`}
              </p>
            </CardContent>
          </Card>

          {/* Invite Code Widget for Teachers/Admins OR Status/Join for Students */}
          {!isStudent ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" /> Class Invite Code
                </CardTitle>
                <CardDescription className="text-xs">
                  Students can use this unique code to self-enroll into this batch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono font-bold text-lg tracking-wider text-center py-2 px-3 bg-muted rounded-md border border-border">
                    {inviteCodeState || "NO-CODE"}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copy code">
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRegenerateCode}
                    disabled={isRegenerating}
                    title="Regenerate code"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isCurrentUserEnrolled ? (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Enrollment Status
                </CardTitle>
                <CardDescription className="text-xs">
                  You are actively enrolled in this class batch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-white font-medium">
                  Enrolled Student
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  You have full access to this course's schedule and lectures.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" /> Join This Class
                </CardTitle>
                <CardDescription className="text-xs">
                  Enter the invite code provided by your teacher to enroll in this batch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinByCode} className="space-y-3">
                  <Input
                    placeholder="Enter invite code (e.g. CS101A)"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    maxLength={12}
                    className="font-mono tracking-wider uppercase text-center"
                    disabled={isFull}
                  />
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmittingEnrollment || !joinCodeInput.trim() || isFull}
                  >
                    {isSubmittingEnrollment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {isFull ? "Class is Full" : "Join Class"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Instructor & Dept Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Faculty & Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={teacher?.image} alt={teacher?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {teacher?.name?.slice(0, 2).toUpperCase() || "T"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{teacher?.name || "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground">{teacher?.email || "No email"}</p>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Subject
                  </span>
                  <span className="font-medium text-foreground">{subject?.name || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Department
                  </span>
                  <span className="font-medium text-foreground">{department?.name || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedules Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No recurring schedules set.</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/40 text-xs">
                      <span className="font-medium text-foreground">{slot.day}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Enrolled Students Roster */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Enrolled Students ({currentEnrolledCount})
                </CardTitle>
                <CardDescription>Active student cohort enrolled in this class batch.</CardDescription>
              </div>

              {!isStudent && (
                <Button
                  size="sm"
                  onClick={() => setIsEnrollModalOpen(true)}
                  disabled={isFull}
                  className="gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Enroll Student
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingEnrollments ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                Loading enrollment roster...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium text-foreground">No students enrolled yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isStudent
                    ? "Enrollments for this class batch will appear here."
                    : "Enroll a student using the button above or share the invite code."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {enrollments.map((item) => (
                  <div
                    key={item.enrollmentId}
                    className="py-3 px-2 flex items-center justify-between hover:bg-muted/30 rounded-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={item.student.image} alt={item.student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {item.student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.student.name}</p>
                        <p className="text-xs text-muted-foreground">{item.student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        Enrolled {new Date(item.enrolledAt).toLocaleDateString()}
                      </span>
                      {!isStudent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Unenroll student"
                          onClick={() => setUnenrollingStudent(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enroll Student Dialog */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Enroll Student in Class
            </DialogTitle>
            <DialogDescription>
              Select an existing student to enroll into <strong>{name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnrollStudent} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="studentSelect">Select Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger id="studentSelect">
                  <SelectValue placeholder="Choose a registered student..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available students to enroll
                    </SelectItem>
                  ) : (
                    availableStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Current Seat Usage:</span>
                <span className="font-semibold text-foreground">
                  {currentEnrolledCount} / {capacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Spots:</span>
                <span className="font-semibold text-foreground">
                  {capacity - currentEnrolledCount}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingEnrollment || !selectedStudentId}>
                {isSubmittingEnrollment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Enrollment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join with Invite Code Dialog */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Join Class with Invite Code
            </DialogTitle>
            <DialogDescription>
              Enter the 7-character invite code provided by your course instructor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinByCode} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Invite Code</Label>
              <Input
                id="joinCode"
                placeholder="e.g. DSA2026"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="font-mono uppercase font-bold text-center tracking-widest text-lg"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsJoinModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingEnrollment || !joinCodeInput}>
                {isSubmittingEnrollment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Join Class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(unenrollingStudent)} onOpenChange={(open) => !open && setUnenrollingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Unenroll Student
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll <strong>{unenrollingStudent?.student.name}</strong> from{" "}
              <strong>{name}</strong>? They will immediately lose access to course materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnenroll} className="bg-destructive hover:bg-destructive/90 text-white">
              Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassesShow;
