import { FilterQuery } from "mongoose";

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | 1 | -1;
}

export interface DateFilterParams {
  startDate?: string;
  endDate?: string;
  dateField?: string;
}

export interface SearchFilterParams extends PaginationParams, DateFilterParams {
  search?: string;
  [key: string]: unknown;
}

export interface QueryBuilderResult<T> {
  filter: FilterQuery<T>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
  page: number;
}

/**
 * Builds clean, indexed Mongoose query filters, sorting, and pagination options
 * from raw HTTP query parameters.
 */
export const buildMongooseQuery = <T>(
  queryParams: SearchFilterParams,
  options: {
    searchFields?: (keyof T | string)[];
    allowedFilters?: (keyof T | string)[];
    defaultSortBy?: string;
    defaultSortOrder?: "asc" | "desc";
    defaultLimit?: number;
    maxLimit?: number;
  } = {}
): QueryBuilderResult<T> => {
  const {
    searchFields = [],
    allowedFilters = [],
    defaultSortBy = "createdAt",
    defaultSortOrder = "desc",
    defaultLimit = 10,
    maxLimit = 100,
  } = options;

  // 1. Pagination calculation
  const parsedPage = Math.max(1, parseInt(String(queryParams.page || 1), 10) || 1);
  const rawLimit = parseInt(String(queryParams.limit || defaultLimit), 10) || defaultLimit;
  const parsedLimit = Math.min(Math.max(1, rawLimit), maxLimit);
  const skip = (parsedPage - 1) * parsedLimit;

  // 2. Sorting options
  const sortBy = String(queryParams.sortBy || defaultSortBy);
  const sortDirection = String(queryParams.sortOrder || defaultSortOrder).toLowerCase() === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortDirection };

  // 3. Filter assembly
  const filter: FilterQuery<T> = {};

  // 3a. Multi-field text search via Regex or Text index
  if (queryParams.search && typeof queryParams.search === "string" && queryParams.search.trim().length > 0) {
    const searchTerm = queryParams.search.trim();

    if (searchFields.length > 0) {
      // Regex query across specified fields
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedTerm, "i");
      filter.$or = searchFields.map((field) => ({
        [field]: searchRegex,
      })) as FilterQuery<T>["$or"];
    }
  }

  // 3b. Date Range Filtering
  const dateField = queryParams.dateField || "createdAt";
  if (queryParams.startDate || queryParams.endDate) {
    const dateRange: Record<string, Date> = {};

    if (queryParams.startDate) {
      const start = new Date(queryParams.startDate);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        dateRange.$gte = start;
      }
    }

    if (queryParams.endDate) {
      const end = new Date(queryParams.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        dateRange.$lte = end;
      }
    }

    if (Object.keys(dateRange).length > 0) {
      (filter as Record<string, unknown>)[dateField] = dateRange;
    }
  }

  // 3c. Exact matching for whitelisted filter fields
  for (const filterKey of allowedFilters) {
    const key = String(filterKey);
    const value = queryParams[key];

    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      (filter as Record<string, unknown>)[key] = value;
    }
  }

  return {
    filter,
    sort,
    skip,
    limit: parsedLimit,
    page: parsedPage,
  };
};

/**
 * Calculates standardized pagination metadata based on total document count.
 */
export const calculatePaginationMeta = (totalDocs: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalDocs / limit) || 1;
  return {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
