import { cva, type VariantProps } from 'class-variance-authority'

// Text input field variants
export const textInputFieldVariants = cva(
  [
    'h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
    'placeholder:text-foreground-lighter bg-input dark:bg-input/40 text-foreground',
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
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200',
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
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200 data-[state=open]:border-2 data-[state=open]:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200 data-[state=open]:border-2 data-[state=open]:border-zinc-200',
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
export const comboFieldContentVariants = cva(
  ['z-50 overflow-hidden rounded-md border shadow-lg', 'border-input-border'],
  {
    variants: {
      color: {
        brand: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-50',
        primary:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-50',
        emerald:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-50',
        red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-50',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-50',
        green: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-50',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-50',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50',
        pink: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-50',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-50',
        slate: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-50',
        zinc: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-50',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-50',
        lime: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-50',
        teal: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-50',
        cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-50',
        sky: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-50',
        violet: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-50',
        fuchsia:
          'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-50',
        rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-50',
      },
    },
    defaultVariants: {
      color: 'emerald',
    },
  }
)

// ComboField item variants
export const comboFieldItemVariants = cva(
  [
    'relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-lg outline-none select-none',
    'bg-transparent transition-colors duration-200',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  {
    variants: {
      color: {
        brand:
          'text-red-800 hover:bg-red-200 focus:bg-red-200 data-[highlighted]:bg-red-200 dark:text-red-50 dark:hover:bg-red-800 dark:focus:bg-red-800 dark:data-[highlighted]:bg-red-800',
        primary:
          'text-emerald-800 hover:bg-emerald-200 focus:bg-emerald-200 data-[highlighted]:bg-emerald-200 dark:text-emerald-50 dark:hover:bg-emerald-800 dark:focus:bg-emerald-800 dark:data-[highlighted]:bg-emerald-800',
        emerald:
          'text-emerald-800 hover:bg-emerald-200 focus:bg-emerald-200 data-[highlighted]:bg-emerald-200 dark:text-emerald-50 dark:hover:bg-emerald-800 dark:focus:bg-emerald-800 dark:data-[highlighted]:bg-emerald-800',
        red: 'text-red-800 hover:bg-red-200 focus:bg-red-200 data-[highlighted]:bg-red-200 dark:text-red-50 dark:hover:bg-red-800 dark:focus:bg-red-800 dark:data-[highlighted]:bg-red-800',
        blue: 'text-blue-800 hover:bg-blue-200 focus:bg-blue-200 data-[highlighted]:bg-blue-200 dark:text-blue-50 dark:hover:bg-blue-800 dark:focus:bg-blue-800 dark:data-[highlighted]:bg-blue-800',
        green:
          'text-green-800 hover:bg-green-200 focus:bg-green-200 data-[highlighted]:bg-green-200 dark:text-green-50 dark:hover:bg-green-800 dark:focus:bg-green-800 dark:data-[highlighted]:bg-green-800',
        yellow:
          'text-yellow-800 hover:bg-yellow-200 focus:bg-yellow-200 data-[highlighted]:bg-yellow-200 dark:text-yellow-50 dark:hover:bg-yellow-800 dark:focus:bg-yellow-800 dark:data-[highlighted]:bg-yellow-800',
        purple:
          'text-purple-800 hover:bg-purple-200 focus:bg-purple-200 data-[highlighted]:bg-purple-200 dark:text-purple-50 dark:hover:bg-purple-800 dark:focus:bg-purple-800 dark:data-[highlighted]:bg-purple-800',
        pink: 'text-pink-800 hover:bg-pink-200 focus:bg-pink-200 data-[highlighted]:bg-pink-200 dark:text-pink-50 dark:hover:bg-pink-800 dark:focus:bg-pink-800 dark:data-[highlighted]:bg-pink-800',
        indigo:
          'text-indigo-800 hover:bg-indigo-200 focus:bg-indigo-200 data-[highlighted]:bg-indigo-200 dark:text-indigo-50 dark:hover:bg-indigo-800 dark:focus:bg-indigo-800 dark:data-[highlighted]:bg-indigo-800',
        slate:
          'text-slate-800 hover:bg-slate-200 focus:bg-slate-200 data-[highlighted]:bg-slate-200 dark:text-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:data-[highlighted]:bg-slate-800',
        zinc: 'text-zinc-800 hover:bg-zinc-200 focus:bg-zinc-200 data-[highlighted]:bg-zinc-200 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800 dark:data-[highlighted]:bg-zinc-800',
        orange:
          'text-orange-800 hover:bg-orange-200 focus:bg-orange-200 data-[highlighted]:bg-orange-200 dark:text-orange-50 dark:hover:bg-orange-800 dark:focus:bg-orange-800 dark:data-[highlighted]:bg-orange-800',
        amber:
          'text-amber-800 hover:bg-amber-200 focus:bg-amber-200 data-[highlighted]:bg-amber-200 dark:text-amber-50 dark:hover:bg-amber-800 dark:focus:bg-amber-800 dark:data-[highlighted]:bg-amber-800',
        lime: 'text-lime-800 hover:bg-lime-200 focus:bg-lime-200 data-[highlighted]:bg-lime-200 dark:text-lime-50 dark:hover:bg-lime-800 dark:focus:bg-lime-800 dark:data-[highlighted]:bg-lime-800',
        teal: 'text-teal-800 hover:bg-teal-200 focus:bg-teal-200 data-[highlighted]:bg-teal-200 dark:text-teal-50 dark:hover:bg-teal-800 dark:focus:bg-teal-800 dark:data-[highlighted]:bg-teal-800',
        cyan: 'text-cyan-800 hover:bg-cyan-200 focus:bg-cyan-200 data-[highlighted]:bg-cyan-200 dark:text-cyan-50 dark:hover:bg-cyan-800 dark:focus:bg-cyan-800 dark:data-[highlighted]:bg-cyan-800',
        sky: 'text-sky-800 hover:bg-sky-200 focus:bg-sky-200 data-[highlighted]:bg-sky-200 dark:text-sky-50 dark:hover:bg-sky-800 dark:focus:bg-sky-800 dark:data-[highlighted]:bg-sky-800',
        violet:
          'text-violet-800 hover:bg-violet-200 focus:bg-violet-200 data-[highlighted]:bg-violet-200 dark:text-violet-50 dark:hover:bg-violet-800 dark:focus:bg-violet-800 dark:data-[highlighted]:bg-violet-800',
        fuchsia:
          'text-fuchsia-800 hover:bg-fuchsia-200 focus:bg-fuchsia-200 data-[highlighted]:bg-fuchsia-200 dark:text-fuchsia-50 dark:hover:bg-fuchsia-800 dark:focus:bg-fuchsia-800 dark:data-[highlighted]:bg-fuchsia-800',
        rose: 'text-rose-800 hover:bg-rose-200 focus:bg-rose-200 data-[highlighted]:bg-rose-200 dark:text-rose-50 dark:hover:bg-rose-800 dark:focus:bg-rose-800 dark:data-[highlighted]:bg-rose-800',
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
    'bg-input dark:bg-input/40 text-input-foreground placeholder:text-foreground-lighter',
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
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200',
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
