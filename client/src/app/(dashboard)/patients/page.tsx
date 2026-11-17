'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Patient, Doctor, ApiResponse, PaginationMeta } from '@/types';
import { formatDate, getConditionBadge } from '@/lib/utils';
import PatientModal from '@/components/patients/PatientModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { toast } from 'sonner';

const CONDITION_TABS = [
  { label: 'All Patients', value: '' },
  { label: 'Critical / Acute', value: 'Critical' },
  { label: 'Under Observation', value: 'Under Observation' },
  { label: 'Stable', value: 'Stable' },
  { label: 'Recovered', value: 'Recovered' },
];

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [selectedConditionTab, setSelectedConditionTab] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch doctors for filter dropdown
  const { data: doctorsRes } = useQuery<ApiResponse<Doctor[]>>({
    queryKey: ['doctors-list-filter'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Doctor[]>>('/doctors?limit=100');
      return res.data;
    },
  });

  const doctorsList = doctorsRes?.data || [];

  // Query patients
  const { data: response, isLoading, refetch } = useQuery<{
    data: Patient[];
    meta: PaginationMeta;
  }>({
    queryKey: ['patients', page, search, selectedConditionTab, selectedDoctorId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (selectedConditionTab) params.set('condition', selectedConditionTab);
      if (selectedDoctorId) params.set('doctorId', selectedDoctorId);

      const res = await apiClient.get<ApiResponse<Patient[]>>(
        `/patients?${params.toString()}`
      );
      return {
        data: res.data.data,
        meta: res.data.meta!,
      };
    },
  });

  const patients = response?.data || [];
  const meta = response?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (p: Patient) => {
    setSelectedPatient(p);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/patients/${patientToDelete._id}`);
      toast.success(`Patient record for ${patientToDelete.name} discharged`);
      setPatientToDelete(null);
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to remove patient record';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-semibold">
              Inpatient &amp; Clinic Census
            </span>
            <span className="text-outline/40 text-xs">•</span>
            <span className="font-sans text-[11px] text-outline/70 font-medium">
              {meta.total} Registered Encounters
            </span>
          </div>
          <h1 className="font-headline text-[1.75rem] sm:text-[2rem] font-extrabold text-on-surface tracking-tighter leading-[1.1]">
            Central Patient Registry
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            Real-time encounter stream, diagnostic triage categories, and
            attending physician assignment across hospital facilities.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-primary text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            <span>Intake New Patient</span>
          </button>
        </div>
      </div>

      {/* Condition Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CONDITION_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setSelectedConditionTab(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedConditionTab === tab.value
                ? 'bg-secondary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search patient name, contact number, or condition..."
            className="w-full h-10 pl-9 pr-4 bg-surface-container-low/50 border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Attending Physician Dropdown Filter */}
          <div className="w-full sm:w-64">
            <CustomSelect
              options={[
                { value: '', label: 'All Attending Physicians', icon: 'stethoscope' },
                ...doctorsList.map((d) => ({
                  value: d._id,
                  label: d.name,
                  description: d.specialization,
                  icon: 'stethoscope',
                })),
              ]}
              value={selectedDoctorId}
              onChange={(val) => {
                setSelectedDoctorId(val);
                setPage(1);
              }}
              searchable
              placeholder="All Physicians"
              buttonClassName="h-10 text-xs bg-surface-container-low/50"
            />
          </div>

          {(search || selectedConditionTab || selectedDoctorId) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedConditionTab('');
                setSelectedDoctorId('');
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-mono text-outline uppercase tracking-wider">
                <th className="py-3 px-4">Patient / Demographics</th>
                <th className="py-3 px-4">Clinical Diagnosis</th>
                <th className="py-3 px-4">Attending Physician</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-outline text-xs">
                    <div className="w-6 h-6 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Loading patient encounters...</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-outline text-xs">
                    No patient records found matching your filters.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const badge = getConditionBadge(patient.condition);
                  const doc =
                    typeof patient.doctorId === 'object'
                      ? (patient.doctorId as Doctor)
                      : null;

                  return (
                    <tr
                      key={patient._id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center font-bold text-secondary text-xs shrink-0">
                            {patient.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface text-xs block">
                              {patient.name}
                            </span>
                            <span className="font-mono text-[11px] text-outline">
                              {patient.age} yrs • {patient.gender} • MRN-{patient._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${badge.pill}`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot}`}></span>
                          {patient.condition}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {doc ? (
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="group flex flex-col"
                          >
                            <span className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                              {doc.name}
                            </span>
                            <span className="text-[11px] text-outline">
                              {doc.specialization}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-xs text-outline italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-outline">
                        {formatDate(patient.admissionDate)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-outline">
                        {patient.contactNumber}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(patient)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-outline hover:text-secondary hover:bg-secondary/10 transition-colors"
                            title="Edit Record"
                          >
                            <span className="material-symbols-outlined" style={{fontSize: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400"}}>
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPatientToDelete(patient)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-outline hover:text-error hover:bg-error/10 transition-colors"
                            title="Remove Patient"
                          >
                            <span className="material-symbols-outlined" style={{fontSize: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400"}}>
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-outline">
          <div>
            Showing{' '}
            <span className="font-bold text-on-surface">
              {patients.length > 0 ? (meta.page - 1) * limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-bold text-on-surface">
              {Math.min(meta.page * limit, meta.total || 0)}
            </span>{' '}
            of <span className="font-bold text-on-surface">{meta.total || 0}</span>{' '}
            encounters
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container text-on-surface disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="font-mono text-on-surface font-semibold px-2">
              Page {meta.page} of {meta.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!meta.hasNextPage}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container text-on-surface disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        patient={selectedPatient}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!patientToDelete}
        title="Discharge Patient Record?"
        message={`Are you sure you want to discharge and archive the medical encounter for ${patientToDelete?.name}?`}
        confirmText="Confirm Discharge"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
}
