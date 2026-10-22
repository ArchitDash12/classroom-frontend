import React, { useEffect, useState } from "react";
import { useOne, useUpdate, useBack } from "@refinedev/core";
import { useParams } from "react-router";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, ArrowLeft, Loader2, Shield, School, GraduationCap } from "lucide-react";
import { User } from "@/types";

export const UsersEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [image, setImage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const back = useBack();
  const { query } = useOne<User>({
    resource: "users",
    id: id || "",
  });
  const { mutate: updateUser, isPending: isUpdating } = useUpdate();

  const user = query.data?.data;
  const isLoading = query.isLoading;

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole((user.role as any) || "student");
      setImage(user.image || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg("Name and Email are required.");
      return;
    }

    setErrorMsg("");
    updateUser(
      {
        resource: "users",
        id: id || "",
        values: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          image: image.trim() || undefined,
        },
      },
      {
        onSuccess: () => back(),
        onError: (err: any) => setErrorMsg(err?.message || "Failed to update user"),
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
          <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
          <p className="text-sm text-muted-foreground">Update profile information and institutional role.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="w-5 h-5 text-primary" />
            Edit Profile
          </CardTitle>
          <CardDescription>Update member details.</CardDescription>
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-emerald-400" />
                        <span>Teacher</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image">Profile Photo URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
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

export default UsersEdit;

