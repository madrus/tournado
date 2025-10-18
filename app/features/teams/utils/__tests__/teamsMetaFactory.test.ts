import { describe, expect, it } from 'vitest'

import { createTeamsMeta } from '../teamsMetaFactory'

describe('teamsMetaFactory - createTeamsMeta', () => {
  describe('Public Context', () => {
    const publicMeta = createTeamsMeta('public')

    it('should return an array of meta descriptors', () => {
      expect(Array.isArray(publicMeta)).toBe(true)
      expect(publicMeta.length).toBeGreaterThan(0)
    })

    it('should include public page title', () => {
      const titleMeta = publicMeta.find(meta => 'title' in meta)
      expect(titleMeta).toBeDefined()
      if (titleMeta && 'title' in titleMeta) {
        expect(titleMeta.title).toBe('Teams | Tournado')
      }
    })

    it('should include meta description tag', () => {
      const descriptionMeta = publicMeta.find(
        meta => 'name' in meta && meta.name === 'description'
      )
      expect(descriptionMeta).toBeDefined()
      if (descriptionMeta && 'content' in descriptionMeta) {
        expect(descriptionMeta.content).toContain('View all tournament teams')
        expect(descriptionMeta.content).toContain('Browse teams participating')
      }
    })

    it('should include Open Graph title', () => {
      const ogTitle = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:title'
      )
      expect(ogTitle).toBeDefined()
      if (ogTitle && 'content' in ogTitle) {
        expect(ogTitle.content).toBe('Teams | Tournado')
      }
    })

    it('should include Open Graph description', () => {
      const ogDescription = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:description'
      )
      expect(ogDescription).toBeDefined()
      if (ogDescription && 'content' in ogDescription) {
        expect(ogDescription.content).toContain('View all tournament teams')
        expect(ogDescription.content).toContain('create new teams to join competitions')
      }
    })

    it('should include Open Graph type', () => {
      const ogType = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:type'
      )
      expect(ogType).toBeDefined()
      if (ogType && 'content' in ogType) {
        expect(ogType.content).toBe('website')
      }
    })

    it('should return exactly 5 meta descriptors', () => {
      expect(publicMeta).toHaveLength(5)
    })

    it('should not contain admin-specific content', () => {
      const metaString = JSON.stringify(publicMeta)
      expect(metaString).not.toContain('Admin')
      expect(metaString).not.toContain('admin')
      expect(metaString).not.toContain('Manage all teams')
    })
  })

  describe('Admin Context', () => {
    const adminMeta = createTeamsMeta('admin')

    it('should return an array of meta descriptors', () => {
      expect(Array.isArray(adminMeta)).toBe(true)
      expect(adminMeta.length).toBeGreaterThan(0)
    })

    it('should include admin page title', () => {
      const titleMeta = adminMeta.find(meta => 'title' in meta)
      expect(titleMeta).toBeDefined()
      if (titleMeta && 'title' in titleMeta) {
        expect(titleMeta.title).toBe('Team Management | Admin | Tournado')
      }
    })

    it('should include meta description tag with admin context', () => {
      const descriptionMeta = adminMeta.find(
        meta => 'name' in meta && meta.name === 'description'
      )
      expect(descriptionMeta).toBeDefined()
      if (descriptionMeta && 'content' in descriptionMeta) {
        expect(descriptionMeta.content).toContain('Manage all teams in the system')
        expect(descriptionMeta.content).toContain('View, edit, delete teams')
      }
    })

    it('should include Open Graph title with admin context', () => {
      const ogTitle = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:title'
      )
      expect(ogTitle).toBeDefined()
      if (ogTitle && 'content' in ogTitle) {
        expect(ogTitle.content).toBe('Team Management | Admin | Tournado')
      }
    })

    it('should include Open Graph description with admin context', () => {
      const ogDescription = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:description'
      )
      expect(ogDescription).toBeDefined()
      if (ogDescription && 'content' in ogDescription) {
        expect(ogDescription.content).toContain('Manage all teams in the system')
        expect(ogDescription.content).toContain('oversee tournament participation')
      }
    })

    it('should include Open Graph type', () => {
      const ogType = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:type'
      )
      expect(ogType).toBeDefined()
      if (ogType && 'content' in ogType) {
        expect(ogType.content).toBe('website')
      }
    })

    it('should return exactly 5 meta descriptors', () => {
      expect(adminMeta).toHaveLength(5)
    })

    it('should contain admin-specific content', () => {
      const metaString = JSON.stringify(adminMeta)
      expect(metaString).toContain('Admin')
      expect(metaString).toContain('Manage all teams')
      expect(metaString).toContain('View, edit, delete')
    })
  })

  describe('Context Differences', () => {
    const publicMeta = createTeamsMeta('public')
    const adminMeta = createTeamsMeta('admin')

    it('should return different titles for different contexts', () => {
      const publicTitle = publicMeta.find(meta => 'title' in meta)
      const adminTitle = adminMeta.find(meta => 'title' in meta)

      expect(publicTitle).toBeDefined()
      expect(adminTitle).toBeDefined()

      if (
        publicTitle &&
        'title' in publicTitle &&
        adminTitle &&
        'title' in adminTitle
      ) {
        expect(publicTitle.title).not.toBe(adminTitle.title)
        expect(publicTitle.title).toBe('Teams | Tournado')
        expect(adminTitle.title).toBe('Team Management | Admin | Tournado')
      }
    })

    it('should return different descriptions for different contexts', () => {
      const publicDesc = publicMeta.find(
        meta => 'name' in meta && meta.name === 'description'
      )
      const adminDesc = adminMeta.find(
        meta => 'name' in meta && meta.name === 'description'
      )

      expect(publicDesc).toBeDefined()
      expect(adminDesc).toBeDefined()

      if (
        publicDesc &&
        'content' in publicDesc &&
        adminDesc &&
        'content' in adminDesc
      ) {
        expect(publicDesc.content).not.toBe(adminDesc.content)
        expect(publicDesc.content).toContain('View all tournament teams')
        expect(adminDesc.content).toContain('Manage all teams in the system')
      }
    })

    it('should return different Open Graph titles for different contexts', () => {
      const publicOgTitle = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:title'
      )
      const adminOgTitle = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:title'
      )

      expect(publicOgTitle).toBeDefined()
      expect(adminOgTitle).toBeDefined()

      if (
        publicOgTitle &&
        'content' in publicOgTitle &&
        adminOgTitle &&
        'content' in adminOgTitle
      ) {
        expect(publicOgTitle.content).not.toBe(adminOgTitle.content)
      }
    })

    it('should return different Open Graph descriptions for different contexts', () => {
      const publicOgDesc = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:description'
      )
      const adminOgDesc = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:description'
      )

      expect(publicOgDesc).toBeDefined()
      expect(adminOgDesc).toBeDefined()

      if (
        publicOgDesc &&
        'content' in publicOgDesc &&
        adminOgDesc &&
        'content' in adminOgDesc
      ) {
        expect(publicOgDesc.content).not.toBe(adminOgDesc.content)
      }
    })

    it('should have same Open Graph type for both contexts', () => {
      const publicOgType = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:type'
      )
      const adminOgType = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:type'
      )

      expect(publicOgType).toBeDefined()
      expect(adminOgType).toBeDefined()

      if (
        publicOgType &&
        'content' in publicOgType &&
        adminOgType &&
        'content' in adminOgType
      ) {
        expect(publicOgType.content).toBe(adminOgType.content)
        expect(publicOgType.content).toBe('website')
      }
    })

    it('should return same number of meta descriptors for both contexts', () => {
      expect(publicMeta.length).toBe(adminMeta.length)
      expect(publicMeta.length).toBe(5)
    })
  })

  describe('Meta Structure', () => {
    it('should return valid MetaDescriptor structure for public', () => {
      const publicMeta = createTeamsMeta('public')

      publicMeta.forEach(meta => {
        // Each meta should be an object
        expect(typeof meta).toBe('object')
        expect(meta).not.toBeNull()

        // Should have at least one of: title, name, property
        const hasValidKey = 'title' in meta || 'name' in meta || 'property' in meta

        expect(hasValidKey).toBe(true)

        // If it has name or property, it should have content
        if ('name' in meta || 'property' in meta) {
          expect('content' in meta).toBe(true)
          if ('content' in meta && typeof meta.content === 'string') {
            expect(meta.content.length).toBeGreaterThan(0)
          }
        }
      })
    })

    it('should return valid MetaDescriptor structure for admin', () => {
      const adminMeta = createTeamsMeta('admin')

      adminMeta.forEach(meta => {
        expect(typeof meta).toBe('object')
        expect(meta).not.toBeNull()

        const hasValidKey = 'title' in meta || 'name' in meta || 'property' in meta

        expect(hasValidKey).toBe(true)

        if ('name' in meta || 'property' in meta) {
          expect('content' in meta).toBe(true)
          if ('content' in meta && typeof meta.content === 'string') {
            expect(meta.content.length).toBeGreaterThan(0)
          }
        }
      })
    })

    it('should not include empty strings in any meta content', () => {
      const publicMeta = createTeamsMeta('public')
      const adminMeta = createTeamsMeta('admin')

      const allMeta = [...publicMeta, ...adminMeta]

      allMeta.forEach(meta => {
        if ('title' in meta && typeof meta.title === 'string') {
          expect(meta.title).not.toBe('')
        }
        if ('content' in meta && typeof meta.content === 'string') {
          expect(meta.content).not.toBe('')
        }
      })
    })
  })

  describe('Branding Consistency', () => {
    it('should include "Tournado" branding in public titles', () => {
      const publicMeta = createTeamsMeta('public')
      const titleMeta = publicMeta.find(meta => 'title' in meta)
      const ogTitle = publicMeta.find(
        meta => 'property' in meta && meta.property === 'og:title'
      )

      if (titleMeta && 'title' in titleMeta) {
        expect(titleMeta.title).toContain('Tournado')
      }
      if (ogTitle && 'content' in ogTitle) {
        expect(ogTitle.content).toContain('Tournado')
      }
    })

    it('should include "Tournado" branding in admin titles', () => {
      const adminMeta = createTeamsMeta('admin')
      const titleMeta = adminMeta.find(meta => 'title' in meta)
      const ogTitle = adminMeta.find(
        meta => 'property' in meta && meta.property === 'og:title'
      )

      if (titleMeta && 'title' in titleMeta) {
        expect(titleMeta.title).toContain('Tournado')
      }
      if (ogTitle && 'content' in ogTitle) {
        expect(ogTitle.content).toContain('Tournado')
      }
    })

    it('should use consistent separator in multi-part titles', () => {
      const adminMeta = createTeamsMeta('admin')
      const titleMeta = adminMeta.find(meta => 'title' in meta)

      if (titleMeta && 'title' in titleMeta) {
        expect(titleMeta.title).toContain('|')
        expect(titleMeta.title).toBe('Team Management | Admin | Tournado')
      }
    })
  })
})
