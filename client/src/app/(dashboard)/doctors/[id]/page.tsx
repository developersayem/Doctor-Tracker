'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Doctor, Patient, ApiResponse } from '@/types';
import {
  formatDate,
  getConditionBadgeClass,
  getDoctorStatusBadgeClass,
} from '@/lib/utils';
import DoctorModal from '@/components/doctors/DoctorModal';
import PatientModal from '@/components/patients/PatientModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);

  // Fetch Doctor details
  const {
    data: doctorRes,
    isLoading: isDoctorLoading,
    refetch: refetchDoctor,
  } = useQuery<ApiResponse<Doctor>>({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch Patients assigned to this doctor
  const {
    data: patientsRes,
    isLoading: isPatientsLoading,
    refetch: refetchPatients,
  } = useQuery<ApiResponse<Patient[]>>({
    queryKey: ['doctor-patients', id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Patient[]>>(
        `/patients?doctorId=${id}&limit=100`
      );
      return res.data;
    },
    enabled: !!id,
  });

  const doctor = doctorRes?.data;
  const patients = patientsRes?.data || [];

  const handleEditPatient = (pat: Patient) => {
    setSelectedPatient(pat);
    setIsPatientModalOpen(true);
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setIsPatientModalOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    setIsDeletingPatient(true);
    try {
      await apiClient.delete(`/patients/${patientToDelete._id}`);
      toast.success(`Patient ${patientToDelete.name} discharge/removal confirmed`);
      setPatientToDelete(null);
      refetchPatients();
      refetchDoctor();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to remove patient record';
      toast.error(msg);
    } finally {
      setIsDeletingPatient(false);
    }
  };

  if (isDoctorLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-mono text-outline">
          Loading clinical faculty file...
        </span>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-on-surface">Physician Not Found</h2>
        <p className="text-xs text-outline mt-1 mb-4">
          The requested physician record does not exist or has been archived.
        </p>
        <Link
          href="/doctors"
          className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const statusBadge = getDoctorStatusBadgeClass(doctor.status);
  const patientCount = patients.length || 0;
  const maxCap = doctor.maxCapacity || 20;
  const capacityPct = Math.min(
    100,
    Math.round((patientCount / maxCap) * 100)
  ) || 0;

  const criticalCount = patients.filter((p) =>
    p.condition.toLowerCase().includes('critical')
  ).length;

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-outline hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          <span>Back to Physicians</span>
        </button>
      </div>

      {/* Doctor Profile Bento Hero */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row justify-between gap-6 items-start">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-headline text-2xl font-bold text-primary shadow-sm shrink-0">
            {doctor.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline text-2xl font-bold text-on-surface">
                {doctor.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${statusBadge.bg}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                ></span>
                <span>{doctor.status}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-medium">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                {doctor.specialization}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">
                  domain
                </span>
                {doctor.hospital}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">
                  medical_services
                </span>
                {doctor.yearsOfExperience || 5} Years Experience
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-outline pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">call</span>
                {doctor.contactNumber}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                {doctor.email}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                Admitted {formatDate(doctor.createdAt)}
              </span>
            </div>

            {doctor.bio && (
              <p className="text-xs text-on-surface-variant leading-relaxed pt-2 max-w-2xl italic">
                &ldquo;{doctor.bio}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCreatePatient}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            <span>Intake Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditDoctorOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-2 border border-outline-variant/30 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              edit
            </span>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Assigned Patients
            </span>
            <div className="font-headline text-2xl font-bold text-on-surface mt-1">
              {patientCount}{' '}
              <span className="text-xs font-normal text-outline">
                / {maxCap} cap
              </span>
            </div>
            <div className="w-32 bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${capacityPct}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              vital_signs
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Critical Cases
            </span>
            <div className="font-headline text-2xl font-bold text-error mt-1">
              {criticalCount}
            </div>
            <span className="text-[11px] text-outline mt-1 block">
              High attention required
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container/40 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              emergency
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Capacity Utilization
            </span>
            <div className="font-headline text-2xl font-bold text-on-surface mt-1">
              {capacityPct}%
            </div>
            <span className="text-[11px] text-outline mt-1 block">
              {Math.max(0, maxCap - patientCount)} slots remaining
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              density_medium
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Clinical Roster
            </span>
            <div className="font-headline text-2xl font-bold text-primary mt-1">
              {doctor.status === 'Active' ? 'Available' : 'Restricted'}
            </div>
            <span className="text-[11px] text-outline mt-1 block">
              Verified License
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              verified
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Patients Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Assigned Patients Roster
            </h2>
            <span className="text-xs text-outline">
              Active patient encounters and ongoing clinical care tracking
            </span>
          </div>
          <button
            type="button"
            onClick={handleCreatePatient}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Assign Patient</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-mono text-outline uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">Patient Name</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Clinical Diagnosis</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {isPatientsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-outline text-xs">
                    Loading assigned patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-outline text-xs">
                    <p className="font-semibold text-on-surface mb-1">
                      No patients currently assigned to {doctor.name}.
                    </p>
                    <p className="text-outline text-xs mb-3">
                      Use the button below to intake and assign a patient to this physician.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreatePatient}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        person_add
                      </span>
                      <span>Assign First Patient</span>
                    </button>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const badge = getConditionBadgeClass(patient.condition);
                  return (
                    <tr
                      key={patient._id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center font-bold text-secondary text-xs shrink-0">
                            {patient.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface text-xs block">
                              {patient.name}
                            </span>
                            <span className="font-mono text-[11px] text-outline">
                              MRN-{patient._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                        {patient.age} yrs • {patient.gender}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs ${badge.bg}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                          ></span>
                          <span>{patient.condition}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-outline">
                        {formatDate(patient.admissionDate)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-outline">
                        {patient.contactNumber}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditPatient(patient)}
                            className="p-1.5 text-outline hover:text-secondary hover:bg-surface-container rounded-md transition-colors"
                            title="Edit Record"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPatientToDelete(patient)}
                            className="p-1.5 text-outline hover:text-error hover:bg-error-container/30 rounded-md transition-colors"
                            title="Discharge / Remove"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Doctor Modal */}
      <DoctorModal
        isOpen={isEditDoctorOpen}
        onClose={() => setIsEditDoctorOpen(false)}
        onSuccess={() => refetchDoctor()}
        doctor={doctor}
      />

      {/* Patient Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          refetchPatients();
          refetchDoctor();
        }}
        patient={selectedPatient}
        defaultDoctorId={doctor._id}
      />

      {/* Confirm Delete Patient Dialog */}
      <ConfirmDialog
        isOpen={!!patientToDelete}
        title="Discharge or Remove Patient Record?"
        message={`Are you sure you want to remove ${patientToDelete?.name}? This will archive their admission encounter record.`}
        confirmText="Confirm Discharge"
        isLoading={isDeletingPatient}
        onConfirm={confirmDeletePatient}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
}
