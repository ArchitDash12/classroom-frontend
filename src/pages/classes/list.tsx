import React, { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useList, useDelete, useNavigation, useGetIdentity } from "@refinedev/core";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Copy,
  Check,
  Trash2,
  GraduationCap,
  Users,
  AlertTriangle,
  Eye,
  Pencil,
  KeyRound,
  Loader2,
} from "lucide-react";
import { ClassDetails, Subject, User } from "@/types";
import { UserIdentity } from "@/providers/auth";
import { BACKEND_BASE_URL } from "@/constants";
import { toast } from "sonner";

export const ClassesList = () => {
  const { data: identity } = useGetIdentity<UserIdentity>();
  const isStudent = identity?.role === "student";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassDetails | null>(null);
  const [constraintWarning, setConstraintWarning] = useState<string | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const { mutate: deleteClass, isPending: isDeleting } = useDelete();

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsQuery?.data?.data || [];
  const teachers = teachersQuery?.data?.data || [];

  const subjectFilters =
    selectedSubject === "all"
      ? []
      : [{ field: "subject", operator: "eq" as const, value: selectedSubject }];

  const teacherFilters =
    selectedTeacher === "all"
      ? []
      : [{ field: "teacher", operator: "eq" as const, value: selectedTeacher }];

  const statusFilters =
    selectedStatus === "all"
      ? []
      : [{ field: "status", operator: "eq" as const, value: selectedStatus }];

  const searchFilters = searchQuery
    ? [{ field: "name", operator: "contains" as const, value: searchQuery }]
    : [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Invite code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setIsJoining(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/classes/join-by-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          inviteCode: joinCodeInput.trim().toUpperCase(),
          studentId: identity?.id,
          studentEmail: identity?.email,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to join class");
      }
      toast.success(json.message || "Joined class successfully!");
      setIsJoinModalOpen(false);
      setJoinCodeInput("");
      table.refetch?.();
    } catch (err: any) {
      toast.error(err?.message || "Invalid invite code or class is full");
    } finally {
      setIsJoining(false);
    }
  };

  const table = useTable<ClassDetails>({
    columns: useMemo<ColumnDef<ClassDetails>[]>(
      () => {
        const cols: ColumnDef<ClassDetails>[] = [
          {
            id: "banner",
            accessorKey: "bannerUrl",
            size: 70,
            header: () => <p className="column-title ml-2">Banner</p>,
            cell: ({ getValue, row }) => {
              const bannerUrl = getValue<string>();
              return bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt={row.original.name}
                  className="w-12 h-9 rounded object-cover ml-2 border border-border"
                />
              ) : (
                <div className="w-12 h-9 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground ml-2 border border-dashed">
                  Class
                </div>
              );
            },
          },
          {
            id: "name",
            accessorKey: "name",
            size: 190,
            header: () => <p className="column-title">Class Name</p>,
            cell: ({ getValue, row }) => (
              <div>
                <p className="text-foreground font-semibold text-sm line-clamp-1">{getValue<string>()}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{row.original.subject?.name || "Subject"}</p>
              </div>
            ),
            filterFn: "includesString",
          },
        ];

        // ONLY Admin and Teacher see the Invite Code column
        if (!isStudent) {
          cols.push({
            id: "inviteCode",
            accessorKey: "inviteCode",
            size: 110,
            header: () => <p className="column-title">Invite Code</p>,
            cell: ({ getValue }) => {
              const code = getValue<string>() || "—";
              return (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono font-bold tracking-wider text-xs">
                    {code}
                  </Badge>
                  {code !== "—" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopyCode(code)}
                    >
                      {copiedCode === code ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  )}
                </div>
              );
            },
          });
        }

        cols.push(
          {
            id: "teacher",
            accessorKey: "teacher.name",
            size: 140,
            header: () => <p className="column-title">Instructor</p>,
            cell: ({ row }) => {
              const teacherName = row.original.teacher?.name || "Unassigned";
              return <span className="text-xs font-medium text-foreground">{teacherName}</span>;
            },
          },
          {
            id: "capacityStatus",
            size: 160,
            header: () => <p className="column-title">Enrollment & Capacity</p>,
            cell: ({ row }) => {
              const cap = row.original.capacity || 50;
              const enrolled = row.original.enrolledCount ?? 0;
              const pct = Math.min(100, Math.round((enrolled / cap) * 100));

              let badgeVariant = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
              if (pct >= 100) {
                badgeVariant = "bg-rose-500/15 text-rose-400 border-rose-500/30";
              } else if (pct >= 80) {
                badgeVariant = "bg-amber-500/15 text-amber-400 border-amber-500/30";
              }

              return (
                <div className="space-y-1.5 w-36">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {enrolled} / {cap}
                    </span>
                    <Badge className={`text-[10px] px-1.5 py-0 font-bold ${badgeVariant}`}>
                      {pct}% {pct >= 100 ? "FULL" : ""}
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            },
          },
          {
            id: "status",
            accessorKey: "status",
            size: 90,
            header: () => <p className="column-title">Status</p>,
            cell: ({ getValue }) => {
              const status = getValue<string>() || "inactive";
              return (
                <Badge
                  variant={status === "active" ? "default" : "secondary"}
                  className="capitalize text-xs font-medium"
                >
                  {status}
                </Badge>
              );
            },
          },
          {
            id: "actions",
            size: 140,
            header: () => <p className="column-title text-right pr-2">Actions</p>,
            cell: ({ row }) => {
              const cls = row.original;
              return (
                <div className="flex items-center justify-end gap-1.5 shrink-0 pr-2">
                  <ShowButton
                    recordItemId={cls.id}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                    hideText
                    title="View Class"
                  >
                    <Eye className="h-4 w-4" />
                  </ShowButton>
                  {!isStudent && (
                    <>
                      <EditButton
                        recordItemId={cls.id}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                        hideText
                        title="Edit Class"
                      >
                        <Pencil className="h-4 w-4" />
                      </EditButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                        title="Delete Class"
                        onClick={() => setDeletingClass(cls)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              );
            },
          }
        );

        return cols;
      },
      [copiedCode, isStudent]
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [
          ...subjectFilters,
          ...teacherFilters,
          ...statusFilters,
          ...searchFilters,
        ],
      },
      sorters: {
        initial: [{ field: "createdAt", order: "desc" }],
      },
    },
  });

  const confirmDelete = () => {
    if (!deletingClass) return;
    deleteClass(
      {
        resource: "classes",
        id: deletingClass.id,
      },
      {
        onSettled: () => setDeletingClass(null),
        onError: (err: any) => {
          setConstraintWarning(
            err?.message || `Cannot delete class "${deletingClass.name}". Enrolled students must be removed first.`
          );
        },
      }
    );
  };

  return (
    <ListView>
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 mb-4">
        <div>
          <h1 className="page-title text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isStudent
              ? "Browse course batches, schedules, and capacity status."
              : "Manage course batches, enrollment capacity, schedules, and invite codes."}
          </p>
        </div>
        {isStudent ? (
          <Button onClick={() => setIsJoinModalOpen(true)} className="gap-2 shadow-sm">
            <KeyRound className="w-4 h-4" /> Join Class with Code
          </Button>
        ) : (
          <CreateButton />
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isStudent ? "Search classes..." : "Search classes or invite codes..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Instructors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instructors</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable table={table} />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingClass)} onOpenChange={(open) => !open && setDeletingClass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Class
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingClass?.name}</strong>?
              {deletingClass?.enrolledCount && deletingClass.enrolledCount > 0 ? (
                <span className="block mt-2 text-amber-500 font-medium">
                  Warning: This class currently has {deletingClass.enrolledCount} enrolled student(s).
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Constraint Warning Alert Dialog */}
      <AlertDialog open={Boolean(constraintWarning)} onOpenChange={(open) => !open && setConstraintWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              Delete Constraint Protection
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground text-sm pt-2">
              {constraintWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setConstraintWarning(null)}>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Join Class with Code Dialog for Students */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Join Class with Invite Code
            </DialogTitle>
            <DialogDescription>
              Enter the unique invite code provided by your teacher to enroll in this course.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinByCode} className="space-y-4 py-2">
            <div className="space-y-2">
              <Input
                placeholder="Enter 7-character code (e.g. CS101A)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={12}
                className="font-mono tracking-wider uppercase text-center text-lg py-5"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsJoinModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isJoining || !joinCodeInput.trim()} className="gap-2">
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                Join Class
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ListView>
  );
};

export default ClassesList;
