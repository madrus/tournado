// Re-export Tournament and TournamentListItem types from model
export type { Tournament, TournamentListItem } from '~/models/tournament.server'

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
