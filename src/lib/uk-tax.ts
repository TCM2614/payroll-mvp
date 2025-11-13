export type UkRegion = 'england-wales-ni' | 'scotland';

export type StudentLoanPlan =
  | 'none'
  | 'plan-1'
  | 'plan-2'
  | 'plan-4'
  | 'plan-5'
  | 'postgraduate';

export interface CalculatorInputs {
  grossSalary: number;
  region: UkRegion;
  studentLoanPlan: StudentLoanPlan;
}

export interface TaxBandBreakdown {
  label: string;
  taxableAmount: number;
  taxPaid: number;
  rate: number;
}

export interface TakeHomeResult {
  grossSalary: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  studentLoan: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  effectiveTaxRate: number;
  incomeTaxBreakdown: TaxBandBreakdown[];
}

export const UK_REGIONS: Array<{ value: UkRegion; label: string }> = [
  { value: 'england-wales-ni', label: 'England, Wales & Northern Ireland' },
  { value: 'scotland', label: 'Scotland' },
];

const PERSONAL_ALLOWANCE = 12_570;
const PERSONAL_ALLOWANCE_TAPER_START = 100_000;
const ADDITIONAL_RATE_THRESHOLD = 125_140;
const BASIC_RATE_BAND_SIZE = 37_700;

type IncomeTaxBand = {
  cap: number;
  rate: number;
  label: string;
};

const ENGLAND_BANDS: IncomeTaxBand[] = [
  { cap: BASIC_RATE_BAND_SIZE, rate: 0.2, label: 'Basic rate (20%)' },
  {
    cap: ADDITIONAL_RATE_THRESHOLD - PERSONAL_ALLOWANCE - BASIC_RATE_BAND_SIZE,
    rate: 0.4,
    label: 'Higher rate (40%)',
  },
  { cap: Number.POSITIVE_INFINITY, rate: 0.45, label: 'Additional rate (45%)' },
];

const SCOTLAND_BANDS: IncomeTaxBand[] = [
  { cap: 2_306, rate: 0.19, label: 'Starter rate (19%)' },
  { cap: 11_685, rate: 0.2, label: 'Basic rate (20%)' },
  { cap: 17_101, rate: 0.21, label: 'Intermediate rate (21%)' },
  { cap: 31_338, rate: 0.42, label: 'Higher rate (42%)' },
  { cap: Number.POSITIVE_INFINITY, rate: 0.47, label: 'Top rate (47%)' },
];

type StudentLoanDetails = {
  label: string;
  threshold: number;
  rate: number;
};

export const STUDENT_LOAN_PLANS: Record<StudentLoanPlan, StudentLoanDetails> = {
  none: {
    label: 'No student loan',
    threshold: Number.POSITIVE_INFINITY,
    rate: 0,
  },
  'plan-1': {
    label: 'Plan 1',
    threshold: 22_015,
    rate: 0.09,
  },
  'plan-2': {
    label: 'Plan 2',
    threshold: 27_295,
    rate: 0.09,
  },
  'plan-4': {
    label: 'Plan 4 (Scotland)',
    threshold: 31_395,
    rate: 0.09,
  },
  'plan-5': {
    label: 'Plan 5',
    threshold: 25_000,
    rate: 0.09,
  },
  postgraduate: {
    label: 'Postgraduate',
    threshold: 21_000,
    rate: 0.06,
  },
};

export const STUDENT_LOAN_PLAN_OPTIONS = (Object.entries(STUDENT_LOAN_PLANS) as Array<
  [StudentLoanPlan, StudentLoanDetails]
>).map(([value, details]) => ({
  value,
  label: details.label,
}));

function adjustPersonalAllowance(salary: number) {
  if (salary <= PERSONAL_ALLOWANCE_TAPER_START) {
    return PERSONAL_ALLOWANCE;
  }

  const reduction = Math.floor((salary - PERSONAL_ALLOWANCE_TAPER_START) / 2);
  return Math.max(PERSONAL_ALLOWANCE - reduction, 0);
}

function computeIncomeTax(
  taxableIncome: number,
  bands: IncomeTaxBand[],
): { total: number; breakdown: TaxBandBreakdown[] } {
  const breakdown: TaxBandBreakdown[] = [];
  let remaining = taxableIncome;
  let totalTax = 0;

  for (const band of bands) {
    if (remaining <= 0) {
      break;
    }
    const bandAmount = Math.min(remaining, Math.max(band.cap, 0));
    const taxForBand = bandAmount * band.rate;

    if (bandAmount > 0 && band.rate > 0) {
      breakdown.push({
        label: band.label,
        taxableAmount: bandAmount,
        taxPaid: taxForBand,
        rate: band.rate,
      });
    }

    totalTax += taxForBand;
    remaining -= bandAmount;
  }

  return { total: totalTax, breakdown };
}

function calculateIncomeTax(salary: number, region: UkRegion, personalAllowance: number) {
  const taxableIncome = Math.max(0, salary - personalAllowance);
  const bands =
    region === 'scotland'
      ? SCOTLAND_BANDS
      : ENGLAND_BANDS.map((band, index) =>
          index === 1
            ? {
                ...band,
                cap: Math.max(
                  ADDITIONAL_RATE_THRESHOLD - personalAllowance - BASIC_RATE_BAND_SIZE,
                  0,
                ),
              }
            : band,
        );

  return {
    taxableIncome,
    ...computeIncomeTax(taxableIncome, bands),
  };
}

function calculateNationalInsurance(salary: number) {
  const primaryThreshold = 12_570;
  const upperEarningsLimit = 50_270;

  if (salary <= primaryThreshold) {
    return 0;
  }

  const mainBand = Math.min(salary, upperEarningsLimit) - primaryThreshold;
  const upperBand = Math.max(salary - upperEarningsLimit, 0);

  const mainBandContribution = mainBand > 0 ? mainBand * 0.08 : 0; // 8% main rate
  const upperBandContribution = upperBand > 0 ? upperBand * 0.02 : 0; // 2% additional rate

  return mainBandContribution + upperBandContribution;
}

function calculateStudentLoan(salary: number, plan: StudentLoanPlan) {
  const details = STUDENT_LOAN_PLANS[plan];
  if (!details || details.rate === 0) {
    return 0;
  }

  const repayable = Math.max(0, salary - details.threshold);
  return repayable * details.rate;
}

export function calculateTakeHome({
  grossSalary,
  region,
  studentLoanPlan,
}: CalculatorInputs): TakeHomeResult {
  const personalAllowance = adjustPersonalAllowance(grossSalary);
  const { taxableIncome, total, breakdown } = calculateIncomeTax(
    grossSalary,
    region,
    personalAllowance,
  );
  const incomeTax = total;
  const nationalInsurance = calculateNationalInsurance(grossSalary);
  const studentLoan = calculateStudentLoan(grossSalary, studentLoanPlan);

  const totalDeductions = incomeTax + nationalInsurance + studentLoan;
  const netAnnual = grossSalary - totalDeductions;

  return {
    grossSalary,
    personalAllowance,
    taxableIncome,
    incomeTax,
    nationalInsurance,
    studentLoan,
    totalDeductions,
    netAnnual,
    netMonthly: netAnnual / 12,
    netWeekly: netAnnual / 52,
    effectiveTaxRate: grossSalary > 0 ? totalDeductions / grossSalary : 0,
    incomeTaxBreakdown: breakdown,
  };
}

