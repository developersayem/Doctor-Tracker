import { Doctor } from "../models/Doctor.model.js";
import { Patient } from "../models/Patient.model.js";

export interface DashboardMetrics {
  kpis: {
    totalDoctors: number;
    activeDoctors: number;
    totalPatients: number;
    criticalPatients: number;
    stablePatients: number;
    underObservationPatients: number;
    recoveredPatients: number;
    avgPatientsPerDoctor: number;
  };
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }>;
  conditionDistribution: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  specializationDistribution: Array<{
    specialization: string;
    doctorCount: number;
  }>;
  admissionTrends: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Service: Generates high-performance dashboard analytics using MongoDB
 * $facet multi-pipeline aggregation.
 * Executes in a single database round-trip per collection, preventing N+1 queries.
 */
export const getDashboardAnalytics = async (): Promise<DashboardMetrics> => {
  // 1. Patient Pipeline with $facet
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [patientStats] = await Patient.aggregate([
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        conditionBreakdown: [
          {
            $group: {
              _id: "$condition",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        admissionTrends: [
          {
            $match: {
              admissionDate: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              count: 1,
            },
          },
        ],
      },
    },
  ]);

  // 2. Doctor Pipeline with $facet
  const [doctorStats] = await Doctor.aggregate([
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        activeCount: [
          { $match: { status: "active" } },
          { $count: "count" },
        ],
        specializationBreakdown: [
          {
            $group: {
              _id: "$specialization",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              specialization: "$_id",
              doctorCount: "$count",
            },
          },
        ],
        topWorkloads: [
          {
            $lookup: {
              from: "patients",
              localField: "_id",
              foreignField: "doctorId",
              as: "patientRoster",
            },
          },
          {
            $project: {
              _id: 0,
              doctorId: "$_id",
              doctorName: "$name",
              specialization: "$specialization",
              hospital: "$hospital",
              patientCount: { $size: "$patientRoster" },
            },
          },
          { $sort: { patientCount: -1 } },
          { $limit: 10 },
        ],
      },
    },
  ]);

  // Extract totals and counts safely
  const totalDoctors = doctorStats?.totalCount?.[0]?.count || 0;
  const activeDoctors = doctorStats?.activeCount?.[0]?.count || 0;
  const totalPatients = patientStats?.totalCount?.[0]?.count || 0;

  // Process condition distribution with calculated percentages
  const conditions = ["Critical", "Stable", "Under Observation", "Recovered"];
  const rawConditionMap: Record<string, number> = {};

  (patientStats?.conditionBreakdown || []).forEach(
    (item: { _id: string; count: number }) => {
      rawConditionMap[item._id] = item.count;
    }
  );

  const conditionDistribution = conditions.map((cond) => {
    const count = rawConditionMap[cond] || 0;
    const percentage = totalPatients > 0 ? Number(((count / totalPatients) * 100).toFixed(1)) : 0;
    return {
      condition: cond,
      count,
      percentage,
    };
  });

  const criticalPatients = rawConditionMap["Critical"] || 0;
  const stablePatients = rawConditionMap["Stable"] || 0;
  const underObservationPatients = rawConditionMap["Under Observation"] || 0;
  const recoveredPatients = rawConditionMap["Recovered"] || 0;

  const avgPatientsPerDoctor =
    activeDoctors > 0 ? Number((totalPatients / activeDoctors).toFixed(1)) : 0;

  return {
    kpis: {
      totalDoctors,
      activeDoctors,
      totalPatients,
      criticalPatients,
      stablePatients,
      underObservationPatients,
      recoveredPatients,
      avgPatientsPerDoctor,
    },
    patientsPerDoctor: doctorStats?.topWorkloads || [],
    conditionDistribution,
    specializationDistribution: doctorStats?.specializationBreakdown || [],
    admissionTrends: patientStats?.admissionTrends || [],
  };
};
