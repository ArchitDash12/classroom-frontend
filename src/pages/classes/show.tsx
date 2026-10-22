import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClassDetails } from "@/types";
import { useShow } from "@refinedev/core";
import React from "react";
import { AdvancedImage } from "@cloudinary/react";
import { bannerPhoto } from "@/lib/cloudinary";

const ClassesShow = () => {
  const { query } = useShow<ClassDetails>({ resource: "classes" });

  const classDetails = query.data?.data;
  const { isLoading, isError } = query;

  const isValidClass =
    Boolean(classDetails) &&
    typeof classDetails === "object" &&
    !Array.isArray(classDetails) &&
    Boolean((classDetails as ClassDetails).name);

  if (isError || isLoading || !isValidClass) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />

        <p className="state-message">
          {isLoading
            ? "Loading class details..."
            : isError
            ? "Failed to load class details..."
            : "Class details not found"}
        </p>
      </ShowView>
    );
  }

  const {
    name,
    description,
    status,
    capacity,
    bannerUrl,
    bannerCldPubId,
    subject,
    teacher,
  } = classDetails as ClassDetails;

  const department = classDetails.department ?? (classDetails as any).departmnt;

  const teacherName = teacher?.name ?? "Unknown";
  const teachersInitials = (teacherName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
    teachersInitials || "NA",
  )}`;

  const classStatus = status ?? "inactive";

  return (
    <ShowView className="class-view class-show">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {bannerCldPubId && name ? (
          <AdvancedImage
            alt={name || "Class Banner"}
            cldImg={bannerPhoto(bannerCldPubId, name)}
          />
        ) : bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name || "Class Banner"}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        <div className="details-header">
          <div>
            <h1>{name}</h1>
            <p>{description}</p>
          </div>

          <div>
            <Badge variant="outline">{capacity ?? 0} spots</Badge>
            <Badge
              variant={classStatus === "active" ? "default" : "secondary"}
              data-status={classStatus}
            >
              {classStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="details-grid">
          <div className="instructor">
            <p>Instructor</p>
            <div>
              <img src={teacher?.image ?? placeholderUrl} alt={teacherName} />

              <div>
                <p>{teacherName}</p>
                <p>{teacher?.email}</p>
              </div>
            </div>
          </div>

          <div className="department">
            <p>Department</p>

            <div>
              <p>{department?.name ?? "No department assigned"}</p>
              {department?.description && <p>{department.description}</p>}
            </div>
          </div>
        </div>

        <Separator />

        <div className="subject">
          <p>Subject</p>

          <div>
            {subject?.code && <Badge variant="outline">Code {subject.code}</Badge>}
            <p>{subject?.name ?? "No subject assigned"}</p>
            {subject?.description && <p>{subject.description}</p>}
          </div>
        </div>

        <Separator />

        <div className="join">
          <h2>Join Class</h2>

          <ol>
            <li>Ask your teacher for the invite code</li>
            <li>Click on "Join Class" button</li>
            <li>Paste the code and click "join"</li>
          </ol>
        </div>

        <Button size="lg" className="w-full">
          Join Class
        </Button>
      </Card>
    </ShowView>
  );
};

export default ClassesShow;
