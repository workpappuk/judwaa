import { IStay } from '@/models/Stay';

/**
 * calculateBill
 * The single place proration math lives. Called when generating a
 * final settlement Bill (Stay.actualEnd just got set) or a routine
 * recurring Bill for an ongoing monthly Stay.
 *
 * Pass the ACTUAL period being billed — for a final bill that's
 * (actualStart ?? scheduledStart) to actualEnd. For a routine monthly
 * cycle bill mid-tenancy, it's just that month's periodStart/periodEnd.
 */

export interface BillCalculationInput {
  billingType: IStay['billingType'];
  rate: number;
  periodStart: Date;
  periodEnd: Date;
  scheduledEnd?: Date | null; // to detect early-exit vs extension vs on-time
  prorationPolicy: IStay['prorationPolicy'];
}

export interface BillCalculationResult {
  units: number;
  baseAmount: number;
  adjustments: { label: string; amount: number }[];
  amount: number;
}

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function calculateBill(input: BillCalculationInput): BillCalculationResult {
  const { billingType, rate, periodStart, periodEnd, scheduledEnd, prorationPolicy } = input;
  const adjustments: BillCalculationResult['adjustments'] = [];

  let units: number;
  let baseAmount: number;

  if (billingType === 'monthly') {
    // Prorate by exact days within the calendar month rather than a flat
    // 30-day assumption, so Feb and July bill fairly.
    const msElapsed = periodEnd.getTime() - periodStart.getTime();
    const daysElapsed = msElapsed / MS_PER_DAY;
    const totalDaysInCycle = daysInMonth(periodStart);
    units = daysElapsed / totalDaysInCycle;
    baseAmount = rate * units;
  } else if (billingType === 'daily') {
    // Nights are charged whole — partial-day stays still count as one
    // night unless prorationPolicy says otherwise for early checkout.
    const msElapsed = periodEnd.getTime() - periodStart.getTime();
    units = Math.max(1, Math.ceil(msElapsed / MS_PER_DAY));
    baseAmount = rate * units;
  } else {
    // hourly — e.g. 12-hour day-use bookings. Round up to the nearest
    // full hour, minimum 1.
    const msElapsed = periodEnd.getTime() - periodStart.getTime();
    units = Math.max(1, Math.ceil(msElapsed / MS_PER_HOUR));
    baseAmount = rate * units;
  }

  // Early exit / extension adjustments relative to what was scheduled
  if (scheduledEnd) {
    const endedEarly = periodEnd.getTime() < scheduledEnd.getTime();
    const extended = periodEnd.getTime() > scheduledEnd.getTime();

    if (endedEarly && prorationPolicy === 'no_refund') {
      // Charge the full originally-scheduled period regardless of the
      // shorter actual stay — recompute baseAmount off scheduledEnd instead.
      const scheduledMs = scheduledEnd.getTime() - periodStart.getTime();
      const scheduledUnits =
        billingType === 'monthly'
          ? scheduledMs / MS_PER_DAY / daysInMonth(periodStart)
          : billingType === 'daily'
          ? Math.max(1, Math.ceil(scheduledMs / MS_PER_DAY))
          : Math.max(1, Math.ceil(scheduledMs / MS_PER_HOUR));
      const scheduledAmount = rate * scheduledUnits;
      adjustments.push({
        label: 'Early checkout — no-refund policy, full scheduled period charged',
        amount: scheduledAmount - baseAmount,
      });
      units = scheduledUnits;
      baseAmount = scheduledAmount;
    } else if (endedEarly && prorationPolicy === 'prorate') {
      adjustments.push({ label: 'Early checkout — prorated to actual stay', amount: 0 });
    } else if (extended) {
      adjustments.push({ label: 'Extension beyond scheduled end', amount: 0 });
    }
  }

  const amount = baseAmount + adjustments.reduce((sum, a) => sum + a.amount, 0);

  return { units, baseAmount, adjustments, amount };
}
