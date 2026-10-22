import React, { useState, useEffect } from "react";
import {
  useRefineOptions,
  useActiveAuthProvider,
  useLogout,
  useGetIdentity,
  useNavigation,
} from "@refinedev/core";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import {
  LogOutIcon,
  Search,
  GraduationCap,
  BookOpen,
  Building2,
  User as UserIcon,
  Shield,
  School,
  Loader2,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BACKEND_BASE_URL } from "@/constants";
import { UserIdentity } from "@/providers/auth";

export const Header = () => {
  const { isMobile } = useSidebar();
  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function GlobalSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background/60 hover:bg-accent text-muted-foreground text-xs font-normal transition w-60 sm:w-80 justify-between shadow-xs"
    >
      <div className="flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="truncate">Search classes, subjects, users...</span>
      </div>
      <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">Ctrl</span> K
      </kbd>
    </button>
  );
}

function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: identity } = useGetIdentity<UserIdentity>();
  const isStudent = identity?.role === "student";
  const [results, setResults] = useState<{
    classes: any[];
    subjects: any[];
    departments: any[];
    users: any[];
  }>({ classes: [], subjects: [], departments: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const { show } = useNavigation();

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults({ classes: [], subjects: [], departments: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&userRole=${isStudent ? "student" : ""}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || { classes: [], subjects: [], departments: [], users: [] });
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isStudent]);

  const handleSelect = (resource: string, id: any) => {
    onClose();
    show(resource, id);
  };

  const hasResults =
    results.classes.length > 0 ||
    results.subjects.length > 0 ||
    results.departments.length > 0 ||
    results.users.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Type to search classes, subjects, departments, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 text-sm shadow-none p-0 h-8"
              autoFocus
            />
            {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!searchTerm ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              {isStudent
                ? "Search by class name, subject, department, or member name."
                : "Search by class name, invite code, subject, department, or member name."}
            </p>
          ) : !hasResults && !isSearching ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No matching records found for "{searchTerm}".
            </p>
          ) : null}

          {/* Classes */}
          {results.classes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Classes ({results.classes.length})
              </p>
              <div className="space-y-1">
                {results.classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect("classes", c.id)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted/70 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{c.name}</span>
                      {!isStudent && c.inviteCode && (
                        <span className="text-muted-foreground ml-2 font-mono">Code: {c.inviteCode}</span>
                      )}
                    </div>
                    <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {results.subjects.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Subjects ({results.subjects.length})
              </p>
              <div className="space-y-1">
                {results.subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect("subjects", s.id)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted/70 flex items-center justify-between text-xs transition"
                  >
                    <span className="font-semibold text-foreground">{s.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {s.code}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {results.departments.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Departments ({results.departments.length})
              </p>
              <div className="space-y-1">
                {results.departments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect("departments", d.id)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted/70 flex items-center justify-between text-xs transition"
                  >
                    <span className="font-semibold text-foreground">{d.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {d.code}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Users ({results.users.length})
              </p>
              <div className="space-y-1">
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelect("users", u.id)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted/70 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{u.name}</span>
                      <span className="text-muted-foreground ml-2 text-[11px]">{u.email}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {u.role}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DesktopHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky",
          "top-0",
          "flex",
          "h-16",
          "shrink-0",
          "items-center",
          "border-b",
          "border-border",
          "bg-sidebar",
          "px-4",
          "justify-between",
          "z-40"
        )}
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <GlobalSearchButton onClick={() => setSearchOpen(true)} />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { open, isMobile } = useSidebar();
  const { title } = useRefineOptions();

  return (
    <>
      <header
        className={cn(
          "sticky",
          "top-0",
          "flex",
          "h-14",
          "shrink-0",
          "items-center",
          "gap-2",
          "border-b",
          "border-border",
          "bg-sidebar",
          "px-3",
          "justify-between",
          "z-40"
        )}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground" />
          <h2 className="text-sm font-bold truncate">
            {title?.text && title.text !== "refine Project" ? title.text : "UniManager"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground"
          >
            <Search className="w-4 h-4" />
          </button>
          <ThemeToggle className="h-8 w-8" />
          <UserDropdown />
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: identity } = useGetIdentity<UserIdentity>();

  const name = identity?.name || "Academic User";
  const email = identity?.email || "user@school.edu";
  const role = identity?.role || "student";
  const avatar = identity?.avatar;

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-full hover:bg-accent outline-none">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-border">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
            <div className="pt-1">
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                {role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOutIcon className="w-4 h-4 mr-2" />
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Header.displayName = "Header";
