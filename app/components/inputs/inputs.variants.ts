import { cva, type VariantProps } from 'class-variance-authority'

// Text input field variants
export const textInputFieldVariants = cva(
  [
    'h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
    'placeholder:text-foreground-lighter bg-input/40 text-foreground',
    'transition-all duration-300 ease-in-out focus:outline-none',
  ],
  {
    variants: {
      color: {
        brand:
          'border border-brand-700/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
        primary:
          'border border-primary-700/30 hover:border-2 hover:border-primary-700/50 focus:border-2 focus:border-primary-200',
        emerald:
          'border border-emerald-700/30 hover:border-2 hover:border-emerald-700/50 focus:border-2 focus:border-emerald-200',
        red: 'border border-red-700/30 hover:border-2 hover:border-red-700/50 focus:border-2 focus:border-red-200',
        blue: 'border border-blue-700/30 hover:border-2 hover:border-blue-700/50 focus:border-2 focus:border-blue-200',
        green:
          'border border-green-700/30 hover:border-2 hover:border-green-700/50 focus:border-2 focus:border-green-200',
        yellow:
          'border border-yellow-700/30 hover:border-2 hover:border-yellow-700/50 focus:border-2 focus:border-yellow-200',
        purple:
          'border border-purple-700/30 hover:border-2 hover:border-purple-700/50 focus:border-2 focus:border-purple-200',
        pink: 'border border-pink-700/30 hover:border-2 hover:border-pink-700/50 focus:border-2 focus:border-pink-200',
        indigo:
          'border border-indigo-700/30 hover:border-2 hover:border-indigo-700/50 focus:border-2 focus:border-indigo-200',
        gray: 'border border-gray-700/30 hover:border-2 hover:border-gray-700/50 focus:border-2 focus:border-gray-200',
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200',
        neutral:
          'border border-neutral-700/30 hover:border-2 hover:border-neutral-700/50 focus:border-2 focus:border-neutral-200',
        stone:
          'border border-stone-700/30 hover:border-2 hover:border-stone-700/50 focus:border-2 focus:border-stone-200',
        orange:
          'border border-orange-700/30 hover:border-2 hover:border-orange-700/50 focus:border-2 focus:border-orange-200',
        amber:
          'border border-amber-700/30 hover:border-2 hover:border-amber-700/50 focus:border-2 focus:border-amber-200',
        lime: 'border border-lime-700/30 hover:border-2 hover:border-lime-700/50 focus:border-2 focus:border-lime-200',
        teal: 'border border-teal-700/30 hover:border-2 hover:border-teal-700/50 focus:border-2 focus:border-teal-200',
        cyan: 'border border-cyan-700/30 hover:border-2 hover:border-cyan-700/50 focus:border-2 focus:border-cyan-200',
        sky: 'border border-sky-700/30 hover:border-2 hover:border-sky-700/50 focus:border-2 focus:border-sky-200',
        violet:
          'border border-violet-700/30 hover:border-2 hover:border-violet-700/50 focus:border-2 focus:border-violet-200',
        fuchsia:
          'border border-fuchsia-700/30 hover:border-2 hover:border-fuchsia-700/50 focus:border-2 focus:border-fuchsia-200',
        rose: 'border border-rose-700/30 hover:border-2 hover:border-rose-700/50 focus:border-2 focus:border-rose-200',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
      },
    },
  }
)

