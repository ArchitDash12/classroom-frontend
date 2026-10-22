import React, { useState } from "react";
import { useCreate, useBack } from "@refinedev/core";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";

export const DepartmentsCreate = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: createDepartment, isPending } = useCreate();
  const back = useBack();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      setErrorMsg("Department Code and Name are required.");
      return;
    }

    setErrorMsg("");
    createDepartment(
      {
        resource: "departments",
        values: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => back(),
        onError: (err: any) => setErrorMsg(err?.message || "Failed to create department"),
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
          <h1 className="text-2xl font-bold tracking-tight">Create Department</h1>
          <p className="text-sm text-muted-foreground">Add a new academic department or school.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            Department Details
          </CardTitle>
          <CardDescription>Enter unique code and faculty designation.</CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="p-3 mb-4 text-sm rounded-lg bg-destructive/15 border border-destructive/30 text-destructive-foreground">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">Department Code <span className="text-destructive">*</span></Label>
              <Input
                id="code"
                placeholder="e.g. CS, MATH, PHYS, ENG"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                required
              />
              <p className="text-xs text-muted-foreground">Short unique identifier for the department.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Department Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Computer Science & Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(Optional)</span></Label>
              <Textarea
                id="description"
                placeholder="Brief summary of department programs, fields, and focus areas..."
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
                Create Department
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CreateView>
  );
};

export default DepartmentsCreate;

