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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, User as UserIcon, Shield, School, GraduationCap, Trash2, AlertTriangle, Eye, Pencil } from "lucide-react";
import { User } from "@/types";

export const UsersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [constraintWarning, setConstraintWarning] = useState<string | null>(null);

  const { mutate: deleteUser, isPending: isDeleting } = useDelete();

  const roleFilters =
    selectedRole === "all"
      ? []
      : [{ field: "role", operator: "eq" as const, value: selectedRole }];

  const searchFilters = searchQuery
    ? [{ field: "name", operator: "contains" as const, value: searchQuery }]
    : [];

  const table = useTable<User>({
    columns: useMemo<ColumnDef<User>[]>(
      () => [
        {
          id: "avatar",
          size: 60,
          header: () => <p className="column-title ml-2">User</p>,
          cell: ({ row }) => {
            const u = row.original;
            const initials = u.name
              ? u.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U";
            return (
              <div className="flex items-center gap-3 ml-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.image} alt={u.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            );
          },
        },
        {
          id: "role",
          accessorKey: "role",
          size: 130,
          header: () => <p className="column-title">Role</p>,
          cell: ({ getValue }) => {
            const role = getValue<string>()?.toLowerCase();
            if (role === "admin") {
              return (
                <Badge className="bg-purple-600/15 text-purple-400 border-purple-500/30 gap-1 font-semibold">
                  <Shield className="w-3 h-3" /> Admin
                </Badge>
              );
            }
            if (role === "teacher") {
              return (
                <Badge className="bg-emerald-600/15 text-emerald-400 border-emerald-500/30 gap-1 font-semibold">
                  <School className="w-3 h-3" /> Teacher
                </Badge>
              );
            }
            return (
              <Badge className="bg-blue-600/15 text-blue-400 border-blue-500/30 gap-1 font-semibold">
                <GraduationCap className="w-3 h-3" /> Student
              </Badge>
            );
          },
        },
        {
          id: "createdAt",
          accessorKey: "createdAt",
          size: 140,
          header: () => <p className="column-title">Joined</p>,
          cell: ({ getValue }) => {
            const val = getValue<string>();
            return (
              <span className="text-xs text-muted-foreground">
                {val ? new Date(val).toLocaleDateString() : "—"}
              </span>
            );
          },
        },
        {
          id: "actions",
          size: 140,
          header: () => <p className="column-title text-right pr-2">Actions</p>,
          cell: ({ row }) => {
            const u = row.original;
            return (
              <div className="flex items-center justify-end gap-1.5 shrink-0 pr-2">
                <ShowButton
                  recordItemId={u.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  hideText
                  title="View User"
                >
                  <Eye className="h-4 w-4" />
                </ShowButton>
                <EditButton
                  recordItemId={u.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  hideText
                  title="Edit User"
                >
                  <Pencil className="h-4 w-4" />
                </EditButton>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                  title="Delete User"
                  onClick={() => setDeletingUser(u)}
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
      resource: "users",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [...roleFilters, ...searchFilters],
      },
      sorters: {
        initial: [{ field: "createdAt", order: "desc" }],
      },
    },
  });

  const confirmDelete = () => {
    if (!deletingUser) return;
    deleteUser(
      {
        resource: "users",
        id: deletingUser.id,
      },
      {
        onSettled: () => setDeletingUser(null),
        onError: (err: any) => {
          setConstraintWarning(
            err?.message || `Cannot delete user "${deletingUser.name}" due to active class/enrollment constraints.`
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
          <h1 className="page-title text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage administrators, faculty instructors, and registered students.
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
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable table={table} />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.name}</strong> ({deletingUser?.email})?
              If this user is assigned to active classes, deletion may be prevented.
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
    </ListView>
  );
};

export default UsersList;

