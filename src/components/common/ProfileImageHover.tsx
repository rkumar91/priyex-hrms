import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, Download, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';

export interface ProfileImageHoverProps {
  src?: string | null;
  alt?: string;
  name?: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  imageClassName?: string;
  fallbackInitial?: string;
  children?: React.ReactNode;
  showHoverCard?: boolean;
  enableLightbox?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
  custom: ''
};

export const ProfileImageHover: React.FC<ProfileImageHoverProps> = ({
  src,
  alt = 'Profile Photo',
  name,
  employeeCode,
  designation,
  department,
  size = 'md',
  className = '',
  imageClassName = '',
  fallbackInitial,
  children,
  showHoverCard = true,
  enableLightbox = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove?: boolean }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive initial if not provided
  const initial = fallbackInitial || (name ? name.trim().charAt(0).toUpperCase() : 'U');

  const updateCoordinates = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 270;
    const cardHeight = 340;

    // Determine horizontal position (prefer right, fallback to left)
    let left = rect.right + 12;
    if (left + cardWidth > window.innerWidth - 16) {
      left = Math.max(16, rect.left - cardWidth - 12);
    }

    // Determine vertical position
    let top = rect.top;
    let placeAbove = false;
    if (top + cardHeight > window.innerHeight - 16) {
      // Shift upwards so it stays in viewport
      top = Math.max(16, window.innerHeight - cardHeight - 16);
      placeAbove = true;
    } else {
      top = Math.max(16, rect.top - 12);
    }

    setCoords({ top, left, placeAbove });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    updateCoordinates();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }
    if (enableLightbox && (src && !hasImageError)) {
      e.stopPropagation();
      setIsLightboxOpen(true);
      setIsHovered(false);
    }
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const hasValidPhoto = Boolean(src && !hasImageError);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar Image / Fallback Trigger */}
      <div
        onClick={handleTriggerClick}
        className={`relative overflow-hidden cursor-pointer rounded-full transition-transform duration-200 group-hover:scale-105 active:scale-95 ${
          size !== 'custom' ? sizeClasses[size] : ''
        } ${imageClassName}`}
        title={hasValidPhoto ? 'Hover for large preview • Click for full size' : (name || 'Employee Profile')}
      >
        {hasValidPhoto ? (
          <img
            src={src!}
            alt={alt}
            onError={() => setHasImageError(true)}
            className="w-full h-full object-cover object-center rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            {initial}
          </div>
        )}
      </div>

      {/* Optional Children (e.g. Upload camera button or status indicator) */}
      {children}

      {/* Floating Hover Card (Portal to prevent clipping in tables/modals) */}
      {showHoverCard && isHovered && createPortal(
        <div
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed z-[99999] w-64 sm:w-70 bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl p-3 text-white ring-4 ring-emerald-500/20 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto select-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Card Header Badge */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-medium text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Profile
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Sparkles className="w-3 h-3 text-amber-400" /> HD Preview
            </span>
          </div>

          {/* Large Image Preview Area */}
          <div
            onClick={() => {
              if (enableLightbox && hasValidPhoto) {
                setIsLightboxOpen(true);
                setIsHovered(false);
              }
            }}
            className="relative w-full h-56 sm:h-60 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group/preview cursor-pointer"
          >
            {hasValidPhoto ? (
              <>
                <img
                  src={src!}
                  alt={alt}
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover/preview:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" /> View Full HD
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-slate-300 p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-3">
                  {initial}
                </div>
                <span className="text-xs text-slate-400 font-medium">Standard Corporate Avatar</span>
              </div>
            )}
          </div>

          {/* Identity & Details Footer */}
          <div className="pt-2.5 px-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {name || 'Corporate Employee'}
                </h4>
                {employeeCode && (
                  <p className="text-[11px] font-mono font-semibold text-emerald-400 mt-0.5">
                    {employeeCode}
                  </p>
                )}
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            </div>

            {(designation || department) && (
              <p className="text-[11px] text-slate-300 mt-1 truncate">
                {[designation, department].filter(Boolean).join(' • ')}
              </p>
            )}

            {hasValidPhoto && (
              <p className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-center gap-1 text-center font-medium">
                <Maximize2 className="w-2.5 h-2.5 text-blue-400" /> Click photo to open full-screen lightbox
              </p>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen HD Lightbox Modal */}
      {enableLightbox && isLightboxOpen && hasValidPhoto && createPortal(
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 text-white space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white">{name || 'Employee Profile'}</h3>
                  <p className="text-xs text-emerald-400 font-mono">{employeeCode || 'VERIFIED USER'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={src!}
                  download={`${name || 'profile'}_photo.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Download High-Resolution Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-Resolution Photo Display */}
            <div className="relative w-full max-h-[65vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden border border-slate-800">
              <img
                src={src!}
                alt={alt}
                className="max-h-[60vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Lightbox Footer Details */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div>
                <span className="text-slate-300 font-medium">{designation || 'Staff'}</span>
                {department && <span> • {department}</span>}
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                HD Identity Record
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfileImageHover;
