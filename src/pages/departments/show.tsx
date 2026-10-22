import React from "react";
import { useShow, useBack, useNavigation } from "@refinedev/core";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft, BookOpen, GraduationCap, Edit, Calendar } from "lucide-react";
import { Department } from "@/types";

export const DepartmentsShow = () => {
  const { query } = useShow<Department>({ resource: "departments" });
  const back = useBack();
  const { edit, show } = useNavigation();

  const dept = query.data?.data;
  const isLoading = query.isLoading;

  if (isLoading || !dept) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading department details...
      </div>
    );
  }

  const subjectsList = dept.subjects || [];

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
              <h1 className="text-2xl font-bold tracking-tight">{dept.name}</h1>
              <Badge variant="outline" className="font-mono font-bold">
                {dept.code}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Department Profile & Associated Curricula
            </p>
          </div>
        </div>

        <Button onClick={() => edit("departments", dept.id)} className="gap-2">
          <Edit className="w-4 h-4" /> Edit Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Faculty Code</p>
              <p className="font-mono font-bold text-lg text-foreground mt-0.5">{dept.code}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
              <p className="text-sm text-foreground mt-1 leading-relaxed">
                {dept.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{dept.subjectCount ?? subjectsList.length}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <GraduationCap className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{dept.classCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Linked Subjects */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Curricular Subjects ({subjectsList.length})
              </span>
            </CardTitle>
            <CardDescription>
              Subjects offered under {dept.name}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {subjectsList.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No subjects currently associated with this department.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {subjectsList.map((subject) => (
                  <div key={subject.id} className="py-3.5 flex items-center justify-between hover:bg-muted/30 px-2 rounded-md transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                          {subject.code}
                        </Badge>
                        <span className="font-medium text-foreground">{subject.name}</span>
                      </div>
                      {subject.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {subject.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => show("subjects", subject.id)}
                      className="text-xs"
                    >
                      View Subject
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

export default DepartmentsShow;

