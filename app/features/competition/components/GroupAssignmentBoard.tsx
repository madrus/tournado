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
import { useBlocker, useFetcher, useRevalidator } from 'react-router'
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
import { getGroupAssignmentLayoutClasses } from '../utils/groupAssignmentLayout'
import type { GroupAssignmentSnapshot } from '../utils/groupStageDnd'
import { ConfirmedPool } from './ConfirmedPool'
import { DragOverlayChip } from './DraggableTeamChip'
import { GroupAssignmentErrorBanner } from './GroupAssignmentErrorBanner'
import { GroupAssignmentMobileTabs } from './GroupAssignmentMobileTabs'
import { GroupCard } from './GroupCard'
import {
	actionButtonGroupVariants,
	heroStripVariants,
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
	const revalidator = useRevalidator()
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
		revalidator.revalidate()
	}, [revalidator, setConflict])

	// Responsive layout detection
	const isMobile = useMediaQuery('(max-width: 1023px)')

	const groupCount = snapshot ? snapshot.groups.length : 0
	const safeGroupIndex =
		groupCount === 0 ? 0 : Math.max(0, Math.min(activeGroupIndex, groupCount - 1))

	useEffect(() => {
		if (activeGroupIndex !== safeGroupIndex) {
			setActiveGroupIndex(safeGroupIndex)
		}
	}, [activeGroupIndex, safeGroupIndex, setActiveGroupIndex])

	if (!snapshot) {
		return (
			<div className='flex items-center justify-center p-8'>
				<span className='text-foreground-light'>{t('common.loading')}</span>
			</div>
		)
	}

	const waitlistTeams = getWaitlistTeams(snapshot)
	const capacity = getConfirmedCapacity(snapshot)

	const { gridColsClass, colSpanClass } = getGroupAssignmentLayoutClasses(groupCount)

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
					<GroupAssignmentErrorBanner
						error={saveError}
						onDismiss={() => setSaveError(null)}
						dismissLabel={t('common.actions.cancel')}
					/>

					{/* Mobile group tabs */}
					{isMobile && snapshot.groups.length > 1 ? (
						<GroupAssignmentMobileTabs
							groups={snapshot.groups}
							activeGroupIndex={safeGroupIndex}
							onTabChange={setActiveGroupIndex}
							getAriaLabel={(name) =>
								t('competition.groupAssignment.goToGroup', { name })
							}
						/>
					) : null}

					{/* Main board */}
					<div className='space-y-6'>
						{/* Groups section */}
						<div className='space-y-4'>
							{isMobile ? (
								// Mobile: Show only active group
								snapshot.groups.length > 0 ? (
									<GroupCard
										group={snapshot.groups[safeGroupIndex]}
										disabled={isSaving}
									/>
								) : null
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
										teams={waitlistTeams}
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
							data-testid='group-assignment-save'
						>
							{isSaving ? t('common.actions.saving') : t('common.actions.save')}
						</ActionButton>

						<ActionButton
							type='button'
							variant='secondary'
							onClick={handleCancel}
							disabled={!isDirty || isSaving}
							data-testid='group-assignment-cancel'
						>
							{t('common.actions.cancel')}
						</ActionButton>

						{isDirty ? (
							<span
								className='ms-auto text-sm text-warning-600 dark:text-warning-400'
								data-testid='group-assignment-unsaved-warning'
							>
								{t('competition.groupAssignment.unsavedChanges')}
							</span>
						) : null}
					</div>
				</div>

				{/* Drag overlay */}
				<DragOverlay
					style={{ cursor: 'grabbing', zIndex: 'var(--z-dnd-overlay)' }}
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
