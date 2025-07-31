import type { User } from '~/models/user.server'

/**
 * Type for route metadata used in route handle exports
 */
export type RouteMetadata = {
  /**
   * Whether this route is accessible without authentication
   */
  isPublic: boolean

  /**
   * Which roles can access this route (when implemented)
   */
  roles?: Array<'manager' | 'admin' | 'referee' | 'visitor'>

  /**
   * The page title to display in the app bar
   */
  title?: string

  /**
   * Authentication requirements for this route
   */
  auth?: {
    /**
     * Whether authentication is required
     * @default !isPublic
     */
    required?: boolean

    /**
     * Where to redirect if not authenticated
     * @default '/auth/signin'
     */
    redirectTo?: string

    /**
     * Whether to include current path as redirectTo param
     * @default true
     */
    preserveRedirect?: boolean
  }

  /**
   * Authorization requirements for this route
   */
  authorization?: {
    /**
     * Required roles to access this route
     */
    requiredRoles?: Array<'manager' | 'admin' | 'referee' | 'visitor'>

    /**
     * Whether user needs ALL roles or just ONE of the roles
     * @default 'any'
     */
    roleMatchMode?: 'all' | 'any'

    /**
     * Where to redirect if not authorized
     * @default '/unauthorized'
     */
    redirectTo?: string
  }

  /**
   * Additional route protection options
   */
  protection?: {
    /**
     * Whether to check route protection in loaders automatically
     * @default true
     */
    autoCheck?: boolean

    /**
     * Custom protection function
     */
    customCheck?: (request: Request, user?: User | null) => Promise<boolean | Response>
  }
}
