// Re-export Tournament type from model
export type { Tournament } from '~/models/tournament.server'

// Client-side tournament list item (dates are ISO strings after JSON serialization)
export type TournamentListItem = {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string | null
}

// Tournament data types
export type TournamentData = {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string | null
  divisions: string[]
  categories: string[]
}

export type TournamentFilterOption = {
  value: string
  label: string
}

/**
 * Props for TournamentForm component
 */
export type TournamentFormProps = {
  mode?: 'create' | 'edit'
  variant?: 'admin' | 'public'
  formData?: {
    id?: string
    name?: string
    location?: string
    divisions?: string[]
    categories?: string[]
    startDate?: string
    endDate?: string
  }
  divisions?: string[]
  categories?: string[]
  errors?: Record<string, string>
  isSuccess?: boolean
  successMessage?: string
  submitButtonText?: string
  className?: string
  intent?: string
}
