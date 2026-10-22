import React, { useEffect, useState } from "react";
import { useOne, useUpdate, useBack, useList } from "@refinedev/core";
import { useParams } from "react-router";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Subject, Department } from "@/types";

export const SubjectsEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const back = useBack();
  const { query } = useOne<Subject>({
    resource: "subjects",
    id: id || "",
  });
  const { mutate: updateSubject, isPending: isUpdating } = useUpdate();

  const { query: deptsQuery } = useList<Department>({
    resource: "departments",
    pagination: { pageSize: 100 },
  });
  const departments = deptsQuery.data?.data || [];

  const subject = query.data?.data;
  const isLoading = query.isLoading;

  useEffect(() => {
    if (subject) {
      setCode(subject.code || "");
      setName(subject.name || "");
      setDescription(subject.description || "");
      if (subject.departmentId) {
        setDepartmentId(String(subject.departmentId));
      } else if (typeof subject.department === "object" && subject.department?.id) {
        setDepartmentId(String(subject.department.id));
      }
    }
  }, [subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !departmentId) {
      setErrorMsg("Subject Name and Department are required.");
      return;
    }

    setErrorMsg("");
    updateSubject(
      {
        resource: "subjects",
        id: id || "",
        values: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          departmentId: Number(departmentId),
          description: description.trim(),
        },
      },
      {
        onSuccess: () => back(),
        onError: (err: any) => setErrorMsg(err?.message || "Failed to update subject"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />

      <div className="flex items-center gap-3 mt-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => back()} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Subject</h1>
          <p className="text-sm text-muted-foreground">Update subject details and department assignment.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Edit Subject #{id}
          </CardTitle>
          <CardDescription>Modify curriculum offering parameters.</CardDescription>
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
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
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
              <Label htmlFor="name">Subject Title</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectsEdit;

