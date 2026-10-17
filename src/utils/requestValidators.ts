/**
 * Request Validators Utility
 * Centralized, pure validation logic to prevent duplicate, overlapping, or conflicting
 * employee requests (Leaves, Overtime, Compensatory Off, Expenses, Profile Changes).
 */

export interface BaseLeave {
  id?: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface BaseOvertime {
  id?: number;
  date: string;
  shift?: string;
  startTime?: string;
  endTime?: string;
  status: string;
}

export interface BaseCoff {
  id?: number;
  workedDate: string;
  status: string;
  isAvailed?: boolean;
  availedDate?: string;
}

/**
 * Checks whether a leave request is active (i.e. not rejected or cancelled).
 */
export function isLeaveActive(status: string): boolean {
  if (!status) return false;
  const upper = status.toUpperCase();
  return !upper.includes('REJECTED') && upper !== 'CANCELLED';
}

/**
 * Finds any active leave that overlaps with the given start and end date range.
 */
export function findConflictingLeave<T extends BaseLeave>(
  leaves: T[],
  startDate: string,
  endDate: string,
  ignoreId?: number
): T | undefined {
  if (!startDate || !endDate) return undefined;
  return leaves.find(l => {
    if (ignoreId && l.id === ignoreId) return false;
    if (!isLeaveActive(l.status)) return false;
    // Overlaps if !(newStart > existingEnd || newEnd < existingStart)
    return !(startDate > l.endDate || endDate < l.startDate);
  });
}

/**
 * Finds any active overtime entry falling within the given leave date range.
 */
export function findConflictingOtForLeave<T extends BaseOvertime>(
  overtimes: T[],
  startDate: string,
  endDate: string
): T | undefined {
  if (!startDate || !endDate) return undefined;
  return overtimes.find(o => {
    if (o.status === 'REJECTED') return false;
    return o.date >= startDate && o.date <= endDate;
  });
}

/**
 * Finds an active leave application on a specific single date.
 */
export function findConflictingLeaveForDate<T extends BaseLeave>(
  leaves: T[],
  date: string
): T | undefined {
  if (!date) return undefined;
  return leaves.find(l => {
    if (!isLeaveActive(l.status)) return false;
    return date >= l.startDate && date <= l.endDate;
  });
}

/**
 * Finds an overlapping or duplicate overtime entry for a given date and time range.
 */
export function findConflictingOvertime<T extends BaseOvertime>(
  overtimes: T[],
  date: string,
  startTime?: string,
  endTime?: string,
  ignoreId?: number
): T | undefined {
  if (!date) return undefined;
  return overtimes.find(o => {
    if (ignoreId && o.id === ignoreId) return false;
    if (o.status === 'REJECTED') return false;
    if (o.date !== date) return false;

    // If both have startTime and endTime defined, check interval collision:
    if (o.startTime && o.endTime && startTime && endTime) {
      return startTime < o.endTime && endTime > o.startTime;
    }
    // If times are not specified, collision on the same date:
    return true;
  });
}

/**
 * Finds an existing C-Off claim for the same worked date.
 */
export function findConflictingCoffClaim<T extends BaseCoff>(
  coffs: T[],
  workedDate: string,
  ignoreId?: number
): T | undefined {
  if (!workedDate) return undefined;
  return coffs.find(c => {
    if (ignoreId && c.id === ignoreId) return false;
    return c.status !== 'REJECTED' && c.workedDate === workedDate;
  });
}

/**
 * Finds an existing C-Off credit that has already been redeemed for the given availDate.
 */
export function findConflictingCoffAvail<T extends BaseCoff>(
  coffs: T[],
  availDate: string
): T | undefined {
  if (!availDate) return undefined;
  return coffs.find(c => Boolean(c.isAvailed && c.availedDate === availDate));
}
