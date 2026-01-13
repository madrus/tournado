import i18next from 'i18next'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { translateUserError } from '~/features/users/utils/userErrorUtils'
import { toast } from '~/utils/toastUtils'

export function useUserActionFeedback(): void {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    switch (success) {
      case 'role':
        toast.success(i18next.t('users.messages.roleUpdatedSuccessfully'))
        break
      case 'deactivate':
        toast.success(i18next.t('users.messages.userDeactivatedSuccessfully'))
        break
      case 'reactivate':
        toast.success(i18next.t('users.messages.userReactivatedSuccessfully'))
        break
      case 'displayName':
        toast.success(i18next.t('users.messages.displayNameUpdatedSuccessfully'))
        break
    }

    if (error) {
      toast.error(translateUserError(error))
    }

    // Clean up search params after showing toasts
    if (success || error) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('success')
      nextParams.delete('error')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])
}
