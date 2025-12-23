import type { Category } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, useNavigate, useNavigation } from 'react-router'

import { ActionButton } from '~/components/buttons/ActionButton'
import { Checkbox } from '~/components/inputs/Checkbox'
import { TextInputField } from '~/components/inputs/TextInputField'

type CompetitionGroupStageFormProps = {
	tournament: {
		id: string
		name: string
		categories: readonly Category[]
	}
	availableTeamsCount: Record<Category, number>
	actionData?: {
		errors?: {
			name?: string
			categories?: string
			configGroups?: string
			configSlots?: string
			general?: string
		}
		fieldValues?: {
			name: string
			categories: string[]
			configGroups: string
			configSlots: string
			autoFill: boolean
		}
	}
}

export function CompetitionGroupStageForm({
	tournament,
	availableTeamsCount,
	actionData,
}: Readonly<CompetitionGroupStageFormProps>): JSX.Element {
	const navigation = useNavigation()
	const { t } = useTranslation()
	const navigate = useNavigate()

	const isSubmitting = navigation.state === 'submitting'

	// Calculate total teams for selected categories
	const selectedCategories = actionData?.fieldValues?.categories || []
	const totalSelectedTeams = selectedCategories.reduce(
		(sum, category) => sum + (availableTeamsCount[category as Category] || 0),
		0,
	)

	return (
		<div className='space-y-8'>
			<div>
				<h2 className='font-bold text-2xl'>{t('competition.createGroupStage')}</h2>
				<p className='mt-2 text-slate-600'>
					{t('competition.createGroupStageDescription', {
						tournamentName: tournament.name,
					})}
				</p>
			</div>

			<div className='max-w-2xl'>
				<Form method='post' className='space-y-6'>
					{actionData?.errors?.general ? (
						<div className='rounded-md bg-red-50 p-4'>
							<p className='text-red-700 text-sm'>{actionData.errors.general}</p>
						</div>
					) : null}

					{/* Group Stage Name */}
					<TextInputField
						name='name'
						label={t('competition.groupStage.name')}
						placeholder={t('competition.groupStage.namePlaceholder')}
						defaultValue={actionData?.fieldValues?.name || ''}
						error={actionData?.errors?.name}
						required
					/>

					{/* Categories Selection */}
					<div>
						<h3 className='mb-3 block font-medium text-sm text-slate-700 dark:text-slate-300'>
							{t('competition.groupStage.ageCategories')}
						</h3>
						<p className='mb-3 text-sm text-slate-500 dark:text-slate-400'>
							{t('competition.groupStage.ageCategoriesDescription')}
						</p>
						<div className='space-y-2'>
							{tournament.categories.map((category) => {
								const checkboxId = `category-${category}`
								return (
									<label
										key={category}
										htmlFor={checkboxId}
										className='flex items-center gap-2 cursor-pointer'
									>
										<Checkbox
											id={checkboxId}
											name='categories'
											value={category}
											defaultChecked={actionData?.fieldValues?.categories?.includes(
												category,
											)}
											accentColor='fuchsia'
										/>
										<span className='font-medium text-sm'>{category}</span>
										<span className='text-xs text-slate-700 dark:text-slate-300'>
											(
											{t('competition.groupStage.teamsAvailable', {
												count: availableTeamsCount[category],
											})}
											)
										</span>
									</label>
								)
							})}
						</div>
						{actionData?.errors?.categories ? (
							<p className='mt-1 text-red-600 text-sm'>
								{actionData.errors.categories}
							</p>
						) : null}
					</div>

					{/* Configuration */}
					<div className='grid grid-cols-2 gap-2'>
						<TextInputField
							name='configGroups'
							label={t('competition.groupStage.configGroups')}
							type='text'
							placeholder={t('competition.groupStage.configGroupsPlaceholder')}
							defaultValue={actionData?.fieldValues?.configGroups || ''}
							error={actionData?.errors?.configGroups}
							required
						/>

						<TextInputField
							name='configSlots'
							label={t('competition.groupStage.configSlots')}
							type='text'
							placeholder={t('competition.groupStage.configSlotsPlaceholder')}
							defaultValue={actionData?.fieldValues?.configSlots || ''}
							error={actionData?.errors?.configSlots}
							required
						/>
					</div>

					{/* Auto-fill Option */}
					<div>
						<label
							htmlFor='autoFill-checkbox'
							className='flex items-start gap-2 cursor-pointer'
						>
							<Checkbox
								id='autoFill-checkbox'
								name='autoFill'
								defaultChecked={actionData?.fieldValues?.autoFill ?? true}
								accentColor='fuchsia'
								className='mt-1'
							/>
							<div>
								<span className='font-medium text-sm'>
									{t('competition.groupStage.autoFillGroups')}
								</span>
								<p className='text-xs text-slate-500 dark:text-slate-400'>
									{t('competition.groupStage.autoFillDescription')}
								</p>
							</div>
						</label>
					</div>

					{/* Summary */}
					{selectedCategories.length > 0 ? (
						<div className='rounded-lg bg-blue-50 p-4'>
							<h4 className='font-medium text-blue-900 text-sm'>
								{t('competition.groupStage.summary')}
							</h4>
							<p className='mt-1 text-blue-700 text-xs'>
								{t('competition.groupStage.summaryTeamsAvailable', {
									count: totalSelectedTeams,
								})}
							</p>
							{actionData?.fieldValues?.configGroups &&
							actionData?.fieldValues?.configSlots ? (
								<p className='text-blue-700 text-xs'>
									{t('competition.groupStage.summaryWillCreate', {
										groups: actionData.fieldValues.configGroups,
										slots: actionData.fieldValues.configSlots,
										total:
											parseInt(actionData.fieldValues.configGroups, 10) *
											parseInt(actionData.fieldValues.configSlots, 10),
									})}
								</p>
							) : null}
						</div>
					) : null}

					{/* Actions */}
					<div className='flex justify-end gap-2'>
						<ActionButton
							type='button'
							variant='secondary'
							onClick={() => navigate(-1)}
						>
							{t('common.actions.cancel')}
						</ActionButton>
						<ActionButton type='submit' variant='primary' disabled={isSubmitting}>
							{isSubmitting ? t('common.actions.creating') : t('common.actions.create')}
						</ActionButton>
					</div>
				</Form>
			</div>
		</div>
	)
}
