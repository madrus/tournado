import { cva, type VariantProps } from 'class-variance-authority'

export const panelVariants = cva(
  // Base classes - common panel styling
  ['relative overflow-visible rounded-2xl border shadow-xl p-6'],
  {
    variants: {
      color: {
        brand: 'panel-brand-bg',
        primary: 'panel-primary-bg',
        emerald: 'panel-emerald-bg',
        blue: 'panel-blue-bg',
        slate: 'panel-slate-bg',
        teal: 'panel-teal-bg',
        red: 'panel-red-bg',
        cyan: 'panel-cyan-bg',
        yellow: 'panel-yellow-bg',
        green: 'panel-green-bg',
        violet: 'panel-violet-bg',
        zinc: 'panel-zinc-bg',
        orange: 'panel-orange-bg',
        amber: 'panel-amber-bg',
        lime: 'panel-lime-bg',
        sky: 'panel-sky-bg',
        indigo: 'panel-indigo-bg',
        purple: 'panel-purple-bg',
        fuchsia: 'panel-fuchsia-bg',
        pink: 'panel-pink-bg',
        rose: 'panel-rose-bg',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

export const panelGlowVariants = cva(
  // Base classes for glow effect
  [
    'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-60',
  ],
  {
    variants: {
      color: {
        brand: 'bg-brand-400/30',
        primary: 'bg-primary-400/30',
        emerald: 'bg-emerald-400/30',
        blue: 'bg-blue-400/30',
        slate: 'bg-slate-400/30',
        teal: 'bg-teal-400/30',
        red: 'bg-red-400/30',
        cyan: 'bg-cyan-400/30',
        yellow: 'bg-yellow-400/30',
        green: 'bg-green-400/30',
        violet: 'bg-violet-400/30',
        zinc: 'bg-zinc-400/30',
        orange: 'bg-orange-400/30',
        amber: 'bg-amber-400/30',
        lime: 'bg-lime-400/30',
        sky: 'bg-sky-400/30',
        indigo: 'bg-indigo-400/30',
        purple: 'bg-purple-400/30',
        fuchsia: 'bg-fuchsia-400/30',
        pink: 'bg-pink-400/30',
        rose: 'bg-rose-400/30',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

export const panelContentVariants = cva(
  // Base classes for content
  ['relative z-20']
)

// Panel title styling - consistent across app
export const panelTitleVariants = cva(['mb-2 font-bold'], {
  variants: {
    size: {
      lg: 'text-2xl',
      md: 'text-xl',
      sm: 'text-lg',
    },
    color: {
      slate: 'text-foreground-darker', // Keep semantic
      red: 'text-adaptive-red',
      blue: 'text-adaptive-blue',
      emerald: 'text-adaptive-emerald',
      teal: 'text-adaptive-teal',
      cyan: 'text-adaptive-cyan',
      green: 'text-adaptive-green',
      violet: 'text-adaptive-violet',
      purple: 'text-adaptive-purple',
      yellow: 'text-adaptive-yellow',
      orange: 'text-adaptive-orange',
      pink: 'text-adaptive-pink',
      indigo: 'text-adaptive-indigo',
      fuchsia: 'text-adaptive-fuchsia',
      sky: 'text-adaptive-sky',
      lime: 'text-adaptive-lime',
      amber: 'text-adaptive-amber',
      rose: 'text-adaptive-rose',
      brand: 'text-adaptive-red', // Map brand to red adaptive
      primary: 'text-adaptive-emerald', // Map primary to emerald adaptive
      zinc: 'text-adaptive-zinc',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'slate',
  },
})

// Panel description styling
export const panelDescriptionVariants = cva(['text-foreground text-sm'], {
  variants: {},
})

// Panel number badge styling
export const panelNumberVariants = cva(
  [
    'text-primary-foreground absolute top-8 -left-4 z-30 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg rtl:-right-4 rtl:left-auto',
  ],
  {
    variants: {
      color: {
        brand: 'bg-brand-600',
        primary: 'bg-primary-600',
        emerald: 'bg-emerald-600',
        blue: 'bg-blue-600',
        slate: 'bg-slate-600',
        teal: 'bg-teal-600',
        red: 'bg-red-600',
        cyan: 'bg-cyan-600',
        yellow: 'bg-yellow-600',
        green: 'bg-green-600',
        violet: 'bg-violet-600',
        zinc: 'bg-zinc-600',
        orange: 'bg-orange-600',
        amber: 'bg-amber-600',
        lime: 'bg-lime-600',
        sky: 'bg-sky-600',
        indigo: 'bg-indigo-600',
        purple: 'bg-purple-600',
        fuchsia: 'bg-fuchsia-600',
        pink: 'bg-pink-600',
        rose: 'bg-rose-600',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

// Field validation checkmark styling
export const fieldCheckmarkVariants = cva(
  [
    'absolute -top-2 right-1 flex h-6 w-6 items-center justify-center rounded-full rtl:right-auto rtl:left-1',
  ],
  {
    variants: {
      color: {
        brand: 'bg-brand-500',
        primary: 'bg-primary-500',
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        slate: 'bg-slate-500',
        teal: 'bg-teal-500',
        red: 'bg-red-500',
        cyan: 'bg-cyan-500',
        yellow: 'bg-yellow-500',
        green: 'bg-green-500',
        violet: 'bg-violet-500',
        zinc: 'bg-zinc-500',
        orange: 'bg-orange-500',
        amber: 'bg-amber-500',
        lime: 'bg-lime-500',
        sky: 'bg-sky-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500',
        fuchsia: 'bg-fuchsia-500',
        pink: 'bg-pink-500',
        rose: 'bg-rose-500',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
)

// Field validation error icon styling
export const fieldErrorIconVariants = cva(
  [
    'absolute -top-2 right-1 flex h-6 w-6 items-center justify-center rounded-full rtl:right-auto rtl:left-1',
    'bg-red-500', // Always red for errors regardless of panel color
  ],
  {
    variants: {
      color: {
        // All colors use red background for error state, but we keep the variants
        // for consistency with the checkmark pattern and potential future customization
        brand: '',
        primary: '',
        emerald: '',
        blue: '',
        slate: '',
        teal: '',
        red: '',
        cyan: '',
        yellow: '',
        green: '',
        violet: '',
        zinc: '',
        orange: '',
        amber: '',
        lime: '',
        sky: '',
        indigo: '',
        purple: '',
        fuchsia: '',
        pink: '',
        rose: '',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
)

// Checkbox styling for forms
export const checkboxVariants = cva(
  [
    'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 transition-all duration-300',
  ],
  {
    variants: {
      state: {
        checked: 'border-primary-500 bg-primary-500',
        error: 'border-brand bg-accent',
        default: 'border-foreground-lighter bg-background',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

export type PanelVariants = VariantProps<typeof panelVariants>
export type PanelGlowVariants = VariantProps<typeof panelGlowVariants>
export type PanelNumberVariants = VariantProps<typeof panelNumberVariants>
export type FieldCheckmarkVariants = VariantProps<typeof fieldCheckmarkVariants>
export type FieldErrorIconVariants = VariantProps<typeof fieldErrorIconVariants>
export type CheckboxVariants = VariantProps<typeof checkboxVariants>
