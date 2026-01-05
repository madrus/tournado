import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	type MeasuringConfiguration,
	MeasuringStrategy,
	PointerSensor,
	pointerWithin,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker, useFetcher } from 'react-router'
import { z } from 'zod'

import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { useMediaQuery } from '~/hooks/useMediaQuery'

import { useGroupStageDnd } from '../hooks/useGroupStageDnd'
import {
	getConfirmedCapacity,
	getWaitlistTeams,
} from '../stores/helpers/groupAssignmentStoreHelpers'
import {
	useGroupAssignmentActions,
	useGroupAssignmentSnapshot,
	useGroupAssignmentStatus,
	useGroupAssignmentUiState,
} from '../stores/useGroupAssignmentStore'
import type { GroupAssignmentSnapshot } from '../utils/groupStageDnd'
import { ConfirmedPool } from './ConfirmedPool'
import { DragOverlayChip } from './DraggableTeamChip'
import { GroupCard } from './GroupCard'
import {
	actionButtonGroupVariants,
	errorBannerVariants,
	groupTabVariants,
	heroStripVariants,
	paginationDotVariants,
} from './groupAssignment.variants'
import { WaitlistPool } from './WaitlistPool'

type GroupAssignmentBoardProps = {
	initialSnapshot: GroupAssignmentSnapshot
	tournamentId: string
}

const FetcherResponseSchema = z.object({
	success: z.boolean().optional(),
	error: z.string().optional(),
	conflict: z.boolean().optional(),
})

type FetcherResponse = z.infer<typeof FetcherResponseSchema>

// Configure measuring to improve DragOverlay positioning
const measuring: MeasuringConfiguration = {
	droppable: {
		strategy: MeasuringStrategy.Always,
	},
}

