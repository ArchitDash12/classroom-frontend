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
import { GraduationCap, ArrowLeft, Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import { ClassDetails, Subject, User, Schedule } from "@/types";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const ClassesEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(30);
  const [status, setStatus] = useState<"active" | "inactive" | "archived">("active");
  const [bannerUrl, setBannerUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const back = useBack();
  const { query } = useOne<ClassDetails>({
    resource: "classes",
    id: id || "",
  });
  const { mutate: updateClass, isPending: isUpdating } = useUpdate();

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });
  const subjects = subjectsQuery.data?.data || [];

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });
  const teachers = teachersQuery.data?.data || [];

  const classData = query.data?.data;
  const isLoading = query.isLoading;

  useEffect(() => {
    if (classData) {
      setName(classData.name || "");
      setDescription(classData.description || "");
      if (classData.subjectId) setSubjectId(String(classData.subjectId));
      else if (classData.subject?.id) setSubjectId(String(classData.subject.id));

      if (classData.teacherId) setTeacherId(String(classData.teacherId));
      else if (classData.teacher?.id) setTeacherId(String(classData.teacher.id));

      setCapacity(classData.capacity || 30);
      setStatus(classData.status || "active");
      setBannerUrl(classData.bannerUrl || "");
      setInviteCode(classData.inviteCode || "");
      setSchedules(Array.isArray(classData.schedules) ? classData.schedules : []);
    }
  }, [classData]);

  const addScheduleSlot = () => {
    setSchedules([...schedules, { day: "Monday", startTime: "09:00", endTime: "10:30" }]);
  };

  const removeScheduleSlot = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index: number, field: keyof Schedule, value: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subjectId || !teacherId) {
      setErrorMsg("Class Name, Subject, and Instructor are required.");
      return;
    }

    setErrorMsg("");
    updateClass(
      {
        resource: "classes",
        id: id || "",
        values: {
          name: name.trim(),
          description: description.trim(),
          subjectId: Number(subjectId),
          teacherId,
          capacity: Number(capacity),
          status,
          bannerUrl: bannerUrl.trim() || undefined,
          inviteCode: inviteCode.trim().toUpperCase(),
          schedules,
        },
      },
      {
        onSuccess: () => back(),
        onError: (err: any) => setErrorMsg(err?.message || "Failed to update class"),
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Class</h1>
          <p className="text-sm text-muted-foreground">Update class settings, schedule, and capacity.</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-primary" />
            Class Configuration #{id}
          </CardTitle>
          <CardDescription>Adjust course parameters, teacher assignment, and seat capacity.</CardDescription>
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
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="teacher">Teacher / Instructor</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="Select Instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Seat Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={500}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum student spots available.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bannerUrl">Banner Image URL</Label>
              <Input
                id="bannerUrl"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Weekly Schedules Builder */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Weekly Schedules</Label>
                  <p className="text-xs text-muted-foreground">Add recurring lecture or lab slots</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Slot
                </Button>
              </div>

              {schedules.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">No schedules set.</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/40 p-2 rounded-md">
                      <Select
                        value={slot.day}
                        onValueChange={(val) => updateScheduleSlot(index, "day", val)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateScheduleSlot(index, "startTime", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateScheduleSlot(index, "endTime", e.target.value)}
                        className="w-32"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeScheduleSlot(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

export default ClassesEdit;

