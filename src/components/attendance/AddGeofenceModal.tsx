import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X } from 'lucide-react';

export interface NewFenceFormState {
  name: string;
  city: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
}

interface AddGeofenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newFenceForm: NewFenceFormState;
  setNewFenceForm: React.Dispatch<React.SetStateAction<NewFenceFormState>>;
}

export const AddGeofenceModal: React.FC<AddGeofenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newFenceForm,
  setNewFenceForm,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Add Authorized Office Geo-Perimeter</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Office Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hyderabad Innovation Hub"
              value={newFenceForm.name}
              onChange={(e) => setNewFenceForm({ ...newFenceForm, name: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">City / Region *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hyderabad, Telangana"
              value={newFenceForm.city}
              onChange={(e) => setNewFenceForm({ ...newFenceForm, city: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Latitude *</label>
              <input
                type="number"
                step="0.0001"
                required
                placeholder="e.g. 17.3850"
                value={newFenceForm.latitude}
                onChange={(e) => setNewFenceForm({ ...newFenceForm, latitude: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Longitude *</label>
              <input
                type="number"
                step="0.0001"
                required
                placeholder="e.g. 78.4867"
                value={newFenceForm.longitude}
                onChange={(e) => setNewFenceForm({ ...newFenceForm, longitude: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Geo-Fence Perimeter Radius (Meters)</label>
            <select
              value={newFenceForm.radiusMeters}
              onChange={(e) => setNewFenceForm({ ...newFenceForm, radiusMeters: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="150">150 Meters (Tight Campus)</option>
              <option value="250">250 Meters (Standard Office Building)</option>
              <option value="500">500 Meters (Large Tech Park)</option>
              <option value="1000">1,000 Meters (Expanded Zone)</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
            >
              Register Geo-Fence
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