// ComboField trigger button variants
export const comboFieldTriggerVariants = cva(
  [
    'flex h-12 w-full items-center justify-between rounded-md px-3 py-2 text-lg',
    'bg-input dark:bg-input/40 text-input-foreground',
    'transition-all duration-300 ease-in-out focus:outline-none',
  ],
  {
    variants: {
      color: {
        brand:
          'border border-brand-700/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200 data-[state=open]:border-2 data-[state=open]:border-brand-200',
        primary:
          'border border-primary-700/30 hover:border-2 hover:border-primary-700/50 focus:border-2 focus:border-primary-200 data-[state=open]:border-2 data-[state=open]:border-primary-200',
        emerald:
          'border border-emerald-700/30 hover:border-2 hover:border-emerald-700/50 focus:border-2 focus:border-emerald-200 data-[state=open]:border-2 data-[state=open]:border-emerald-200',
        red: 'border border-red-700/30 hover:border-2 hover:border-red-700/50 focus:border-2 focus:border-red-200 data-[state=open]:border-2 data-[state=open]:border-red-200',
        blue: 'border border-blue-700/30 hover:border-2 hover:border-blue-700/50 focus:border-2 focus:border-blue-200 data-[state=open]:border-2 data-[state=open]:border-blue-200',
        green:
          'border border-green-700/30 hover:border-2 hover:border-green-700/50 focus:border-2 focus:border-green-200 data-[state=open]:border-2 data-[state=open]:border-green-200',
        yellow:
          'border border-yellow-700/30 hover:border-2 hover:border-yellow-700/50 focus:border-2 focus:border-yellow-200 data-[state=open]:border-2 data-[state=open]:border-yellow-200',
        purple:
          'border border-purple-700/30 hover:border-2 hover:border-purple-700/50 focus:border-2 focus:border-purple-200 data-[state=open]:border-2 data-[state=open]:border-purple-200',
        pink: 'border border-pink-700/30 hover:border-2 hover:border-pink-700/50 focus:border-2 focus:border-pink-200 data-[state=open]:border-2 data-[state=open]:border-pink-200',
        indigo:
          'border border-indigo-700/30 hover:border-2 hover:border-indigo-700/50 focus:border-2 focus:border-indigo-200 data-[state=open]:border-2 data-[state=open]:border-indigo-200',
        gray: 'border border-gray-700/30 hover:border-2 hover:border-gray-700/50 focus:border-2 focus:border-gray-200 data-[state=open]:border-2 data-[state=open]:border-gray-200',
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200 data-[state=open]:border-2 data-[state=open]:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200 data-[state=open]:border-2 data-[state=open]:border-zinc-200',
        neutral:
          'border border-neutral-700/30 hover:border-2 hover:border-neutral-700/50 focus:border-2 focus:border-neutral-200 data-[state=open]:border-2 data-[state=open]:border-neutral-200',
        stone:
          'border border-stone-700/30 hover:border-2 hover:border-stone-700/50 focus:border-2 focus:border-stone-200 data-[state=open]:border-2 data-[state=open]:border-stone-200',
        orange:
          'border border-orange-700/30 hover:border-2 hover:border-orange-700/50 focus:border-2 focus:border-orange-200 data-[state=open]:border-2 data-[state=open]:border-orange-200',
        amber:
          'border border-amber-700/30 hover:border-2 hover:border-amber-700/50 focus:border-2 focus:border-amber-200 data-[state=open]:border-2 data-[state=open]:border-amber-200',
        lime: 'border border-lime-700/30 hover:border-2 hover:border-lime-700/50 focus:border-2 focus:border-lime-200 data-[state=open]:border-2 data-[state=open]:border-lime-200',
        teal: 'border border-teal-700/30 hover:border-2 hover:border-teal-700/50 focus:border-2 focus:border-teal-200 data-[state=open]:border-2 data-[state=open]:border-teal-200',
        cyan: 'border border-cyan-700/30 hover:border-2 hover:border-cyan-700/50 focus:border-2 focus:border-cyan-200 data-[state=open]:border-2 data-[state=open]:border-cyan-200',
        sky: 'border border-sky-700/30 hover:border-2 hover:border-sky-700/50 focus:border-2 focus:border-sky-200 data-[state=open]:border-2 data-[state=open]:border-sky-200',
        violet:
          'border border-violet-700/30 hover:border-2 hover:border-violet-700/50 focus:border-2 focus:border-violet-200 data-[state=open]:border-2 data-[state=open]:border-violet-200',
        fuchsia:
          'border border-fuchsia-700/30 hover:border-2 hover:border-fuchsia-700/50 focus:border-2 focus:border-fuchsia-200 data-[state=open]:border-2 data-[state=open]:border-fuchsia-200',
        rose: 'border border-rose-700/30 hover:border-2 hover:border-rose-700/50 focus:border-2 focus:border-rose-200 data-[state=open]:border-2 data-[state=open]:border-rose-200',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200 data-[state=open]:border-2 data-[state=open]:border-brand-200',
      },
    },
  }
)

