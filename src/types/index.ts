export type Department = {
  id: number;
  code: string;
  name: string;
  description: string;
  subjectCount?: number;
  classCount?: number;
  createdAt?: string;
  updatedAt?: string;
  subjects?: Subject[];
};

export type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  departmentId?: number;
  department?: Department | { id: number; name: string; code: string; description?: string };
  classCount?: number;
  classes?: ClassDetails[];
  createdAt?: string;
  updatedAt?: string;
};

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export type User = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  email: string;
  name: string;
  role: UserRole | "student" | "teacher" | "admin";
  image?: string;
  imageCldPubId?: string;
  taughtClasses?: ClassDetails[];
  enrolledClasses?: ClassDetails[];
};

export type Schedule = {
  day: string;
  startTime: string;
  endTime: string;
};

export type ClassDetails = {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive" | "archived";
  capacity: number;
  inviteCode?: string;
  bannerUrl?: string;
  bannerCldPubId?: string;
  subjectId?: number;
  teacherId?: string;
  subject?: Subject;
  teacher?: User;
  department?: Department;
  schedules: Schedule[];
  enrolledCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type EnrollmentStudent = {
  enrollmentId: number;
  enrolledAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
};

export type DashboardStats = {
  metrics: {
    totalUsers: number;
    studentsCount: number;
    teachersCount: number;
    adminsCount: number;
    totalDepartments: number;
    totalSubjects: number;
    totalClasses: number;
    activeClasses: number;
    totalCapacity: number;
    totalEnrollments: number;
    avgFillRate: number;
  };
  charts: {
    enrollmentTrends: { date: string; rawDate: string; enrollments: number }[];
    classesByDepartment: { name: string; code: string; classesCount: number; subjectsCount: number }[];
    capacityStatus: { name: string; value: number; fill: string }[];
    userDistribution: { name: string; value: number; fill: string }[];
  };
  capacityWarnings: Array<{
    id: number;
    name: string;
    capacity: number;
    enrolledCount: number;
    fillPercentage: number;
    warningLevel: "warning" | "critical";
    label: string;
    inviteCode?: string;
    subjectName?: string;
  }>;
  activityFeed: Array<{
    id: string;
    title: string;
    subtitle?: string;
    timestamp: string;
    type: "enrollment" | "class_created" | "user_joined";
    avatar?: string;
  }>;
};

export type ListResponse<T = unknown> = {
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateResponse<T = unknown> = {
  data?: T;
};

export type GetOneResponse<T = unknown> = {
  data?: T;
};

declare global {
  interface CloudinaryUploadWidgetResults {
    event: string;
    info: {
      secure_url: string;
      public_id: string;
      delete_token?: string;
      resource_type: string;
      original_filename: string;
    };
  }

  interface CloudinaryWidget {
    open: () => void;
  }

  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: unknown,
          result: CloudinaryUploadWidgetResults
        ) => void
      ) => CloudinaryWidget;
    };
  }
}

export interface UploadWidgetValue {
  url: string;
  publicId: string;
}

export interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
}
