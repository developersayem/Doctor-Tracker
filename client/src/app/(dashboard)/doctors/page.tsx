'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Doctor, ApiResponse, PaginationMeta } from '@/types';
import { getDoctorStatusBadgeClass, formatDoctorStatus } from '@/lib/utils';
import DoctorModal from '@/components/doctors/DoctorModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { toast } from 'sonner';

const FILTER_SPECIALTIES: SelectOption[] = [
  { value: '', label: 'All Specialties', icon: 'medical_services' },
  { value: 'Cardiology', label: 'Cardiology', icon: 'favorite' },
  { value: 'Neurology', label: 'Neurology', icon: 'psychology' },
  { value: 'Pediatrics', label: 'Pediatrics', icon: 'child_care' },
  { value: 'Orthopedics', label: 'Orthopedics', icon: 'accessibility_new' },
  { value: 'Oncology', label: 'Oncology', icon: 'biotech' },
  { value: 'General Medicine', label: 'General Medicine', icon: 'health_and_safety' },
  { value: 'Dermatology', label: 'Dermatology', icon: 'dermatology' },
];

const FILTER_STATUSES: SelectOption[] = [
  { value: '', label: 'All Statuses', icon: 'filter_list' },
  { value: 'active', label: 'Active', statusDot: 'active' },
  { value: 'on-leave', label: 'On Leave', statusDot: 'leave' },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query doctors
  const { data: response, isLoading, refetch } = useQuery<{
    data: Doctor[];
    meta: PaginationMeta;
  }>({
    queryKey: ['doctors', page, search, specialization, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (specialization) params.set('specialization', specialization);
      if (status) params.set('status', status);

      const res = await apiClient.get<ApiResponse<Doctor[]>>(
        `/doctors?${params.toString()}`
      );
      return {
        data: res.data.data,
        meta: res.data.meta!,
      };
    },
  });

  const doctors = response?.data || [];
  const meta = response?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleCreate = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/doctors/${doctorToDelete._id}`);
      toast.success(`Physician ${doctorToDelete.name} removed from registry`);
      setDoctorToDelete(null);
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete physician record';
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
            <span className="font-sans text-[10px] uppercase tracking-widest text-primary font-semibold">
              Staffing Registry
            </span>
            <span className="text-outline/40 text-xs">•</span>
            <span className="font-sans text-[11px] text-outline/70 font-medium">
              {meta.total} Active Physicians
            </span>
          </div>
          <h1 className="font-headline text-[1.75rem] sm:text-[2rem] font-extrabold text-on-surface tracking-tighter leading-[1.1]">
            Physician &amp; Clinical Faculty Directory
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            Active attending physician roster, credentials, department
            allocations, and patient load tracking across medical centers.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            <span>Register Physician</span>
          </button>
        </div>
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
            placeholder="Search by physician name or specialty..."
            className="w-full h-10 pl-9 pr-4 bg-surface-container-low/50 border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Specialty Filter */}
          <div className="w-full sm:w-48">
            <CustomSelect
              options={FILTER_SPECIALTIES}
              value={specialization}
              onChange={(val) => {
                setSpecialization(val);
                setPage(1);
              }}
              placeholder="All Specialties"
              buttonClassName="h-10 text-xs bg-surface-container-low/50"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <CustomSelect
              options={FILTER_STATUSES}
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="All Statuses"
              buttonClassName="h-10 text-xs bg-surface-container-low/50"
            />
          </div>

          {(search || specialization || status) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSpecialization('');
                setStatus('');
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-mono text-outline uppercase tracking-wider">
                <th className="py-3 px-4">Physician Name</th>
                <th className="py-3 px-4">Specialty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Patient Load</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-outline text-xs">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Querying physician database...</span>
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-outline text-xs">
                    No physicians found matching your search criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => {
                  const statusBadge = getDoctorStatusBadgeClass(doc.status);
                  const patientCount = doc.patientCount || 0;
                  const maxCap = doc.maxCapacity || 20;
                  const capacityPct = Math.min(
                    100,
                    Math.round((patientCount / maxCap) * 100)
                  ) || 0;

                  return (
                    <tr
                      key={doc._id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/doctors/${doc._id}`}
                              className="font-semibold text-on-surface hover:text-primary transition-colors text-xs block"
                            >
                              {doc.name}
                            </Link>
                            <span className="font-mono text-[11px] text-outline">
                              {doc.yearsOfExperience || 5} yrs experience
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
                          {doc.specialization}
                        </span>
                      </td>



                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide ${statusBadge.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusBadge.dot}`}></span>
                          {formatDoctorStatus(doc.status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="font-bold text-on-surface">
                              {patientCount} pts
                            </span>
                            <span className="text-outline">/{maxCap}</span>
                          </div>
                          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                capacityPct >= 80 ? 'bg-amber-500' : 'bg-primary'
                              }`}
                              style={{ width: `${capacityPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-outline">
                        <div>{doc.contactNumber}</div>
                        <div className="text-[11px] text-outline/80">{doc.email}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-0.5">
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-outline hover:text-primary hover:bg-primary/10 transition-colors"
                            title="View Physician Profile & Patients"
                          >
                            <span className="material-symbols-outlined" style={{fontSize: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400"}}>
                              visibility
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit(doc)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-outline hover:text-secondary hover:bg-secondary/10 transition-colors"
                            title="Edit Credentials"
                          >
                            <span className="material-symbols-outlined" style={{fontSize: '16px', fontVariationSettings: "'FILL' 0, 'wght' 400"}}>
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDoctorToDelete(doc)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-outline hover:text-error hover:bg-error/10 transition-colors"
                            title="Remove Physician"
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
              {doctors.length > 0 ? (meta.page - 1) * limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-bold text-on-surface">
              {Math.min(meta.page * limit, meta.total || 0)}
            </span>{' '}
            of <span className="font-bold text-on-surface">{meta.total || 0}</span>{' '}
            physicians
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

      {/* Doctor Modal */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        doctor={selectedDoctor}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!doctorToDelete}
        title="Remove Physician from Registry?"
        message={`Are you sure you want to remove ${doctorToDelete?.name}? Any assigned patients must be reallocated before department records are archived.`}
        confirmText="Remove Physician"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDoctorToDelete(null)}
      />
    </div>
  );
}
