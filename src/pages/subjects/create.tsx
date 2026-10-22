import React, { useState } from "react";
import { useCreate, useBack, useList } from "@refinedev/core";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Department } from "@/types";

export const SubjectsCreate = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: createSubject, isPending } = useCreate();
  const back = useBack();

  const { query: deptsQuery } = useList<Department>({
    resource: "departments",
    pagination: { pageSize: 100 },
  });
  const departments = deptsQuery.data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !departmentId) {
      setErrorMsg("Subject Code, Name, and Department are required.");
      return;
    }

    setErrorMsg("");
    createSubject(
      {
        resource: "subjects",
        values: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          departmentId: Number(departmentId),
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => back(),
        onError: (err: any) => setErrorMsg(err?.message || "Failed to create subject"),
      }
    );
  };

  return (
    <CreateView>
      <Breadcrumb />

      <div className="flex items-center gap-3 mt-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => back()} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Subject</h1>
          <p className="text-sm text-muted-foreground">Add a new curriculum course offering.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject Details
          </CardTitle>
          <CardDescription>Enter course code, name, and departmental assignment.</CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="p-3 mb-4 text-sm rounded-lg bg-destructive/15 border border-destructive/30 text-destructive-foreground">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Subject Code <span className="text-destructive">*</span></Label>
                <Input
                  id="code"
                  placeholder="e.g. CS101, MATH202"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Subject Title <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Data Structures and Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(Optional)</span></Label>
              <Textarea
                id="description"
                placeholder="Course syllabus outline, learning outcomes, prerequisites..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Subject
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CreateView>
  );
};

export default SubjectsCreate;
