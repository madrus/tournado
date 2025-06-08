type ValidationFunctions = {
  validateEmail: (email: string) => boolean
  validatePassword: (password: string) => boolean
  validateRequired: (value: string) => boolean
}

export function useFormValidation(): ValidationFunctions {
  const validateEmail = (email: string) => {
    if (!email) return false
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePassword = (password: string) => {
    if (!password) return false
    return password.length >= 8
  }

  const validateRequired = (value: string): boolean => {
    if (!value) return false
    return value.trim() !== ''
  }

  return {
    validateEmail,
    validatePassword,
    validateRequired,
  }
}
