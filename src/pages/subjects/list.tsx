import React, { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDelete, useList, useNavigation } from "@refinedev/core";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, BookOpen, Trash2, GraduationCap, AlertTriangle, Eye, Pencil } from "lucide-react";
import { Subject, Department } from "@/types";

export const SubjectsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [constraintWarning, setConstraintWarning] = useState<string | null>(null);

  const { mutate: deleteSubject, isPending: isDeleting } = useDelete();
  const { show, edit } = useNavigation();

  // Load departments dynamically for the filter dropdown
  const { query: deptsQuery } = useList<Department>({
    resource: "departments",
    pagination: { pageSize: 100 },
  });
  const departmentsList = deptsQuery.data?.data || [];

  const departmentFilters =
    selectedDepartment === "all"
      ? []
      : [{ field: "department", operator: "eq" as const, value: selectedDepartment }];

  const searchFilters = searchQuery
    ? [{ field: "name", operator: "contains" as const, value: searchQuery }]
    : [];

  const table = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 110,
          header: () => <p className="column-title ml-2">Code</p>,
          cell: ({ getValue }) => (
            <Badge variant="outline" className="font-mono font-bold tracking-wider ml-2">
              {getValue<string>()}
            </Badge>
          ),
        },
        {
          id: "name",
          accessorKey: "name",
          size: 220,
          header: () => <p className="column-title">Subject Name</p>,
          cell: ({ getValue }) => (
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-foreground">{getValue<string>()}</span>
            </div>
          ),
        },
        {
          id: "department",
          accessorKey: "department.name",
          size: 180,
          header: () => <p className="column-title">Department</p>,
          cell: ({ row }) => {
            const dept = row.original.department;
            const deptName = typeof dept === "object" ? dept?.name : String(dept || "—");
            return <Badge variant="secondary">{deptName}</Badge>;
          },
        },
        {
          id: "classes",
          accessorKey: "classCount",
          size: 120,
          header: () => <p className="column-title text-center">Classes</p>,
          cell: ({ getValue }) => {
            const count = getValue<number>() || 0;
            return (
              <div className="text-center">
                <Badge variant={count > 0 ? "default" : "outline"} className="gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {count} {count === 1 ? "Class" : "Classes"}
                </Badge>
              </div>
            );
          },
        },
        {
          id: "description",
          accessorKey: "description",
          size: 260,
          header: () => <p className="column-title">Description</p>,
          cell: ({ getValue }) => (
            <span className="truncate line-clamp-1 text-muted-foreground">
              {getValue<string>() || "—"}
            </span>
          ),
        },
        {
          id: "actions",
          size: 140,
          header: () => <p className="column-title text-right pr-2">Actions</p>,
          cell: ({ row }) => {
            const subject = row.original;
            return (
              <div className="flex items-center justify-end gap-1.5 shrink-0 pr-2">
                <ShowButton
                  recordItemId={subject.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  hideText
                  title="View Subject"
                >
                  <Eye className="h-4 w-4" />
                </ShowButton>
                <EditButton
                  recordItemId={subject.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  hideText
                  title="Edit Subject"
                >
                  <Pencil className="h-4 w-4" />
                </EditButton>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                  title="Delete Subject"
                  onClick={() => {
                    if ((subject.classCount || 0) > 0) {
                      setConstraintWarning(
                        `Cannot delete "${subject.name}" because it still has ${subject.classCount} active class(es) offering it. Please delete or reassign those classes first.`
                      );
                    } else {
                      setDeletingSubject(subject);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        },
      ],
      []
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [...departmentFilters, ...searchFilters],
      },
      sorters: {
        initial: [{ field: "createdAt", order: "desc" }],
      },
    },
  });

  const confirmDelete = () => {
    if (!deletingSubject) return;
    deleteSubject(
      {
        resource: "subjects",
        id: deletingSubject.id,
      },
      {
        onSettled: () => setDeletingSubject(null),
      }
    );
  };

  return (
    <ListView>
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 mb-4">
        <div>
          <h1 className="page-title text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Curriculum courses, subject codes, and departmental assignments.
          </p>
        </div>
        <CreateButton />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or code..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentsList.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable table={table} />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingSubject)} onOpenChange={(open) => !open && setDeletingSubject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Subject
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingSubject?.name}</strong> ({deletingSubject?.code})?
              This action cannot be undone.
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

      {/* Constraint Blocking Warning Alert Dialog */}
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
    </ListView>
  );
};

export default SubjectsList;
