import React from "react";
import { useShow, useBack, useNavigation, useGetIdentity } from "@refinedev/core";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ArrowLeft, Mail, Calendar, Shield, School, GraduationCap, Edit } from "lucide-react";
import { User as UserType } from "@/types";
import { UserIdentity } from "@/providers/auth";

export const UsersShow = () => {
  const { query } = useShow<UserType>({ resource: "users" });
  const back = useBack();
  const { edit, show } = useNavigation();
  const { data: identity } = useGetIdentity<UserIdentity>();
  const isViewerStudent = identity?.role === "student";

  const user = query.data?.data;
  const isLoading = query.isLoading;

  if (isLoading || !user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading user profile...
      </div>
    );
  }

  const role = user.role?.toLowerCase();
  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const taughtClasses = user.taughtClasses || [];
  const enrolledClasses = user.enrolledClasses || [];

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => back()} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
              {role === "admin" && (
                <Badge className="bg-purple-600/15 text-purple-400 border-purple-500/30 gap-1 font-semibold">
                  <Shield className="w-3 h-3" /> Admin
                </Badge>
              )}
              {role === "teacher" && (
                <Badge className="bg-emerald-600/15 text-emerald-400 border-emerald-500/30 gap-1 font-semibold">
                  <School className="w-3 h-3" /> Teacher
                </Badge>
              )}
              {role === "student" && (
                <Badge className="bg-blue-600/15 text-blue-400 border-blue-500/30 gap-1 font-semibold">
                  <GraduationCap className="w-3 h-3" /> Student
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>

        <Button onClick={() => edit("users", user.id)} className="gap-2">
          <Edit className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <Avatar className="h-24 w-24 mx-auto mb-3 border-2 border-border shadow-md">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {user.email}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 border-t">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Member Since</p>
              <div className="flex items-center gap-1.5 text-sm font-medium mt-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">User ID</p>
              <p className="font-mono text-xs text-muted-foreground mt-1 break-all bg-muted/40 p-2 rounded">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Classes (Taught if teacher, Enrolled if student) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              {role === "teacher"
                ? `Instructed Classes (${taughtClasses.length})`
                : role === "student"
                ? `Enrolled Classes (${enrolledClasses.length})`
                : `Assigned Classes`}
            </CardTitle>
            <CardDescription>
              {role === "teacher"
                ? "Classes where this user is assigned as primary instructor"
                : "Active course enrollments and schedules"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {role === "teacher" && (
              <>
                {taughtClasses.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                    <School className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active classes currently assigned to this teacher.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {taughtClasses.map((c: any) => (
                      <div key={c.id} className="py-3 flex items-center justify-between hover:bg-muted/30 px-2 rounded transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{c.name}</span>
                            <Badge variant={c.status === "active" ? "default" : "secondary"}>
                              {c.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {c.subjectName || "Subject"} • Capacity: {c.capacity} spots{!isViewerStudent && c.inviteCode ? ` • Code: ${c.inviteCode}` : ""}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => show("classes", c.id)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {role === "student" && (
              <>
                {enrolledClasses.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>This student is not currently enrolled in any classes.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {enrolledClasses.map((c: any) => (
                      <div key={c.id} className="py-3 flex items-center justify-between hover:bg-muted/30 px-2 rounded transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{c.name}</span>
                            <Badge variant={c.status === "active" ? "default" : "secondary"}>
                              {c.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {c.subjectName || "Subject"}{!isViewerStudent && c.inviteCode ? ` • Code: ${c.inviteCode}` : ""}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => show("classes", c.id)}>
                          View Class
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {role === "admin" && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p>Administrator account with unrestricted system-wide permissions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersShow;

