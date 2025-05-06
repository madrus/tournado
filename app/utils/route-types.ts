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
  roles?: Array<'tournamentOrganiser' | 'admin' | 'referee'>
}