// ComboField content variants
export const comboFieldContentVariants = cva([
  'z-50 overflow-hidden rounded-md border bg-background shadow-lg',
  'border-input-border',
])

// ComboField item variants
export const comboFieldItemVariants = cva(
  [
    'relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none select-none',
    'transition-colors duration-200',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  {
    variants: {
      color: {
        brand: 'focus:bg-brand-50 focus:text-brand-800',
        primary: 'focus:bg-primary-50 focus:text-primary-800',
        emerald: 'focus:bg-emerald-50 focus:text-emerald-800',
        red: 'focus:bg-red-50 focus:text-red-800',
        blue: 'focus:bg-blue-50 focus:text-blue-800',
        green: 'focus:bg-green-50 focus:text-green-800',
        yellow: 'focus:bg-yellow-50 focus:text-yellow-800',
        purple: 'focus:bg-purple-50 focus:text-purple-800',
        pink: 'focus:bg-pink-50 focus:text-pink-800',
        indigo: 'focus:bg-indigo-50 focus:text-indigo-800',
        gray: 'focus:bg-gray-50 focus:text-gray-800',
        slate: 'focus:bg-slate-50 focus:text-slate-800',
        zinc: 'focus:bg-zinc-50 focus:text-zinc-800',
        neutral: 'focus:bg-neutral-50 focus:text-neutral-800',
        stone: 'focus:bg-stone-50 focus:text-stone-800',
        orange: 'focus:bg-orange-50 focus:text-orange-800',
        amber: 'focus:bg-amber-50 focus:text-amber-800',
        lime: 'focus:bg-lime-50 focus:text-lime-800',
        teal: 'focus:bg-teal-50 focus:text-teal-800',
        cyan: 'focus:bg-cyan-50 focus:text-cyan-800',
        sky: 'focus:bg-sky-50 focus:text-sky-800',
        violet: 'focus:bg-violet-50 focus:text-violet-800',
        fuchsia: 'focus:bg-fuchsia-50 focus:text-fuchsia-800',
        rose: 'focus:bg-rose-50 focus:text-rose-800',
      },
    },
    defaultVariants: {
      color: 'emerald',
    },
  }
)

// Date picker button variants
export const datePickerButtonVariants = cva(
  [
    'flex h-12 w-full items-center justify-between rounded-md border-2 px-3 text-left text-lg leading-6',
    'bg-input/40 text-input-foreground placeholder:text-foreground-lighter',
    'transition-all duration-300 ease-in-out focus:outline-none',
  ],
  {
    variants: {
      color: {
        brand:
          'border border-brand-700/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
        primary:
          'border border-primary-700/30 hover:border-2 hover:border-primary-700/50 focus:border-2 focus:border-primary-200',
        emerald:
          'border border-emerald-700/30 hover:border-2 hover:border-emerald-700/50 focus:border-2 focus:border-emerald-200',
        red: 'border border-red-700/30 hover:border-2 hover:border-red-700/50 focus:border-2 focus:border-red-200',
        blue: 'border border-blue-700/30 hover:border-2 hover:border-blue-700/50 focus:border-2 focus:border-blue-200',
        green:
          'border border-green-700/30 hover:border-2 hover:border-green-700/50 focus:border-2 focus:border-green-200',
        yellow:
          'border border-yellow-700/30 hover:border-2 hover:border-yellow-700/50 focus:border-2 focus:border-yellow-200',
        purple:
          'border border-purple-700/30 hover:border-2 hover:border-purple-700/50 focus:border-2 focus:border-purple-200',
        pink: 'border border-pink-700/30 hover:border-2 hover:border-pink-700/50 focus:border-2 focus:border-pink-200',
        indigo:
          'border border-indigo-700/30 hover:border-2 hover:border-indigo-700/50 focus:border-2 focus:border-indigo-200',
        gray: 'border border-gray-700/30 hover:border-2 hover:border-gray-700/50 focus:border-2 focus:border-gray-200',
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200',
        neutral:
          'border border-neutral-700/30 hover:border-2 hover:border-neutral-700/50 focus:border-2 focus:border-neutral-200',
        stone:
          'border border-stone-700/30 hover:border-2 hover:border-stone-700/50 focus:border-2 focus:border-stone-200',
        orange:
          'border border-orange-700/30 hover:border-2 hover:border-orange-700/50 focus:border-2 focus:border-orange-200',
        amber:
          'border border-amber-700/30 hover:border-2 hover:border-amber-700/50 focus:border-2 focus:border-amber-200',
        lime: 'border border-lime-700/30 hover:border-2 hover:border-lime-700/50 focus:border-2 focus:border-lime-200',
        teal: 'border border-teal-700/30 hover:border-2 hover:border-teal-700/50 focus:border-2 focus:border-teal-200',
        cyan: 'border border-cyan-700/30 hover:border-2 hover:border-cyan-700/50 focus:border-2 focus:border-cyan-200',
        sky: 'border border-sky-700/30 hover:border-2 hover:border-sky-700/50 focus:border-2 focus:border-sky-200',
        violet:
          'border border-violet-700/30 hover:border-2 hover:border-violet-700/50 focus:border-2 focus:border-violet-200',
        fuchsia:
          'border border-fuchsia-700/30 hover:border-2 hover:border-fuchsia-700/50 focus:border-2 focus:border-fuchsia-200',
        rose: 'border border-rose-700/30 hover:border-2 hover:border-rose-700/50 focus:border-2 focus:border-rose-200',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
      },
    },
  }
)

// Date picker text variants
export const datePickerTextVariants = cva(
  ['flex-1 truncate text-left transition-colors duration-200'],
  {
    variants: {
      state: {
        selected: 'text-foreground',
        placeholder: 'text-foreground-lighter',
      },
    },
    defaultVariants: {
      state: 'selected',
    },
  }
)

// Date picker icon variants
export const datePickerIconVariants = cva(['w-5 h-5 transition-colors duration-200'], {
  variants: {
    state: {
      default: 'text-foreground-lighter',
      focused: 'text-foreground',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

// Text input label variants
export const textInputLabelVariants = cva(['flex w-full flex-col gap-1'])

// Text input label text variants
export const textInputLabelTextVariants = cva(['font-medium text-foreground'])

// Text input error variants
export const textInputErrorVariants = cva(['mt-2 text-sm text-brand'])

// Calendar container variants
export const calendarContainerVariants = cva([
  'p-4 rounded-lg shadow-lg border',
  'bg-input border-input-border',
])

// Calendar header variants
export const calendarHeaderVariants = cva([
  'mb-4 flex items-center justify-between text-foreground',
])

// Calendar weekday variants
export const calendarWeekdayVariants = cva([
  'text-sm font-medium text-foreground-lighter',
])

// Calendar day variants
export const calendarDayVariants = cva(
  [
    'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium',
    'transition-colors duration-200 cursor-pointer',
    'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      state: {
        default: 'text-foreground hover:bg-accent',
        today:
          'bg-brand-100 text-brand-700 dark:border-2 dark:border-brand-600 dark:bg-transparent dark:text-brand-300',
        selected: 'bg-brand-500 text-white dark:bg-brand-600',
        disabled: 'text-foreground-lighter cursor-not-allowed',
        past: 'text-foreground-lighter',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

// Export variant types
export type TextInputFieldVariants = VariantProps<typeof textInputFieldVariants>
export type ComboFieldTriggerVariants = VariantProps<typeof comboFieldTriggerVariants>
export type ComboFieldContentVariants = VariantProps<typeof comboFieldContentVariants>
export type ComboFieldItemVariants = VariantProps<typeof comboFieldItemVariants>
export type DatePickerButtonVariants = VariantProps<typeof datePickerButtonVariants>
export type DatePickerTextVariants = VariantProps<typeof datePickerTextVariants>
export type DatePickerIconVariants = VariantProps<typeof datePickerIconVariants>
export type TextInputLabelVariants = VariantProps<typeof textInputLabelVariants>
export type TextInputLabelTextVariants = VariantProps<typeof textInputLabelTextVariants>
export type TextInputErrorVariants = VariantProps<typeof textInputErrorVariants>
export type CalendarContainerVariants = VariantProps<typeof calendarContainerVariants>
export type CalendarHeaderVariants = VariantProps<typeof calendarHeaderVariants>
export type CalendarWeekdayVariants = VariantProps<typeof calendarWeekdayVariants>
export type CalendarDayVariants = VariantProps<typeof calendarDayVariants>