export function GroupAssignmentBoard({
	initialSnapshot,
	tournamentId,
}: GroupAssignmentBoardProps): JSX.Element {
	const { t } = useTranslation()
	const fetcher = useFetcher()
	const [showConflictDialog, setShowConflictDialog] = useState(false)
	const [isProceedingNavigation, setIsProceedingNavigation] = useState(false)

	// Store state
	const snapshot = useGroupAssignmentSnapshot()
	const { isDirty } = useGroupAssignmentStatus()
	const { isSaving, saveError, hasConflict, activeGroupIndex } =
		useGroupAssignmentUiState()
	const {
		setSnapshotPair,
		resetSnapshotPair,
		markAsSaved,
		setActiveGroupIndex,
		setSaving,
		setSaveError,
		setConflict,
	} = useGroupAssignmentActions()

	// DnD hook
	const {
		activeDragTeam,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useGroupStageDnd()

	// Initialize store from loader data
	useEffect(() => {
		setSnapshotPair(initialSnapshot)
	}, [initialSnapshot, setSnapshotPair])

	// Handle conflict dialog
	useEffect(() => {
		if (hasConflict) {
			setShowConflictDialog(true)
		}
	}, [hasConflict])

	// Configure DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 8,
			},
		}),
		useSensor(KeyboardSensor),
	)

	// Block navigation if dirty
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			isDirty && currentLocation.pathname !== nextLocation.pathname,
	)

	// Reset navigation proceeding flag when blocker state changes
	useEffect(() => {
		if (blocker.state !== 'blocked') {
			setIsProceedingNavigation(false)
		}
	}, [blocker.state])

	// Handle fetcher response
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			setSaving(false)

			const parsed = FetcherResponseSchema.safeParse(fetcher.data)
			if (!parsed.success) {
				setSaveError('Unexpected server response')
				return
			}

			const data: FetcherResponse = parsed.data

			if (data.conflict) {
				setConflict(true)
			} else if (data.error) {
				setSaveError(data.error)
			} else if (data.success) {
				// Mark current state as saved (resets dirty flag)
				markAsSaved()
				setSaveError(null)
			}
		}
	}, [fetcher.state, fetcher.data, markAsSaved, setSaving, setSaveError, setConflict])

	// Handle save
	const handleSave = useCallback(() => {
		if (!snapshot) return

		setSaving(true)
		setSaveError(null)

		// Build slot assignments from snapshot
		const assignments = snapshot.groups.flatMap((group) =>
			group.slots
				.filter(
					(slot): slot is typeof slot & { team: NonNullable<typeof slot.team> } =>
						slot.team !== null,
				)
				.map((slot) => ({
					groupId: group.id,
					slotIndex: slot.slotIndex,
					teamId: slot.team.id,
				})),
		)

		fetcher.submit(
			{
				intent: 'save',
				groupStageId: snapshot.groupStageId,
				tournamentId,
				updatedAt: snapshot.updatedAt,
				assignments: JSON.stringify(assignments),
			},
			{
				method: 'POST',
				action: '/resources/competition/group-assignments',
			},
		)
	}, [snapshot, tournamentId, fetcher, setSaving, setSaveError])

	// Handle cancel
	const handleCancel = useCallback(() => {
		resetSnapshotPair()
	}, [resetSnapshotPair])

	// Handle conflict reload
	const handleConflictReload = useCallback(() => {
		setShowConflictDialog(false)
		setConflict(false)
		window.location.reload()
	}, [setConflict])

	// Responsive layout detection
	const isMobile = useMediaQuery('(max-width: 1023px)')

	if (!snapshot) {
		return (
			<div className='flex items-center justify-center p-8'>
				<span className='text-foreground-light'>{t('common.loading')}</span>
			</div>
		)
	}

	const waitlistTeams = getWaitlistTeams(snapshot)
	const capacity = getConfirmedCapacity(snapshot)

	// Grid always supports 1, 2, 4, 6 columns at different breakpoints
	const gridColsClass =
		'grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6'

	// Reserve panels span only as many columns as there are actual groups
	const groupCount = snapshot.groups.length
	let colSpanClass = 'space-y-4 col-span-1'

	// md breakpoint (max 2 columns)
	colSpanClass += groupCount >= 2 ? ' md:col-span-2' : ' md:col-span-1'

	// xl breakpoint (max 4 columns)
	switch (groupCount) {
		case 1:
			colSpanClass += ' xl:col-span-1'
			break
		case 2:
			colSpanClass += ' xl:col-span-2'
			break
		case 3:
			colSpanClass += ' xl:col-span-3'
			break
		default: // 4 or more
			colSpanClass += ' xl:col-span-4'
	}

	// 2xl breakpoint (max 6 columns)
	switch (groupCount) {
		case 1:
			colSpanClass += ' 2xl:col-span-1'
			break
		case 2:
			colSpanClass += ' 2xl:col-span-2'
			break
		case 3:
			colSpanClass += ' 2xl:col-span-3'
			break
		case 4:
			colSpanClass += ' 2xl:col-span-4'
			break
		case 5:
			colSpanClass += ' 2xl:col-span-5'
			break
		default: // 6 or more
			colSpanClass += ' 2xl:col-span-6'
	}

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={pointerWithin}
				measuring={measuring}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				<div className='space-y-6'>
					{/* Hero strip */}
					<div className={heroStripVariants()}>
						<h2 className='font-bold text-2xl text-title'>{snapshot.groupStageName}</h2>
						<p className='text-foreground-light'>
							{t('competition.groupAssignment.instruction')}
						</p>
					</div>

					{/* Error banner */}
					{saveError ? (
						<div className={errorBannerVariants({ variant: 'error' })}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								className='w-4 h-4 shrink-0'
								aria-hidden='true'
							>
								<path
									fillRule='evenodd'
									d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z'
									clipRule='evenodd'
								/>
							</svg>
							<span>{saveError}</span>
							<button
								type='button'
								onClick={() => setSaveError(null)}
								className='ms-auto text-error-600 hover:text-error-700 dark:text-error-400'
								aria-label={t('common.actions.cancel')}
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-4 h-4'
									aria-hidden='true'
								>
									<path d='M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z' />
								</svg>
							</button>
						</div>
					) : null}

					{/* Mobile group tabs */}
					{isMobile && snapshot.groups.length > 1 ? (
						<div className='space-y-3'>
							{/* Tab buttons */}
							<div className='flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-foreground-lighter/30 hover:scrollbar-thumb-foreground-lighter/50'>
								{snapshot.groups.map((group, index) => (
									<button
										key={group.id}
										type='button'
										ref={(el) => {
											if (el && index === activeGroupIndex) {
												el.scrollIntoView({
													behavior: 'smooth',
													block: 'nearest',
													inline: 'center',
												})
											}
										}}
										onClick={() => setActiveGroupIndex(index)}
										className={groupTabVariants({
											isActive: index === activeGroupIndex,
										})}
									>
										{group.name}
									</button>
								))}
							</div>

							{/* Pagination dots */}
							<div className='flex justify-center gap-1.5'>
								{snapshot.groups.map((group, index) => (
									<button
										key={group.id}
										type='button'
										onClick={() => setActiveGroupIndex(index)}
										className={paginationDotVariants({
											isActive: index === activeGroupIndex,
										})}
										aria-label={t('competition.groupAssignment.goToGroup', {
											name: group.name,
										})}
									/>
								))}
							</div>
						</div>
					) : null}

					{/* Main board */}
					<div className='space-y-6'>
						{/* Groups section */}
						<div className='space-y-4'>
							{isMobile ? (
								// Mobile: Show only active group
								<GroupCard
									group={snapshot.groups[activeGroupIndex]}
									disabled={isSaving}
								/>
							) : (
								// Desktop: Show all groups in responsive columns
								<div className={gridColsClass}>
									{snapshot.groups.map((group) => (
										<GroupCard key={group.id} group={group} disabled={isSaving} />
									))}
								</div>
							)}
						</div>

						{/* Reserve section */}
						<div className={gridColsClass}>
							<div className={colSpanClass}>
								<ConfirmedPool
									teams={snapshot.unassignedTeams}
									capacity={capacity}
									disabled={isSaving}
								/>

								{waitlistTeams.length > 0 ? (
									<WaitlistPool
										teams={snapshot.unassignedTeams}
										canPromote={capacity > 0}
										disabled={isSaving}
									/>
								) : null}
							</div>
						</div>
					</div>

					{/* Action buttons */}
					<div className={actionButtonGroupVariants()}>
						<ActionButton
							type='button'
							variant='primary'
							onClick={handleSave}
							disabled={!isDirty || isSaving}
						>
							{isSaving ? t('common.actions.saving') : t('common.actions.save')}
						</ActionButton>

						<ActionButton
							type='button'
							variant='secondary'
							onClick={handleCancel}
							disabled={!isDirty || isSaving}
						>
							{t('common.actions.cancel')}
						</ActionButton>

						{isDirty ? (
							<span className='ms-auto text-sm text-warning-600 dark:text-warning-400'>
								{t('competition.groupAssignment.unsavedChanges')}
							</span>
						) : null}
					</div>
				</div>

				{/* Drag overlay */}
				<DragOverlay
					zIndex={9999}
					style={{ cursor: 'grabbing' }}
					modifiers={[snapCenterToCursor]}
				>
					{activeDragTeam ? <DragOverlayChip team={activeDragTeam} /> : null}
				</DragOverlay>
			</DndContext>

			{/* Conflict dialog */}
			<ConfirmDialog
				open={showConflictDialog}
				onOpenChange={(open) => {
					if (!open) handleConflictReload()
				}}
				onConfirm={handleConflictReload}
				title={t('competition.groupAssignment.conflictTitle')}
				description={t('competition.groupAssignment.conflictDescription')}
				confirmLabel={t('competition.groupAssignment.conflictReload')}
				cancelLabel={t('common.actions.cancel')}
				intent='warning'
			/>

			{/* Navigation blocker dialog */}
			{blocker.state === 'blocked' ? (
				<ConfirmDialog
					open
					onOpenChange={(open) => {
						// Only reset if user is canceling (not proceeding with navigation)
						if (!open && !isProceedingNavigation) {
							blocker.reset()
						}
					}}
					onConfirm={() => {
						setIsProceedingNavigation(true)
						blocker.proceed()
					}}
					title={t('competition.groupAssignment.unsavedTitle')}
					description={t('competition.groupAssignment.unsavedDescription')}
					confirmLabel={t('competition.groupAssignment.leaveAnyway')}
					cancelLabel={t('competition.groupAssignment.stayOnPage')}
					intent='warning'
				/>
			) : null}
		</>
	)
}
