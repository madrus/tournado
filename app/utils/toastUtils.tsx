import { toast as sonnerToast } from 'sonner'

import { ToastMessage, type ToastType } from '~/components/ToastMessage'

interface ToastOptions {
  description?: string
  duration?: number
}

const createToast = (type: ToastType) => (title: string, options?: ToastOptions) =>
  sonnerToast.custom(
    t => (
      <ToastMessage
        type={type}
        title={title}
        description={options?.description}
        onClose={() => sonnerToast.dismiss(t)}
      />
    ),
    {
      duration: options?.duration || 7500,
    }
  )

export const toast = {
  success: createToast('success'),
  error: createToast('error'),
  info: createToast('info'),
  warning: createToast('warning'),
}
