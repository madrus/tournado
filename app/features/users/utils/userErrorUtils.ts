import i18next from 'i18next'

const USER_ERROR_KEYS = [
  'userNotFound',
  'requestFailed',
  'requestFailedRefresh',
  'displayNameRequired',
  'cannotChangeOwnRole',
  'cannotDeactivateOwnAccount',
  'cannotReactivateOwnAccount',
  'unknownError',
] as const

type UserErrorKey = (typeof USER_ERROR_KEYS)[number]

function isUserErrorKey(error: string): error is UserErrorKey {
  return USER_ERROR_KEYS.includes(error as UserErrorKey)
}

export function translateUserError(error: string): string {
  return isUserErrorKey(error) ? i18next.t(`messages.user.${error}`) : error
}
