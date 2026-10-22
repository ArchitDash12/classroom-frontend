import { BACKEND_BASE_URL } from "@/constants";
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";

if(!BACKEND_BASE_URL){
  throw new Error('BACKEND_BASE_URL is not configured. Please set VITE_BACKEND_BASE_URL in your .env file');
}

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = 'Request failed.';

  try{
    const payLoad = (await response.clone().json()) as { message?: string; error?: string };

    if(payLoad?.message) message = payLoad.message;
    else if(payLoad?.error) message = payLoad.error;
  }
  catch{
    try {
      const text = await response.clone().text();
      if (text && text.length < 150 && !text.includes('<html')) message = text;
    } catch {
      // ignore
    }
  }

  return {
    message,
    statusCode: response.status
  };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string|number> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';

        const value = String(filter.value);

        if(resource === 'subjects') {
          if(field === 'department') params.department = value;
          if(field === 'name' || field === 'code') params.search = value;
        }

        if(resource === 'classes') {
          if((field === 'name' || field === 'search') && value) params.search = value;
          if((field === 'subject' || field === 'subject.name') && value && value !== 'all') params.subject = value;
          if((field === 'teacher' || field === 'teacher.name') && value && value !== 'all') params.teacher = value;
        }

        if(resource === 'users') {
          if(field === 'role' && value) params.role = value;
          if((field === 'name' || field === 'email') && value) params.search = value;
        }
      });

      return params;
    },

    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);

      const payLoad: ListResponse = await response.clone().json();

      return payLoad.data ?? [];
    },

    getTotalCount: async (response) => {
      const payLoad: ListResponse = await response.clone().json();

      return Number(payLoad.pagination?.total ?? payLoad.data?.length ?? 0);
    }
  },

  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);

      const json: CreateResponse = await response.json();

      return json.data ?? [];
    }
  },

  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);

      const json: GetOneResponse = await response.json();

      if (!json?.data) {
        throw {
          message: 'Item not found',
          statusCode: 404
        };
      }

      return json.data;
    }
  }
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
  retry: 0,
});

export { dataProvider };
