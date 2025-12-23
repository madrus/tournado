import type { JSX } from 'react'
import { Form, Link, useActionData, useFetcher, useNavigation } from 'react-router'

import { ActionButton } from '~/components/buttons/ActionButton'
import { TextInputField } from '~/components/inputs/TextInputField'
import type { CompetitionGroupStageDetailsActionData } from '~/features/competition/types'
import type { GroupStageWithDetails, UnassignedTeam } from '~/models/group.server'

type CompetitionGroupStageDetailsProps = {
	readonly groupStage: GroupStageWithDetails
	readonly availableTeams: readonly UnassignedTeam[]
	readonly tournamentId: string
}

export function CompetitionGroupStageDetails({
	groupStage,
	availableTeams,
	tournamentId,
}: CompetitionGroupStageDetailsProps): JSX.Element {
	const actionData = useActionData<CompetitionGroupStageDetailsActionData>()
	const reserveFetcher = useFetcher<CompetitionGroupStageDetailsActionData>()
	const navigation = useNavigation()

	const isSubmitting = navigation.state === 'submitting'

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='font-bold text-2xl'>{groupStage.name}</h2>
					<p className='mt-1 text-foreground-light'>Manage team assignments</p>
				</div>
				<Link
					to={`/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups?tournament=${tournamentId}`}
					className='text-primary-600 underline'
				>
					Back to Groups
				</Link>
			</div>

			{actionData?.error ? (
				<div className='rounded-md bg-red-50 p-4 text-red-700'>{actionData.error}</div>
			) : null}

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<div className='space-y-4 lg:col-span-2'>
					{groupStage.groups.map((group) => (
						<div key={group.id} className='rounded-lg border border-border p-4'>
							<h3 className='font-semibold text-lg'>{group.name}</h3>
							<div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
								{group.slots.map((slot) => (
									<div key={slot.id} className='rounded-md border border-border p-3'>
										{slot.team ? (
											<div className='space-y-2'>
												<div className='text-sm'>
													<span className='font-medium'>{slot.team.clubName}</span>{' '}
													<span className='text-foreground-light'>
														{slot.team.name} ({slot.team.category})
													</span>
												</div>
												<Form method='post' className='flex gap-2'>
													<input type='hidden' name='intent' value='clear' />
													<input type='hidden' name='groupSlotId' value={slot.id} />
													<ActionButton
														type='submit'
														variant='secondary'
														disabled={isSubmitting}
													>
														Clear
													</ActionButton>
												</Form>
											</div>
										) : (
											<div className='space-y-2'>
												<Form method='post' className='space-y-2'>
													<input type='hidden' name='intent' value='assign' />
													<input type='hidden' name='groupId' value={group.id} />
													<input
														type='hidden'
														name='slotIndex'
														value={slot.slotIndex}
													/>
													<TextInputField
														name='teamId'
														label='Assign team'
														placeholder='Paste team ID'
														required
													/>
													<ActionButton
														type='submit'
														variant='primary'
														disabled={isSubmitting}
													>
														Assign
													</ActionButton>
												</Form>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				<div className='space-y-4'>
					<div className='rounded-lg border border-border p-4'>
						<h3 className='font-semibold text-lg'>Reserve</h3>
						<div className='mt-3 space-y-2'>
							{groupStage.reserveSlots.length === 0 ? (
								<p className='text-foreground-light text-sm'>No teams in reserve</p>
							) : (
								groupStage.reserveSlots.map((slot) => (
									<div key={slot.id} className='flex items-center justify-between'>
										<div className='text-sm'>
											{slot.team ? (
												<>
													<span className='font-medium'>{slot.team.clubName}</span>{' '}
													<span className='text-foreground-light'>
														{slot.team.name} ({slot.team.category})
													</span>
												</>
											) : (
												<span className='text-foreground-light'>Empty</span>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>

					<div className='rounded-lg border border-border p-4'>
						<h3 className='font-semibold text-lg'>Available teams</h3>
						<div className='mt-3 space-y-2'>
							{availableTeams.length === 0 ? (
								<p className='text-foreground-light text-sm'>No unassigned teams</p>
							) : (
								availableTeams.map((team) => (
									<div key={team.id} className='flex items-center justify-between'>
										<div className='text-sm'>
											<span className='font-medium'>{team.clubName}</span>{' '}
											<span className='text-foreground-light'>
												{team.name} ({team.category})
											</span>
										</div>
										<reserveFetcher.Form method='post'>
											<input type='hidden' name='intent' value='reserve' />
											<input type='hidden' name='teamId' value={team.id} />
											<ActionButton
												type='submit'
												variant='secondary'
												disabled={isSubmitting}
											>
												Move to reserve
											</ActionButton>
										</reserveFetcher.Form>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
