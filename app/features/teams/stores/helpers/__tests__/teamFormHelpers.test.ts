import { describe, expect, it } from 'vitest'

import { TEAM_PANELS_FIELD_MAP } from '../teamFormConstants'
import {
	computeAvailableOptions,
	getDependentFieldResets,
	getPanelNumberForField,
	isFormDirty,
	isPanelComplete,
	isPanelEnabled,
	isPanelValid,
	mapFlexibleToFormData,
	mergeErrors,
	resetStatePreserving,
	shouldValidateField,
} from '../teamFormHelpers'
import type { FormFields } from '../teamFormTypes'

const mockFormFields: FormFields = {
	tournamentId: 't1',
	division: 'd1',
	category: 'c1',
	clubName: 'Club',
	name: 'Team',
	teamLeaderName: 'Leader',
	teamLeaderPhone: '123',
	teamLeaderEmail: 'a@b.com',
	privacyAgreement: true,
}

const mockTournament: import('~/features/tournaments/types').TournamentData = {
	id: 't1',
	name: 'Tournament 1',
	location: 'Loc',
	startDate: '2024-01-01',
	endDate: null,
	divisions: ['d1'],
	categories: ['c1'],
}

describe('lib.store', () => {
	it('isPanelValid returns true for valid panel', () => {
		const fields = {
			...mockFormFields,
			tournamentId: 't1',
			division: 'd1',
			category: 'c1',
		}
		expect(isPanelValid(1, fields, {}, 'create')).toBe(true)
	})
	it('isPanelValid returns false for missing field', () => {
		const fields = {
			...mockFormFields,
			tournamentId: '',
			division: 'd1',
			category: 'c1',
		}
		expect(isPanelValid(1, fields, {}, 'create')).toBe(false)
	})
	it('isPanelEnabled returns true for panel 1', () => {
		expect(isPanelEnabled(1, 'create', () => true)).toBe(true)
	})
	it('isPanelEnabled returns false for panel 2 if previous panel invalid', () => {
		expect(isPanelEnabled(2, 'create', () => false)).toBe(false)
	})
	it('isFormDirty returns true if fields differ', () => {
		expect(isFormDirty(mockFormFields, { ...mockFormFields, clubName: 'Other' })).toBe(true)
	})
	it('isFormDirty returns false if fields are the same', () => {
		expect(isFormDirty(mockFormFields, { ...mockFormFields })).toBe(false)
	})
	it('computeAvailableOptions returns correct divisions/categories', () => {
		const tournaments = [
			{
				id: 't1',
				name: 'Tournament 1',
				location: 'Loc',
				startDate: '2024-01-01',
				endDate: null,
				divisions: ['d1'],
				categories: ['c1'],
			},
		]
		expect(computeAvailableOptions(tournaments, 't1')).toEqual({
			divisions: ['d1'],
			categories: ['c1'],
		})
	})
	it('computeAvailableOptions returns empty arrays if not found', () => {
		expect(computeAvailableOptions([], 't1')).toEqual({
			divisions: [],
			categories: [],
		})
	})
	it('getDependentFieldResets resets division/category for tournamentId', () => {
		expect(getDependentFieldResets('tournamentId')).toEqual({
			division: '',
			category: '',
		})
	})
	it('getDependentFieldResets resets category for division', () => {
		expect(getDependentFieldResets('division')).toEqual({ category: '' })
	})
	it('getDependentFieldResets returns empty for other fields', () => {
		expect(getDependentFieldResets('clubName')).toEqual({})
	})
	it('mergeErrors merges and prioritizes server errors', () => {
		expect(
			mergeErrors({ name: 'client error' }, { name: 'server error', clubName: 'another error' }),
		).toEqual({ name: 'server error', clubName: 'another error' })
	})
	it('isPanelComplete returns true if all fields are blurred and valid', () => {
		const blurred = Object.fromEntries(TEAM_PANELS_FIELD_MAP[1].map((f) => [f, true]))
		const displayErrors = {}
		expect(isPanelComplete(1, mockFormFields, blurred, displayErrors)).toBe(true)
	})
	it('isPanelComplete returns false if not all fields are blurred', () => {
		const blurred = Object.fromEntries(TEAM_PANELS_FIELD_MAP[1].map((f) => [f, false]))
		const displayErrors = {}
		expect(isPanelComplete(1, mockFormFields, blurred, displayErrors)).toBe(false)
	})
	it('mapFlexibleToFormData maps provided fields', () => {
		expect(mapFlexibleToFormData({ clubName: 'X' })).toEqual({ clubName: 'X' })
	})
	it('mapFlexibleToFormData ignores undefined fields', () => {
		expect(mapFlexibleToFormData({})).toEqual({})
	})
	it('getPanelNumberForField returns correct panel number', () => {
		expect(getPanelNumberForField('tournamentId')).toBe(1)
		expect(getPanelNumberForField('clubName')).toBe(2)
		expect(getPanelNumberForField('teamLeaderName')).toBe(3)
		expect(getPanelNumberForField('privacyAgreement')).toBe(4)
	})
	it('getPanelNumberForField returns 0 for unknown field', () => {
		expect(getPanelNumberForField('notAField' as keyof FormFields)).toBe(0)
	})
})

