import { describe, it, expect } from "vitest";
import { buildMongooseQuery, calculatePaginationMeta } from "../../src/utils/queryBuilder.js";

describe("queryBuilder Utility Unit Tests", () => {
  it("should calculate correct default pagination and sorting", () => {
    const result = buildMongooseQuery({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(0);
    expect(result.sort).toEqual({ createdAt: -1 });
  });

  it("should handle custom page and limit with boundaries", () => {
    const result = buildMongooseQuery({ page: 3, limit: 25 });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
    expect(result.skip).toBe(50);
  });

  it("should enforce maximum limit ceiling", () => {
    const result = buildMongooseQuery({ limit: 500 }, { maxLimit: 100 });
    expect(result.limit).toBe(100);
  });

  it("should build regex search queries across whitelisted fields", () => {
    const result = buildMongooseQuery(
      { search: "cardio" },
      { searchFields: ["name", "specialization"] }
    );
    expect(result.filter.$or).toBeDefined();
    expect(result.filter.$or).toHaveLength(2);
    expect(result.filter.$or?.[0]).toEqual({ name: /cardio/i });
    expect(result.filter.$or?.[1]).toEqual({ specialization: /cardio/i });
  });

  it("should build date range query properly", () => {
    const result = buildMongooseQuery({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      dateField: "admissionDate",
    });

    const filterObj = result.filter as Record<string, { $gte?: Date; $lte?: Date }>;
    expect(filterObj.admissionDate).toBeDefined();
    expect(filterObj.admissionDate.$gte).toBeInstanceOf(Date);
    expect(filterObj.admissionDate.$lte).toBeInstanceOf(Date);
  });

  it("should calculate pagination metadata correctly", () => {
    const meta = calculatePaginationMeta(45, 2, 10);
    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.totalDocs).toBe(45);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(true);
  });
});
