export type CompetitionGroupStageActionData = {
	readonly errors?: {
		name?: string
		categories?: string
		configGroups?: string
		configSlots?: string
		general?: string
	}
	readonly fieldValues?: {
		name: string
		categories: string[]
		configGroups: string
		configSlots: string
		autoFill: boolean
	}
}

export type CompetitionGroupStageDetailsActionData = {
	readonly error?: string
}
