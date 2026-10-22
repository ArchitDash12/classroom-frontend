import React from "react";
import { useShow, useBack, useNavigation, useGetIdentity } from "@refinedev/core";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Building2, GraduationCap, Edit } from "lucide-react";
import { Subject } from "@/types";
import { UserIdentity } from "@/providers/auth";

export const SubjectsShow = () => {
  const { query } = useShow<Subject>({ resource: "subjects" });
  const back = useBack();
  const { edit, show } = useNavigation();
  const { data: identity } = useGetIdentity<UserIdentity>();
  const isStudent = identity?.role === "student";

  const subject = query.data?.data;
  const isLoading = query.isLoading;

  if (isLoading || !subject) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading subject details...
      </div>
    );
  }

  const dept = subject.department;
  const deptName = typeof dept === "object" ? dept?.name : String(dept || "Unassigned");
  const deptCode = typeof dept === "object" ? dept?.code : "";
  const classesList = subject.classes || [];

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
              <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
              <Badge variant="outline" className="font-mono font-bold">
                {subject.code}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Course Details & Active Offerings
            </p>
          </div>
        </div>

        <Button onClick={() => edit("subjects", subject.id)} className="gap-2">
          <Edit className="w-4 h-4" /> Edit Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Subject Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Subject Code</p>
              <p className="font-mono font-bold text-lg text-foreground mt-0.5">{subject.code}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Department</p>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{deptName}</span>
                {deptCode && <Badge variant="secondary">{deptCode}</Badge>}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
              <p className="text-sm text-foreground mt-1 leading-relaxed">
                {subject.description || "No description provided."}
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <GraduationCap className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{subject.classCount ?? classesList.length}</p>
                <p className="text-xs text-muted-foreground">Active Classes Offering This</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Active Classes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Classes Offering This Subject ({classesList.length})
              </span>
            </CardTitle>
            <CardDescription>
              Registered classes, batches, and schedules
            </CardDescription>
          </CardHeader>

          <CardContent>
            {classesList.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active classes currently configured for this subject.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {classesList.map((cls) => (
                  <div key={cls.id} className="py-3.5 flex items-center justify-between hover:bg-muted/30 px-2 rounded-md transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{cls.name}</span>
                        <Badge variant={cls.status === "active" ? "default" : "secondary"}>
                          {cls.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Capacity: {cls.capacity} spots{!isStudent && cls.inviteCode ? ` • Code: ${cls.inviteCode}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => show("classes", cls.id)}
                      className="text-xs"
                    >
                      View Class
                    </Button>
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

export default SubjectsShow;

