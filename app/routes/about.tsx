import { JSX } from 'react'
import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => [
  { title: 'About | Tournado' },
  {
    name: 'description',
    content:
      'Learn about Tournado - the comprehensive tournament management platform for sports organizations and teams.',
  },
  { property: 'og:title', content: 'About | Tournado' },
  {
    property: 'og:description',
    content:
      'Learn about Tournado - the comprehensive tournament management platform for sports organizations and teams.',
  },
  { property: 'og:type', content: 'website' },
]

export default function AboutPage(): JSX.Element {
  return <h1>This is the About page</h1>
}
