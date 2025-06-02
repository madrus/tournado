/**
 * @fileoverview
 * This file contains the types for the library.
 */
import type { Team as PrismaTeam } from '@prisma/client'

// TeamName type should have the following format:
// e.g. "JO8-1"
// J = Jongens (boys), M = Meisjes (girls), JM = Jongens e Meisjes (boys and girls)
// O = onder (age group)
// 8 = age group
// 1 = team class or number
export type TeamName = `${'J' | 'M' | 'JM'}${'O'}${number}-${number}`

// TeamClass type should have the following format:
// e.g. "1ste klasse", "2de klasse", "3de klasse"
export type TeamClass = string

export type Tournament = {
  id: string
  name: string
  location: string
  date: Date
}

// rollen:
// - Admin = admin
// - Toernooibeheerder = organiser
// - Scheidsrechter coordinator = coordinator
//   - kan scores voor alle wedstrijden invullen
// - Scheidsrechter = referee
//   - kan scores voor zijn eigen wedstrijden invullen
// - Public = readonly <-- geen expliciete rol nodig
//   - kan geen uitslagen invullen

// JO7-1
//   - JO7 = leeftijdscategorie
//   - 1 = teamnummer in de leeftijdscategorie

/**
 * Als gebruiker van de Tournado App wil ik een inschrijving doen van mijn club.
 * Ik wil meerdere teams kunnen inschrijven voor een toernooi.
 *
 * De volgende gegevens moeten meegegeven kunnen worden bij de inschrijving:
 * - Korte tekst bovenaan het formulier (Welk toernooi, plaats, datum, enz.).
 * - Clubnaam (verplicht) (via API Club logo en basisgegevens ophalen).
 * - Teamnaam (verplicht).
 * - Teamklasse (verplicht).
 * - Naam teamleider (verplicht) = contactpersoon.
 * - Telefoon teamleider (verplicht).
 * - Email teamleider (verplicht).
 * - Knop om nog een team in te schrijven.
 * - Afvink box om akkoord te gaan met privacy beleid van ons (verplicht).
 * - Een bevestiging van inschrijving via de mail krijg.
 */

// Complete Team type including all fields
export type Team = PrismaTeam

// Email type matching basic e-mail pattern: local@domain.tld
export type Email = `${string}@${string}.${string}`

// Type for form input
export type TeamFormData = {
  tournamentId: string // which tournament the team is registering for
  clubName: string // via API Club -- logo en basisgegevens ophalen
  teamName: TeamName
  teamClass: TeamClass
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: Email
  privacyAgreement: boolean
}
