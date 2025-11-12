'use client';

import {
  calculateTakeHome,
  STUDENT_LOAN_PLAN_OPTIONS,
  type StudentLoanPlan,
  type UkRegion,
  UK_REGIONS,
} from '@/lib/uk-tax';
import { useMemo, useState } from 'react';
import {
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  type TooltipProps,
} from 'recharts';
import type {
  NameType,
  ValueType,
  Payload as TooltipPayload,
} from 'recharts/types/component/DefaultTooltipContent';
import { ThemeToggle } from './theme-toggle';

const DEFAULT_SALARY = 45_000;
const MAX_SALARY = 250_000;
const chartColors = ['#2563eb', '#dc2626', '#ea580c', '#059669'];
const TAX_YEARS = ['2024/25', '2023/24'];

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const preciseCurrencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat('en-GB', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type ChartDatum = {
  name: string;
  value: number;
};

function formatCurrency(value: number, precise = false) {
  return (precise ? preciseCurrencyFormatter : currencyFormatter).format(Math.max(value, 0));
}

const tooltipContent = (props: TooltipProps<ValueType, NameType>) => {
  const rawPayload =
    (props as { payload?: TooltipPayload<ValueType, NameType>[] })?.payload ?? [];
  const items = Array.isArray(rawPayload)
    ? (rawPayload as TooltipPayload<ValueType, NameType>[])
    : [];
  const rawLabel = (props as { label?: string | number })?.label;
  const label = typeof rawLabel === 'string' ? rawLabel : '';

  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
      <div className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
      <ul className="space-y-0.5">
        {items.map((entry, index) => (
          <li
            key={`tooltip-${index}`}
            className="flex items-center justify-between text-zinc-700 dark:text-zinc-300"
          >
            <span>{entry.name as React.ReactNode}</span>
            <span>
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })
                : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function TakeHomeCalculator() {
  const [grossSalary, setGrossSalary] = useState<number>(DEFAULT_SALARY);
  const [region, setRegion] = useState<UkRegion>('england-wales-ni');
  const [studentLoanPlan, setStudentLoanPlan] = useState<StudentLoanPlan>('none');
  const [taxYear, setTaxYear] = useState<string>(TAX_YEARS[0]);

  const result = useMemo(
    () =>
      calculateTakeHome({
        grossSalary,
        region,
        studentLoanPlan,
      }),
    [grossSalary, region, studentLoanPlan],
  );

  const chartData: ChartDatum[] = useMemo(() => {
    const segments: ChartDatum[] = [
      { name: 'Take-home pay', value: Math.max(result.netAnnual, 0) },
      { name: 'Income tax', value: result.incomeTax },
      { name: 'National Insurance', value: result.nationalInsurance },
      { name: 'Student loan', value: result.studentLoan },
    ];

    return segments.filter((segment) => segment.value > 0);
  }, [result]);

  const netDaily = result.netWeekly / 5;

  const handleSalaryChange = (value: number) => {
    if (Number.isNaN(value)) {
      return;
    }
    setGrossSalary(Math.min(Math.max(0, Math.round(value)), MAX_SALARY));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 rounded-3xl border border-border bg-card/95 px-6 py-8 shadow-sm backdrop-blur lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-200">
            UK Payroll
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Take-home pay calculator
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Explore how UK income tax, National Insurance and student loan repayments impact your
            salary. Adjust the inputs to see annual, monthly, weekly and daily take-home pay for the
            selected tax year.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Theme
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-semibold text-muted-foreground" htmlFor="salary">
                    Gross annual salary
                  </label>
                  <input
                    id="salary"
                    type="number"
                    min={0}
                    step={100}
                    value={grossSalary}
                    onChange={(event) => handleSalaryChange(Number(event.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-right text-sm font-medium text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-sm sm:w-44"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={MAX_SALARY}
                  step={500}
                  value={grossSalary}
                  onChange={(event) => handleSalaryChange(Number(event.target.value))}
                  className="mt-4 w-full accent-primary"
                  aria-label="Salary slider"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>£0</span>
                  <span>£{MAX_SALARY.toLocaleString('en-GB')}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Tax region</label>
                  <div className="flex flex-wrap gap-2">
                    {UK_REGIONS.map((option) => {
                      const isActive = option.value === region;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRegion(option.value)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-sm ${
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground shadow-md'
                              : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground" htmlFor="tax-year">
                    Tax year
                  </label>
                  <select
                    id="tax-year"
                    value={taxYear}
                    onChange={(event) => setTaxYear(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-sm"
                  >
                    {TAX_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground" htmlFor="loan-plan">
                    Student loan plan
                  </label>
                  <select
                    id="loan-plan"
                    value={studentLoanPlan}
                    onChange={(event) => setStudentLoanPlan(event.target.value as StudentLoanPlan)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-sm"
                  >
                    {STUDENT_LOAN_PLAN_OPTIONS.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">Summary note</span>
                  <div className="rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
                    2024/25 thresholds are applied to all calculations. Selecting another tax year
                    keeps the same logic but helps you capture comparison notes.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Estimated take-home (annual)
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(result.netAnnual)}</p>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Monthly</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(result.netMonthly)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekly</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(result.netWeekly)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Daily</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(netDaily)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Effective tax rate {percentageFormatter.format(result.effectiveTaxRate)}
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Monthly take-home
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(result.netMonthly)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Based on 12 equal payments per year.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Weekly take-home
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(result.netWeekly)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Daily estimate assumes a five-day working week.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Tax breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Personal allowance: {formatCurrency(result.personalAllowance, true)} · Taxable income:{' '}
              {formatCurrency(result.taxableIncome, true)}
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Band</th>
                    <th className="px-4 py-3 font-medium">Taxable amount</th>
                    <th className="px-4 py-3 font-medium">Tax paid</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {result.incomeTaxBreakdown.length > 0 ? (
                    result.incomeTaxBreakdown.map((band) => (
                      <tr key={band.label}>
                        <td className="px-4 py-3 font-medium text-foreground">{band.label}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatCurrency(band.taxableAmount, true)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatCurrency(band.taxPaid, true)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {percentageFormatter.format(band.rate)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm text-muted-foreground"
                      >
                        No income tax payable at this salary level.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-muted/40 text-foreground">
                    <td className="px-4 py-3 font-semibold">Total income tax</td>
                    <td />
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(result.incomeTax, true)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Deductions overview</h2>
            <div className="mt-6 rounded-3xl border border-border bg-muted/40 p-4">
              <div className="mx-auto h-64 w-full max-w-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="outside"
                        formatter={(value) => {
                          if (typeof value === 'number') {
                            return formatCurrency(value);
                          }
                          if (typeof value === 'string') {
                            const numeric = Number(value);
                            return Number.isNaN(numeric) ? value : formatCurrency(numeric);
                          }
                          return value;
                        }}
                        />
                    </Pie>
                    <RTooltip cursor={false} content={tooltipContent} />
                    <Legend
                      formatter={(value) => value}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '0.75rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center justify-between">
                <span>Income tax</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(result.incomeTax, true)}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>National Insurance</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(result.nationalInsurance, true)}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Student loan</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(result.studentLoan, true)}
                </span>
              </p>
              <p className="flex items-center justify-between font-semibold text-foreground">
                <span>Total deductions</span>
                <span>{formatCurrency(result.totalDeductions, true)}</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            <h3 className="text-base font-semibold text-foreground">How the calculator works</h3>
            <ul className="mt-3 space-y-2 leading-relaxed">
              <li>
                Income tax uses the 2024/25 UK thresholds. For Scotland, the devolved rates are
                applied after the personal allowance.
              </li>
              <li>National Insurance reflects the 8% main rate and 2% upper rate for employees.</li>
              <li>
                Student loan repayments are calculated using the selected plan&apos;s threshold and rate.
              </li>
              <li>
                Results are illustrative and rounded to the nearest pound. Always verify with official
                HMRC guidance for financial decisions.
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

