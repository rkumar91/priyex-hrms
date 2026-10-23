import React from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Camera, UploadCloud, Trash2, Users, MapPin, Home, HeartPulse } from 'lucide-react';
import ProfileImageHover from '../common/ProfileImageHover';
import CascadingAddressFields from '../common/CascadingAddressFields';
import api from '../../api/client';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selfEditData: any;
  setSelfEditData: React.Dispatch<React.SetStateAction<any>>;
  sameAsCurrent: boolean;
  setSameAsCurrent: (val: boolean) => void;
  isSubmitting: boolean;
  myProfile: any;
  isUploadingPhoto: boolean;
  handleInstantAvatarUpload: (file: File) => void;
  setMyProfile: React.Dispatch<React.SetStateAction<any>>;
  updateUser: (user: any) => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selfEditData,
  setSelfEditData,
  sameAsCurrent,
  setSameAsCurrent,
  isSubmitting,
  myProfile,
  isUploadingPhoto,
  handleInstantAvatarUpload,
  setMyProfile,
  updateUser
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-600" />
            <span>Update Personal Details, Address & Emergency Contact</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Instant Profile Photo Upload Card */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 rounded-2xl border border-slate-200 shadow-xs">
            <label className="block text-slate-700 font-bold mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Profile Photo / Avatar</span>
            </label>

            <div className="flex flex-col sm:row items-center gap-4 sm:flex-row">
              {/* Photo Preview Circle */}
              <ProfileImageHover
                src={selfEditData.photoUrl}
                alt="Avatar Preview"
                name={myProfile ? `${myProfile.firstName} ${myProfile.lastName}` : 'My Profile'}
                employeeCode={myProfile?.employeeCode}
                size="custom"
                className="shrink-0"
                imageClassName="w-20 h-20 border-2 border-emerald-500 p-0.5 shadow-md"
              >
                {isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-xs z-10">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </ProfileImageHover>

              {/* Upload Controls & Actions */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition transform hover:scale-[1.02]">
                    <UploadCloud className="w-4 h-4" />
                    <span>{selfEditData.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInstantAvatarUpload(file);
                      }}
                    />
                  </label>
                  {selfEditData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelfEditData((prev: any) => ({ ...prev, photoUrl: '' }));
                        setMyProfile((prev: any) => prev ? ({ ...prev, photoUrl: '' }) : null);
                        updateUser({ photoUrl: '' });
                        api.put('/employees/me', { ...selfEditData, photoUrl: '' }).catch(() => {});
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports JPG, PNG, WebP • Auto-optimized & stored instantly in database
                </p>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={selfEditData.personalPhone}
                  onChange={(e) => setSelfEditData({ ...selfEditData, personalPhone: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Email</label>
                <input
                  type="email"
                  placeholder="employee@gmail.com"
                  value={selfEditData.personalEmail}
                  onChange={(e) => setSelfEditData({ ...selfEditData, personalEmail: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                <select
                  value={selfEditData.bloodGroup}
                  onChange={(e) => setSelfEditData({ ...selfEditData, bloodGroup: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Marital Status</label>
                <select
                  value={selfEditData.maritalStatus}
                  onChange={(e) => setSelfEditData({ ...selfEditData, maritalStatus: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={selfEditData.dateOfBirth}
                  onChange={(e) => setSelfEditData({ ...selfEditData, dateOfBirth: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Current Residential Address
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Address Line 1</label>
                  <input
                    type="text"
                    placeholder="Flat 402, Green Valley Apartments"
                    value={selfEditData.addressLine1}
                    onChange={(e) => setSelfEditData({ ...selfEditData, addressLine1: e.target.value })}
                    className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Sector / Landmark"
                    value={selfEditData.addressLine2}
                    onChange={(e) => setSelfEditData({ ...selfEditData, addressLine2: e.target.value })}
                    className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Cascading Country -> State -> City -> Postal Code */}
              <CascadingAddressFields
                country={selfEditData.country || 'India'}
                state={selfEditData.state || ''}
                city={selfEditData.city || ''}
                postalCode={selfEditData.postalCode || ''}
                theme="emerald"
                onChange={({ country, state, city, postalCode }) => {
                  setSelfEditData((prev: any) => ({
                    ...prev,
                    country,
                    state,
                    city,
                    postalCode,
                  }));
                }}
              />
            </div>
          </div>

          {/* Permanent Address with "Same as Current Address" Checkbox */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-teal-600" /> Permanent Residential Address
              </h4>
              <label className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsCurrent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSameAsCurrent(checked);
                    if (checked) {
                      setSelfEditData((prev: any) => ({
                        ...prev,
                        permanentAddressLine1: prev.addressLine1,
                        permanentAddressLine2: prev.addressLine2,
                        permanentCity: prev.city,
                        permanentState: prev.state,
                        permanentPostalCode: prev.postalCode,
                        permanentCountry: prev.country,
                      }));
                    }
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Same as Current Address</span>
              </label>
            </div>
            {!sameAsCurrent && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Permanent Address Line 1</label>
                    <input
                      type="text"
                      placeholder="House / Street"
                      value={selfEditData.permanentAddressLine1}
                      onChange={(e) => setSelfEditData({ ...selfEditData, permanentAddressLine1: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Permanent Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Sector / Landmark"
                      value={selfEditData.permanentAddressLine2}
                      onChange={(e) => setSelfEditData({ ...selfEditData, permanentAddressLine2: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* Cascading Country -> State -> City -> Postal Code for Permanent Address */}
                <CascadingAddressFields
                  country={selfEditData.permanentCountry || selfEditData.country || 'India'}
                  state={selfEditData.permanentState || ''}
                  city={selfEditData.permanentCity || ''}
                  postalCode={selfEditData.permanentPostalCode || ''}
                  prefixLabel="Permanent"
                  theme="emerald"
                  onChange={({ country, state, city, postalCode }) => {
                    setSelfEditData((prev: any) => ({
                      ...prev,
                      permanentCountry: country,
                      permanentState: state,
                      permanentCity: city,
                      permanentPostalCode: postalCode,
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Emergency Point of Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Kumar"
                  value={selfEditData.emergencyContactName}
                  onChange={(e) => setSelfEditData({ ...selfEditData, emergencyContactName: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Father"
                  value={selfEditData.emergencyContactRelationship}
                  onChange={(e) => setSelfEditData({ ...selfEditData, emergencyContactRelationship: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Phone</label>
                <input
                  type="text"
                  placeholder="+91 9876543299"
                  value={selfEditData.emergencyContactPhone}
                  onChange={(e) => setSelfEditData({ ...selfEditData, emergencyContactPhone: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
