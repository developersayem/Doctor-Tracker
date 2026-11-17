'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '@/lib/axios';
import { Doctor, ApiResponse } from '@/types';
import { toast } from 'sonner';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor?: Doctor | null;
}

const SPECIALTY_OPTIONS: SelectOption[] = [
  { value: 'Cardiology', label: 'Cardiology', icon: 'favorite', description: 'Cardiovascular Care' },
  { value: 'Neurology', label: 'Neurology', icon: 'psychology', description: 'Neuroscience & Brain Care' },
  { value: 'Pediatrics', label: 'Pediatrics', icon: 'child_care', description: 'Neonatal & Child Health' },
  { value: 'Orthopedics', label: 'Orthopedics', icon: 'accessibility_new', description: 'Musculoskeletal Surgery' },
  { value: 'Oncology', label: 'Oncology', icon: 'biotech', description: 'Cancer Center of Excellence' },
  { value: 'General Medicine', label: 'General Medicine', icon: 'health_and_safety', description: 'Internal & Preventative Care' },
  { value: 'Dermatology', label: 'Dermatology', icon: 'dermatology', description: 'Clinical Dermatology' },
  { value: 'Psychiatry', label: 'Psychiatry', icon: 'mood', description: 'Behavioral & Mental Health' },
  { value: 'Endocrinology', label: 'Endocrinology', icon: 'vital_signs', description: 'Glandular & Metabolic Care' },
  { value: 'Pulmonology', label: 'Pulmonology', icon: 'air', description: 'Respiratory Care Unit' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active', statusDot: 'active', description: 'On Duty • Receiving Patients' },
  { value: 'on-leave', label: 'On Leave', statusDot: 'leave', description: 'Temporary Absence' },
];

export default function DoctorModal({
  isOpen,
  onClose,
  onSuccess,
  doctor,
}: DoctorModalProps) {
  const isEdit = !!doctor;
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Cardiology',
    contactNumber: '',
    email: '',
    status: 'active' as 'active' | 'on-leave',
    maxCapacity: 20,
    yearsOfExperience: 5,
    bio: '',
  });

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

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialization: doctor.specialization || 'Cardiology',
        contactNumber: doctor.contactNumber || '',
        email: doctor.email || '',
        status: doctor.status || 'active',
        maxCapacity: doctor.maxCapacity || 20,
        yearsOfExperience: doctor.yearsOfExperience || 5,
        bio: doctor.bio || '',
      });
    } else {
      setFormData({
        name: '',
        specialization: 'Cardiology',
        contactNumber: '',
        email: '',
        status: 'active',
        maxCapacity: 20,
        yearsOfExperience: 5,
        bio: '',
      });
    }
  }, [doctor, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit && doctor) {
        await apiClient.put<ApiResponse<Doctor>>(`/doctors/${doctor._id}`, formData);
        toast.success(`Physician record for ${formData.name} updated successfully`);
      } else {
        await apiClient.post<ApiResponse<Doctor>>('/doctors', formData);
        toast.success(`Physician ${formData.name} registered to medical directory`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save physician record';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {isEdit ? 'edit_note' : 'person_add'}
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                {isEdit ? 'Edit Physician Credentials' : 'Register New Physician'}
              </h3>
              <p className="text-xs text-outline">
                {isEdit
                  ? 'Update medical credentialing and department allocation'
                  : 'Add an attending physician to the hospital administrative roster'}
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
          {/* Full Name & Title */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Physician Full Name & Degree <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Marcus Vance, MD"
              className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Medical Specialty */}
          <div>
            <CustomSelect
              label="Medical Specialty"
              required
              options={SPECIALTY_OPTIONS}
              value={formData.specialization}
              onChange={(val) => setFormData({ ...formData, specialization: val })}
              searchable
              placeholder="Select specialty..."
              icon="medical_services"
            />
          </div>

          {/* Email & Contact Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@hospital.org"
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                placeholder="+1-555-0192"
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Status, Max Capacity, Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomSelect
              label="Active Status"
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  status: val as 'active' | 'on-leave',
                })
              }
              placeholder="Select status..."
              icon="wifi_tethering"
            />

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Patient Capacity
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={Number.isNaN(formData.maxCapacity) ? '' : formData.maxCapacity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData({
                    ...formData,
                    maxCapacity: Number.isNaN(val) ? 1 : val,
                  });
                }}
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Experience (Yrs)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                required
                value={Number.isNaN(formData.yearsOfExperience) ? '' : formData.yearsOfExperience}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData({
                    ...formData,
                    yearsOfExperience: Number.isNaN(val) ? 0 : val,
                  });
                }}
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Clinical Biography */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Clinical Biography & Board Certifications
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Board certified specialist with expertise in complex clinical interventions..."
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            ></textarea>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    save
                  </span>
                  <span>{isEdit ? 'Update Physician' : 'Confirm Registration'}</span>
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