describe('shouldValidateField', () => {
	const validation = {
		errors: {},
		displayErrors: {},
		blurredFields: { clubName: false, name: false },
		serverErrors: {},
		submitAttempted: false,
		forceShowAllErrors: false,
	}
	it('returns true if field is blurred', () => {
		expect(
			shouldValidateField('clubName', {
				...validation,
				blurredFields: { clubName: true },
			}),
		).toBe(true)
	})
	it('returns true if forceShowAllErrors is true', () => {
		expect(
			shouldValidateField('clubName', {
				...validation,
				forceShowAllErrors: true,
			}),
		).toBe(true)
	})
	it('returns true if submitAttempted is true', () => {
		expect(shouldValidateField('clubName', { ...validation, submitAttempted: true })).toBe(true)
	})
	it('returns false if none are true', () => {
		expect(shouldValidateField('clubName', validation)).toBe(false)
	})
})

describe('resetStatePreserving', () => {
	const get = () => ({
		formFields: {
			tournamentId: 't1',
			division: 'd1',
			category: 'c1',
			clubName: 'Club',
			name: 'Team',
			teamLeaderName: 'Leader',
			teamLeaderPhone: '123',
			teamLeaderEmail: 'a@b.com',
			privacyAgreement: true,
		},
		oldFormFields: {
			tournamentId: 't2',
			division: 'd2',
			category: 'c2',
			clubName: 'Other',
			name: 'OtherTeam',
			teamLeaderName: 'OtherLeader',
			teamLeaderPhone: '456',
			teamLeaderEmail: 'c@d.com',
			privacyAgreement: false,
		},
		validation: {
			errors: {},
			displayErrors: {},
			blurredFields: {},
			serverErrors: {},
			submitAttempted: false,
			forceShowAllErrors: false,
		},
		formMeta: { mode: 'create' as const, isSubmitting: false, isValid: false },
		availableOptions: {
			tournaments: [mockTournament],
			divisions: [],
			categories: [],
		},
	})
	it('preserves specified keys', () => {
		const result = resetStatePreserving(['availableOptions'], get)
		expect(result.availableOptions).toEqual({
			tournaments: [mockTournament],
			divisions: [],
			categories: [],
		})
		expect(result.formFields).toEqual({
			tournamentId: '',
			division: '',
			category: '',
			clubName: '',
			name: '',
			teamLeaderName: '',
			teamLeaderPhone: '',
			teamLeaderEmail: '',
			privacyAgreement: false,
		})
	})
	it('preserves multiple keys', () => {
		const result = resetStatePreserving(['availableOptions', 'formFields'], get)
		expect(result.availableOptions).toEqual({
			tournaments: [mockTournament],
			divisions: [],
			categories: [],
		})
		expect(result.formFields).toEqual({
			tournamentId: 't1',
			division: 'd1',
			category: 'c1',
			clubName: 'Club',
			name: 'Team',
			teamLeaderName: 'Leader',
			teamLeaderPhone: '123',
			teamLeaderEmail: 'a@b.com',
			privacyAgreement: true,
		})
	})
	it('returns initial state for other keys', () => {
		const result = resetStatePreserving([], get)
		expect(result.formFields).toEqual({
			tournamentId: '',
			division: '',
			category: '',
			clubName: '',
			name: '',
			teamLeaderName: '',
			teamLeaderPhone: '',
			teamLeaderEmail: '',
			privacyAgreement: false,
		})
		expect(result.availableOptions).toEqual({
			tournaments: [],
			divisions: [],
			categories: [],
		})
	})
})
