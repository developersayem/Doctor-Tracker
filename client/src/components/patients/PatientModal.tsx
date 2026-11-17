'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { Patient, Doctor, ApiResponse } from '@/types';
import { toast } from 'sonner';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient | null;
  defaultDoctorId?: string;
}

const COMMON_CONDITIONS = [
  'Critical - Cardiac Arrest',
  'Post-Op Observation',
  'Stable - Routine Follow-up',
  'Acute Asthma Exacerbation',
  'Hypertension Stage 2',
  'Type II Diabetes Mellitus',
  'Under Observation - Arrhythmia',
  'Recovered - Pending Discharge',
  'Bacterial Pneumonia',
  'Fracture - Closed Reduction',
];

export default function PatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  defaultDoctorId,
}: PatientModalProps) {
  const isEdit = !!patient;

  const [formData, setFormData] = useState({
    name: '',
    age: 45,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contactNumber: '',
    condition: COMMON_CONDITIONS[2],
    doctorId: defaultDoctorId || '',
    admissionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        condition: patient.condition || COMMON_CONDITIONS[2],
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
        condition: COMMON_CONDITIONS[2],
        doctorId: defaultDoctorId || '',
        admissionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [patient, isOpen, defaultDoctorId]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {isEdit ? 'assignment' : 'person_add'}
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                {isEdit ? 'Update Patient Record' : 'Clinical Patient Intake'}
              </h3>
              <p className="text-xs text-outline">
                {isEdit
                  ? 'Modify clinical condition or assigned physician roster'
                  : 'Register and assign an incoming patient to an attending physician'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eleanor Sterling"
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Age, Gender, Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Age *
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
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Gender *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as 'Male' | 'Female' | 'Other',
                  })
                }
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                placeholder="+1-555-0182"
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Condition & Attending Physician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Clinical Diagnosis / Condition *
              </label>
              <input
                type="text"
                required
                list="conditionList"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                placeholder="Select or enter condition..."
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <datalist id="conditionList">
                {COMMON_CONDITIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Attending Physician *
              </label>
              <select
                required
                value={formData.doctorId}
                onChange={(e) =>
                  setFormData({ ...formData, doctorId: e.target.value })
                }
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {isLoadingDoctors ? (
                  <option>Loading physicians...</option>
                ) : (
                  doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization} • {d.hospital.split(' - ')[0]})
                    </option>
                  ))
                )}
              </select>
            </div>
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
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-secondary hover:bg-primary text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
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
    </div>
  );
}
