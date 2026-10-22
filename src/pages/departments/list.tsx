import React, { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDelete, useNavigation } from "@refinedev/core";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Building2, Trash2, BookOpen, AlertTriangle, Eye, Pencil } from "lucide-react";
import { Department } from "@/types";

export const DepartmentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [constraintWarning, setConstraintWarning] = useState<string | null>(null);

  const { mutate: deleteDepartment, isPending: isDeleting } = useDelete();
  const { show, edit } = useNavigation();

  const searchFilters = searchQuery
    ? [{ field: "name", operator: "contains" as const, value: searchQuery }]
    : [];

  const table = useTable<Department>({
    columns: useMemo<ColumnDef<Department>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 100,
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
          header: () => <p className="column-title">Department Name</p>,
          cell: ({ getValue, row }) => (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-foreground">{getValue<string>()}</span>
            </div>
          ),
        },
        {
          id: "description",
          accessorKey: "description",
          size: 280,
          header: () => <p className="column-title">Description</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground truncate line-clamp-1">
              {getValue<string>() || "—"}
            </span>
          ),
        },
        {
          id: "subjects",
          accessorKey: "subjectCount",
          size: 130,
          header: () => <p className="column-title text-center">Subjects</p>,
          cell: ({ getValue }) => {
            const count = getValue<number>() || 0;
            return (
              <div className="text-center">
                <Badge variant={count > 0 ? "secondary" : "outline"} className="gap-1">
                  <BookOpen className="w-3 h-3" />
                  {count} {count === 1 ? "Subject" : "Subjects"}
                </Badge>
              </div>
            );
          },
        },
        {
          id: "actions",
          size: 140,
          header: () => <p className="column-title text-right pr-2">Actions</p>,
          cell: ({ row }) => {
            const dept = row.original;
            return (
              <div className="flex items-center justify-end gap-1.5 shrink-0 pr-2">
                <ShowButton
                  recordItemId={dept.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  hideText
                  title="View Department"
                >
                  <Eye className="h-4 w-4" />
                </ShowButton>
                <EditButton
                  recordItemId={dept.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  hideText
                  title="Edit Department"
                >
                  <Pencil className="h-4 w-4" />
                </EditButton>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                  title="Delete Department"
                  onClick={() => {
                    if ((dept.subjectCount || 0) > 0) {
                      setConstraintWarning(
                        `Cannot delete "${dept.name}" because it still has ${dept.subjectCount} associated subject(s). Please reassign or delete the subjects first.`
                      );
                    } else {
                      setDeletingDept(dept);
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
      resource: "departments",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: searchFilters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  const confirmDelete = () => {
    if (!deletingDept) return;
    deleteDepartment(
      {
        resource: "departments",
        id: deletingDept.id,
      },
      {
        onSettled: () => setDeletingDept(null),
      }
    );
  };

  return (
    <ListView>
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 mb-4">
        <div>
          <h1 className="page-title text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage academic faculties, codes, and associated curriculum branches.
          </p>
        </div>
        <CreateButton />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable table={table} />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingDept)} onOpenChange={(open) => !open && setDeletingDept(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Department
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingDept?.name}</strong> ({deletingDept?.code})?
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

export default DepartmentsList;

