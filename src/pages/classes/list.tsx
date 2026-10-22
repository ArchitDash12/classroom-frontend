import { CreateButton } from "@/components/refine-ui/buttons/create";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassDetails, Subject, User } from "@/types";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
    queryOptions: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "teacher" },
    ],
    pagination: { pageSize: 100 },
    queryOptions: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
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

  const searchFilters = searchQuery
    ? [{ field: "name", operator: "contains" as const, value: searchQuery }]
    : [];

  const classesTable = useTable<ClassDetails>({
    columns: useMemo<ColumnDef<ClassDetails>[]>(
      () => [
        {
          id: "banner",
          accessorKey: "bannerUrl",
          size: 100,
          header: () => <p className="column-title ml-2">Banner</p>,
          cell: ({ getValue, row }) => {
            const bannerUrl = getValue<string>();
            return bannerUrl ? (
              <img
                src={bannerUrl}
                alt={row.original.name}
                className="w-14 h-10 rounded object-cover ml-2"
              />
            ) : (
              <div className="w-14 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground ml-2">
                No image
              </div>
            );
          },
        },
        {
          id: "name",
          accessorKey: "name",
          size: 200,
          header: () => <p className="column-title">Class Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-medium">{getValue<string>()}</span>
          ),
          filterFn: "includesString",
        },
        {
          id: "status",
          accessorKey: "status",
          size: 100,
          header: () => <p className="column-title">Status</p>,
          cell: ({ getValue }) => {
            const status = getValue<string>();
            return (
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {status}
              </Badge>
            );
          },
        },
        {
          id: "subject",
          accessorKey: "subject.name",
          size: 150,
          header: () => <p className="column-title">Subject</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "teacher",
          accessorKey: "teacher.name",
          size: 150,
          header: () => <p className="column-title">Teacher</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          size: 100,
          header: () => <p className="column-title">Capacity</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<number>()}</span>
          ),
        },
        {
          id: "details",
          size: 140,
          header: () => <p className="column-title">Details</p>,
          cell: ({ row }) => <ShowButton
            resource="classes"
            recordItemId={row.original.id}
            variant="outline"
            size='sm'
          >
            View
          </ShowButton> 
        }
      ],
      [],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      queryOptions: {
        refetchOnWindowFocus: false,
        retry: false,
      },
      filters: {
        permanent: [...subjectFilters, ...teacherFilters, ...searchFilters],
      },
      sorters: {
        initial: [
          { field: "id", order: "desc" },
        ],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />

      <h1 className="page-title">Classes</h1>

      <div className="intro-row">
        <p>Quick access to essential metrics and management tools.</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />

            <Input
              type="text"
              placeholder="Search by name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTeacher}
              onValueChange={setSelectedTeacher}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton resource="classes" />
          </div>
        </div>
      </div>

      <DataTable table={classesTable} />
    </ListView>
  );
};

export default ClassesList;
