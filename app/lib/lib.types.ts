/**
 * @fileoverview
 * This file contains the types for the library.
 */

export type TeamLeader = {
  id: string
  name: string
  phone: string
  email: string
}

// TeamClass type should have the following format:
// e.g. "JO8-1"
// J = Jongens (boys) or M = Meisjes (girls)
// O = Over (age group)
// 8 = age group
// 1 = team number
// how can I create a type for this?
export type TeamClass = `${'J' | 'M'}${'O' | 'U'}${number}-${number}`

export type Tournament = {
  id: string
  name: string
  location: string
  date: Date
}

/**
 * Als gebruiker van de Tournado App wil ik een inschrijving doen van mijn club.
 * Ik wil meerdere teams kunnen inschrijven voor een toernooi.
 *
 * De volgende gegevens moeten meegegeven kunnen worden bij de inschrijving:
 * - Korte tekst bovenaan het formulier (Welk toernooi, plaats, datum, enz.).
 * - Clubnaam (verplicht) (via API Club logo en basisgegevens ophalen).
 * - Teamnaam (verplicht).
 * - Teamklasse (verplicht).
 * - Naam teamleider (verplicht).
 * - Telefoon teamleider (verplicht).
 * - Email teamleider (verplicht).
 * - Knop om nog een team in te schrijven.
 * - Afvink box om akkoord te gaan met privacy beleid van ons (verplicht).
 * - Een bevestiging van inschrijving via de mail krijg.
 */

// Complete Team type including all fields
export type Team = {
  id: string
  // leaderId: string
  teamName: string
  teamClass: string
  // createdAt: Date
  // updatedAt: Date
}

// Type for form input
export type TeamFormData = {
  clubName: string // via API Club logo en basisgegevens ophalen
  teamName: string
  teamClass: TeamClass
}
