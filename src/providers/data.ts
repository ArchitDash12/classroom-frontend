import { BACKEND_BASE_URL } from "@/constants";
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";

if (!BACKEND_BASE_URL) {
  throw new Error(
    "BACKEND_BASE_URL is not configured. Please set VITE_BACKEND_BASE_URL in your .env file"
  );
}

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = "Request failed.";

  try {
    const payLoad = (await response.clone().json()) as {
      message?: string;
      error?: string;
    };

    if (payLoad?.error) message = payLoad.error;
    else if (payLoad?.message) message = payLoad.message;
  } catch {
    try {
      const text = await response.clone().text();
      if (text && text.length < 200 && !text.includes("<html")) message = text;
    } catch {
      // ignore
    }
  }

  return {
    message,
    statusCode: response.status,
  };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters, sorters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = {
        page,
        limit: pageSize,
      };

      if (sorters && sorters.length > 0) {
        params._sort = sorters[0].field;
        params._order = sorters[0].order;
      }

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";
        const value = String(filter.value);

        if (!value || value === "all") return;

        if (field === "search" || field === "q") {
          params.search = value;
          return;
        }

        if (resource === "departments") {
          if (field === "name" || field === "code" || field === "search") {
            params.search = value;
          }
        }

        if (resource === "subjects") {
          if (field === "department" || field === "department.name") {
            params.department = value;
          }
          if (field === "name" || field === "code" || field === "search") {
            params.search = value;
          }
        }

        if (resource === "classes") {
          if (field === "name" || field === "search") params.search = value;
          if (field === "subject" || field === "subject.name" || field === "subjectId") {
            params.subject = value;
          }
          if (field === "teacher" || field === "teacher.name" || field === "teacherId") {
            params.teacher = value;
          }
          if (field === "status") params.status = value;
        }

        if (resource === "users") {
          if (field === "role") params.role = value;
          if (field === "name" || field === "email" || field === "search") {
            params.search = value;
          }
        }
      });

      return params;
    },

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const payLoad: ListResponse = await response.clone().json();
      return payLoad.data ?? [];
    },

    getTotalCount: async (response) => {
      const payLoad: ListResponse = await response.clone().json();
      return Number(payLoad.pagination?.total ?? payLoad.data?.length ?? 0);
    },
  },

  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.json();
      return json.data ?? [];
    },
  },

  update: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json = await response.json();
      return json.data ?? json;
    },
  },

  deleteOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json = await response.json();
      return json.data ?? json;
    },
  },

  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: GetOneResponse = await response.json();
      if (!json?.data) {
        throw {
          message: "Item not found",
          statusCode: 404,
        };
      }
      return json.data;
    },
  },

  custom: {
    getEndpoint: ({ url }) => url,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      return await response.json();
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
  retry: 0,
});

export { dataProvider };
