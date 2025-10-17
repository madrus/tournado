import type { MetaDescriptor } from 'react-router'

type TeamsMetaContext = 'public' | 'admin'

/**
 * Factory function for generating consistent meta tags for teams pages
 */
export function createTeamsMeta(context: TeamsMetaContext): MetaDescriptor[] {
  if (context === 'admin') {
    return [
      { title: 'Team Management | Admin | Tournado' },
      {
        name: 'description',
        content:
          'Manage all teams in the system. View, edit, delete teams and oversee tournament participation.',
      },
      { property: 'og:title', content: 'Team Management | Admin | Tournado' },
      {
        property: 'og:description',
        content:
          'Manage all teams in the system. View, edit, delete teams and oversee tournament participation.',
      },
      { property: 'og:type', content: 'website' },
    ]
  }

  // Public meta
  return [
    { title: 'Teams | Tournado' },
    {
      name: 'description',
      content:
        'View all tournament teams. Browse teams participating in various tournaments and create new teams to join competitions.',
    },
    { property: 'og:title', content: 'Teams | Tournado' },
    {
      property: 'og:description',
      content:
        'View all tournament teams. Browse teams participating in various tournaments and create new teams to join competitions.',
    },
    { property: 'og:type', content: 'website' },
  ]
}
