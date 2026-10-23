import React, { useState, useEffect, useMemo } from 'react';
import { Globe, MapPin, Building2, Hash, AlertCircle } from 'lucide-react';
import {
  GLOBAL_COUNTRIES,
  getStatesForCountry,
  findState,
  getCitiesForState,
  getPostalConfig,
  findCountry,
} from '../../data/geoData';

export interface AddressFieldsValue {
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

interface CascadingAddressFieldsProps {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  onChange?: (values: AddressFieldsValue) => void;
  onCountryChange?: (val: string) => void;
  onStateChange?: (val: string) => void;
  onCityChange?: (val: string) => void;
  onPostalCodeChange?: (val: string) => void;
  showPostalCode?: boolean;
  required?: boolean;
  disabled?: boolean;
  prefixLabel?: string; // e.g. "Permanent"
  theme?: 'emerald' | 'blue' | 'indigo';
  className?: string;
}

export const CascadingAddressFields: React.FC<CascadingAddressFieldsProps> = ({
  country = 'India',
  state = '',
  city = '',
  postalCode = '',
  onChange,
  onCountryChange,
  onStateChange,
  onCityChange,
  onPostalCodeChange,
  showPostalCode = true,
  required = false,
  disabled = false,
  prefixLabel = '',
  theme = 'emerald',
  className = '',
}) => {
  // Theme color accents
  const focusBorderClass =
    theme === 'blue'
      ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
      : theme === 'indigo'
      ? 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
      : 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20';

  const iconColorClass =
    theme === 'blue'
      ? 'text-blue-500'
      : theme === 'indigo'
      ? 'text-indigo-500'
      : 'text-emerald-500';

  // Resolved country object (handles abbreviations like 'US', 'USA', 'UK', 'IN')
  const countryObj = useMemo(() => findCountry(country), [country]);
  const currentCountryName = countryObj ? countryObj.name : (country || 'India');

  // Available states for selected country
  const availableStates = useMemo(() => {
    return getStatesForCountry(currentCountryName);
  }, [currentCountryName]);

  // Check if current state is in predefined list or requires custom text input
  const matchedState = useMemo(() => {
    return findState(currentCountryName, state);
  }, [currentCountryName, state]);

  // Is custom state input mode active
  const [isCustomState, setIsCustomState] = useState(false);

  // Sync custom state mode if existing state is not in the predefined list
  useEffect(() => {
    if (state && availableStates.length > 0) {
      if (!matchedState) {
        setIsCustomState(true);
      }
    }
  }, [state, availableStates, matchedState]);

  // Available cities for selected state
  const availableCities = useMemo(() => {
    return getCitiesForState(currentCountryName, matchedState ? matchedState.name : state);
  }, [currentCountryName, matchedState, state]);

  // Postal code configuration based on country
  const postalConfig = useMemo(() => {
    return getPostalConfig(currentCountryName);
  }, [currentCountryName]);

  // Handlers
  const handleCountryChange = (newCountryName: string) => {
    const updated: AddressFieldsValue = {
      country: newCountryName,
      state: '',
      city: '',
      postalCode: '',
    };
    setIsCustomState(false);

    if (onChange) onChange(updated);
    if (onCountryChange) onCountryChange(newCountryName);
    if (onStateChange) onStateChange('');
    if (onCityChange) onCityChange('');
    if (onPostalCodeChange) onPostalCodeChange('');
  };

  const handleStateChange = (newState: string) => {
    if (newState === '__CUSTOM__') {
      setIsCustomState(true);
      return;
    }
    const updated: AddressFieldsValue = {
      country: currentCountryName,
      state: newState,
      city: '',
      postalCode,
    };

    if (onChange) onChange(updated);
    if (onStateChange) onStateChange(newState);
    if (onCityChange) onCityChange('');
  };

  const handleCityChange = (newCity: string) => {
    const updated: AddressFieldsValue = {
      country: currentCountryName,
      state,
      city: newCity,
      postalCode,
    };
    if (onChange) onChange(updated);
    if (onCityChange) onCityChange(newCity);
  };

  const handlePostalCodeChange = (newCode: string) => {
    const updated: AddressFieldsValue = {
      country: currentCountryName,
      state,
      city,
      postalCode: newCode,
    };
    if (onChange) onChange(updated);
    if (onPostalCodeChange) onPostalCodeChange(newCode);
  };

  // Postal code validation warning (non-blocking)
  const postalWarning = useMemo(() => {
    if (!postalCode || !postalConfig.regex) return null;
    const reg = new RegExp(postalConfig.regex, 'i');
    if (!reg.test(postalCode.trim())) {
      return `Expected format: ${postalConfig.placeholder}`;
    }
    return null;
  }, [postalCode, postalConfig]);

  // Check if current country is in predefined country list
  const isCountryInList = GLOBAL_COUNTRIES.some(
    (c) => c.name.toLowerCase() === currentCountryName.toLowerCase()
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`grid grid-cols-1 ${
          showPostalCode
            ? 'sm:grid-cols-2 lg:grid-cols-4'
            : 'sm:grid-cols-3'
        } gap-3`}
      >
        {/* 1. COUNTRY */}
        <div>
          <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Globe className={`w-3.5 h-3.5 ${iconColorClass}`} />
              <span>{prefixLabel ? `${prefixLabel} Country` : 'Country'}</span>
              {required && <span className="text-rose-500">*</span>}
            </span>
            {countryObj?.flag && (
              <span className="text-sm leading-none" title={countryObj.name}>
                {countryObj.flag}
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={currentCountryName}
              disabled={disabled}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={`w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none ${focusBorderClass} font-medium text-xs appearance-none cursor-pointer pr-8 disabled:bg-slate-100 disabled:cursor-not-allowed`}
            >
              {/* Fallback for unlisted/custom country */}
              {!isCountryInList && currentCountryName && (
                <option value={currentCountryName}>{currentCountryName}</option>
              )}
              {GLOBAL_COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. STATE / PROVINCE */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 font-bold text-xs flex items-center gap-1">
              <MapPin className={`w-3.5 h-3.5 ${iconColorClass}`} />
              <span>{prefixLabel ? `${prefixLabel} State` : 'State / Province'}</span>
              {required && <span className="text-rose-500">*</span>}
            </label>
            {availableStates.length > 0 && isCustomState && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomState(false);
                  handleStateChange('');
                }}
                className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Choose from list
              </button>
            )}
          </div>

          {availableStates.length > 0 && !isCustomState ? (
            <div className="relative">
              <select
                value={matchedState ? matchedState.name : state}
                disabled={disabled}
                onChange={(e) => handleStateChange(e.target.value)}
                className={`w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none ${focusBorderClass} font-medium text-xs appearance-none cursor-pointer pr-8 disabled:bg-slate-100 disabled:cursor-not-allowed`}
              >
                <option value="">Select State / Region...</option>
                {availableStates.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="__CUSTOM__">+ Other / Enter manually...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. State / Province / Region"
              value={state}
              disabled={disabled}
              onChange={(e) => handleStateChange(e.target.value)}
              className={`w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none ${focusBorderClass} font-medium text-xs disabled:bg-slate-100`}
            />
          )}
        </div>

        {/* 3. CITY / DISTRICT */}
        <div>
          <label className="block text-slate-700 font-bold mb-1 text-xs flex items-center gap-1">
            <Building2 className={`w-3.5 h-3.5 ${iconColorClass}`} />
            <span>{prefixLabel ? `${prefixLabel} City` : 'City / District'}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
          {availableCities.length > 0 ? (
            <div className="relative">
              <input
                list={`cities-${prefixLabel || 'primary'}-${currentCountryName}-${state}`}
                type="text"
                placeholder={availableCities.length > 0 ? `e.g. ${availableCities[0]}` : 'City'}
                value={city}
                disabled={disabled}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none ${focusBorderClass} font-medium text-xs disabled:bg-slate-100`}
              />
              <datalist id={`cities-${prefixLabel || 'primary'}-${currentCountryName}-${state}`}>
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName} />
                ))}
              </datalist>
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. City or Town"
              value={city}
              disabled={disabled}
              onChange={(e) => handleCityChange(e.target.value)}
              className={`w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none ${focusBorderClass} font-medium text-xs disabled:bg-slate-100`}
            />
          )}
        </div>

        {/* 4. PIN / POSTAL / ZIP CODE (Optional conditional display) */}
        {showPostalCode && (
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Hash className={`w-3.5 h-3.5 ${iconColorClass}`} />
                <span>{prefixLabel ? `${prefixLabel} ${postalConfig.label}` : postalConfig.label}</span>
                {required && postalConfig.required && <span className="text-rose-500">*</span>}
              </span>
            </label>
            <input
              type="text"
              placeholder={postalConfig.placeholder}
              value={postalCode}
              disabled={disabled}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              className={`w-full bg-white text-slate-900 rounded-xl px-3 py-2 border ${
                postalWarning ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              } focus:outline-none ${focusBorderClass} font-mono font-medium text-xs disabled:bg-slate-100`}
            />
            {postalWarning && (
              <p className="mt-1 text-[10px] text-amber-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{postalWarning}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CascadingAddressFields;
