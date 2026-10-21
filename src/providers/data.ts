import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";
import { BaseRecord, DataProvider, GetListParams, GetListResponse } from "@refinedev/core";
import { Subject } from "@/types";

export const mockSubjects: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "CS",
    description: "An introduction to programming, algorithms, and computational thinking.",
    createdAt: new Date("2026-01-15"),
  },
  {
    id: 2,
    code: "MATH201",
    name: "Linear Algebra",
    department: "Math",
    description: "Study of vectors, matrices, linear transformations, and their applications.",
    createdAt: new Date("2026-01-15"),
  },
  {
    id: 3,
    code: "ENGL110",
    name: "Academic Writing",
    department: "English",
    description: "Practice in clear academic writing, research, revision, and critical analysis.",
    createdAt: new Date("2026-01-15"),
  },
];

export const { kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
});

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({ resource }: GetListParams): Promise<GetListResponse<TData>> => {
    if(resource !== 'subjects'){
      return { data: [] as TData[], total: 0};
    }

    return {
      data: mockSubjects as unknown as TData[],
      total: mockSubjects.length,
    }
  },

  getOne: async () => {throw new Error('This function is not present in mock')},
  create: async () => {throw new Error('This function is not present in mock')},
  update: async () => {throw new Error('This function is not present in mock')},
  deleteOne: async () => {throw new Error('This function is not present in mock')},

  getApiUrl: () => '',
}
