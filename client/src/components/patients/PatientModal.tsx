'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '@/lib/axios';
import { Patient, Doctor, ApiResponse } from '@/types';
import { toast } from 'sonner';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient | null;
  defaultDoctorId?: string;
}

const COMMON_CONDITIONS: SelectOption[] = [
  { value: 'Critical - Cardiac Arrest', label: 'Critical - Cardiac Arrest', statusDot: 'critical', badge: 'Critical' },
  { value: 'Acute Asthma Exacerbation', label: 'Acute Asthma Exacerbation', statusDot: 'critical', badge: 'Critical' },
  { value: 'Post-Op Observation', label: 'Post-Op Observation', statusDot: 'observation', badge: 'Observ.' },
  { value: 'Under Observation - Arrhythmia', label: 'Under Observation - Arrhythmia', statusDot: 'observation', badge: 'Observ.' },
  { value: 'Stable - Routine Follow-up', label: 'Stable - Routine Follow-up', statusDot: 'stable', badge: 'Stable' },
  { value: 'Hypertension Stage 2', label: 'Hypertension Stage 2', statusDot: 'stable', badge: 'Stable' },
  { value: 'Type II Diabetes Mellitus', label: 'Type II Diabetes Mellitus', statusDot: 'stable', badge: 'Stable' },
  { value: 'Bacterial Pneumonia', label: 'Bacterial Pneumonia', statusDot: 'stable', badge: 'Stable' },
  { value: 'Fracture - Closed Reduction', label: 'Fracture - Closed Reduction', statusDot: 'stable', badge: 'Stable' },
  { value: 'Recovered - Pending Discharge', label: 'Recovered - Pending Discharge', statusDot: 'active', badge: 'Discharge' },
];

const GENDER_OPTIONS: SelectOption[] = [
  { value: 'Male', label: 'Male', icon: 'male' },
  { value: 'Female', label: 'Female', icon: 'female' },
  { value: 'Other', label: 'Other', icon: 'person' },
];

export default function PatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  defaultDoctorId,
}: PatientModalProps) {
  const isEdit = !!patient;
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: 45,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contactNumber: '',
    condition: 'Stable - Routine Follow-up',
    doctorId: defaultDoctorId || '',
    admissionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch available doctors for the dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
          const res = await apiClient.get<ApiResponse<Doctor[]>>('/doctors?limit=50&status=Active');
          setDoctors(res.data.data);
          if (!formData.doctorId && res.data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              doctorId: defaultDoctorId || res.data.data[0]._id,
            }));
          }
        } catch {
          // ignore error
        } finally {
          setIsLoadingDoctors(false);
        }
      };
      fetchDoctors();
    }
  }, [isOpen, defaultDoctorId]);

  useEffect(() => {
    if (patient) {
      const docId =
        typeof patient.doctorId === 'object'
          ? (patient.doctorId as Doctor)._id
          : patient.doctorId;

      setFormData({
        name: patient.name || '',
        age: patient.age || 45,
        gender: patient.gender || 'Male',
        contactNumber: patient.contactNumber || '',
        condition: patient.condition || 'Stable - Routine Follow-up',
        doctorId: docId || '',
        admissionDate: patient.admissionDate
          ? new Date(patient.admissionDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: patient.notes || '',
      });
    } else {
      setFormData({
        name: '',
        age: 45,
        gender: 'Male',
        contactNumber: '',
        condition: 'Stable - Routine Follow-up',
        doctorId: defaultDoctorId || '',
        admissionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [patient, isOpen, defaultDoctorId]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorId) {
      toast.error('Please assign an attending physician to the patient');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && patient) {
        await apiClient.put<ApiResponse<Patient>>(`/patients/${patient._id}`, formData);
        toast.success(`Patient record for ${formData.name} updated successfully`);
      } else {
        await apiClient.post<ApiResponse<Patient>>('/patients', formData);
        toast.success(`Patient ${formData.name} admitted successfully`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save patient intake record';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctorOptions: SelectOption[] = doctors.map((d) => ({
    value: d._id,
    label: d.name,
    description: `${d.specialization} • ${d.hospital.split(' - ')[0]}`,
    icon: 'stethoscope',
    badge: d.status === 'Active' ? 'On Duty' : d.status,
    statusDot: d.status === 'Active' ? 'active' : 'leave',
  }));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {isEdit ? 'clinical_notes' : 'patient_list'}
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                {isEdit ? 'Edit Patient Clinical Intake' : 'Register Patient Admission'}
              </h3>
              <p className="text-xs text-outline">
                {isEdit
                  ? 'Update electronic health record and assigned physician'
                  : 'Enroll a patient into the clinical monitoring telemetry'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Age, Gender, Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={130}
                required
                value={formData.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <CustomSelect
              label="Gender"
              required
              options={GENDER_OPTIONS}
              value={formData.gender}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  gender: val as 'Male' | 'Female' | 'Other',
                })
              }
              placeholder="Select gender..."
              icon="wc"
            />

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                placeholder="+1-555-0182"
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Condition & Attending Physician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Clinical Condition / Diagnosis"
              required
              options={COMMON_CONDITIONS}
              value={formData.condition}
              onChange={(val) => setFormData({ ...formData, condition: val })}
              searchable
              placeholder="Select diagnosis..."
              icon="vital_signs"
            />

            <CustomSelect
              label="Attending Physician"
              required
              options={isLoadingDoctors ? [{ value: '', label: 'Loading physicians...' }] : doctorOptions}
              value={formData.doctorId}
              onChange={(val) => setFormData({ ...formData, doctorId: val })}
              searchable
              placeholder={isLoadingDoctors ? 'Loading physicians...' : 'Select attending physician...'}
              icon="stethoscope"
              disabled={isLoadingDoctors}
            />
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Admission Date
            </label>
            <input
              type="date"
              value={formData.admissionDate}
              onChange={(e) =>
                setFormData({ ...formData, admissionDate: e.target.value })
              }
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Clinical Notes / Treatment Plan
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Admission notes, vital stats observations, medications prescribed..."
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving Intake...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  <span>{isEdit ? 'Update Record' : 'Confirm Intake'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
