import {
	closestCenter,
	DndContext,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker, useFetcher } from 'react-router'

import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'

import { useGroupStageDnd } from '../hooks/useGroupStageDnd'
import { useGroupAssignmentStore } from '../stores/useGroupAssignmentStore'
import type { GroupAssignmentSnapshot } from '../utils/groupStageDnd'
import { DragOverlayChip } from './DraggableTeamChip'
import { GroupCard } from './GroupCard'
import {
	actionButtonGroupVariants,
	errorBannerVariants,
	groupTabVariants,
	heroStripVariants,
	paginationDotVariants,
} from './groupAssignment.variants'
import { ReservePool } from './ReservePool'
import { ReserveWaitlist } from './ReserveWaitlist'

type GroupAssignmentBoardProps = {
	initialSnapshot: GroupAssignmentSnapshot
	tournamentId: string
}

export function GroupAssignmentBoard({
	initialSnapshot,
	tournamentId,
}: GroupAssignmentBoardProps): JSX.Element {
	const { t } = useTranslation()
	const fetcher = useFetcher()
	const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null)
	const [showConflictDialog, setShowConflictDialog] = useState(false)

	// Store state
	const snapshot = useGroupAssignmentStore((s) => s.snapshot)
	const isSaving = useGroupAssignmentStore((s) => s.isSaving)
	const saveError = useGroupAssignmentStore((s) => s.saveError)
	const hasConflict = useGroupAssignmentStore((s) => s.hasConflict)
	const activeGroupIndex = useGroupAssignmentStore((s) => s.activeGroupIndex)

	const initializeFromSnapshot = useGroupAssignmentStore(
		(s) => s.initializeFromSnapshot,
	)
	const resetToOriginal = useGroupAssignmentStore((s) => s.resetToOriginal)
	const removeTeamFromGroupStage = useGroupAssignmentStore(
		(s) => s.removeTeamFromGroupStage,
	)
	const setActiveGroupIndex = useGroupAssignmentStore((s) => s.setActiveGroupIndex)
	const setSaving = useGroupAssignmentStore((s) => s.setSaving)
	const setSaveError = useGroupAssignmentStore((s) => s.setSaveError)
	const setConflict = useGroupAssignmentStore((s) => s.setConflict)
	const isDirty = useGroupAssignmentStore((s) => s.isDirty)
	const getReserveCapacity = useGroupAssignmentStore((s) => s.getReserveCapacity)
	const getWaitlistTeams = useGroupAssignmentStore((s) => s.getWaitlistTeams)

	// DnD hook
	const {
		activeDragTeam,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
		highlightedSlot,
	} = useGroupStageDnd()

	// Initialize store from loader data
	useEffect(() => {
		initializeFromSnapshot(initialSnapshot)
	}, [initialSnapshot, initializeFromSnapshot])

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
			isDirty() && currentLocation.pathname !== nextLocation.pathname,
	)

	// Handle fetcher response
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			setSaving(false)

			const data = fetcher.data as {
				success?: boolean
				error?: string
				conflict?: boolean
			}

			if (data.conflict) {
				setConflict(true)
			} else if (data.error) {
				setSaveError(data.error)
			} else if (data.success) {
				// Reset original snapshot to current after successful save
				if (snapshot) {
					initializeFromSnapshot(snapshot)
				}
				setSaveError(null)
			}
		}
	}, [
		fetcher.state,
		fetcher.data,
		snapshot,
		initializeFromSnapshot,
		setSaving,
		setSaveError,
		setConflict,
	])

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
		resetToOriginal()
	}, [resetToOriginal])

	// Handle delete confirmation
	const handleDeleteConfirm = useCallback(() => {
		if (deleteTeamId) {
			removeTeamFromGroupStage(deleteTeamId)
			setDeleteTeamId(null)
		}
	}, [deleteTeamId, removeTeamFromGroupStage])

	// Handle conflict reload
	const handleConflictReload = useCallback(() => {
		setShowConflictDialog(false)
		setConflict(false)
		window.location.reload()
	}, [setConflict])

	// Responsive layout detection
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024)
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	if (!snapshot) {
		return (
			<div className='flex items-center justify-center p-8'>
				<span className='text-foreground-light'>{t('common.loading')}</span>
			</div>
		)
	}

	const waitlistTeams = getWaitlistTeams()
	const capacity = getReserveCapacity()
	const dirty = isDirty()

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				<div className='space-y-6'>
					{/* Hero strip */}
					<div className={heroStripVariants()}>
						<h2 className='font-bold text-2xl text-foreground'>
							{snapshot.groupStageName}
						</h2>
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
								className='ms-auto text-red-600 hover:text-red-700 dark:text-red-400'
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
					<div className={isMobile ? 'space-y-4' : 'grid gap-6 grid-cols-[1fr_320px]'}>
						{/* Groups section */}
						<div className='space-y-4'>
							{isMobile ? (
								// Mobile: Show only active group
								<GroupCard
									group={snapshot.groups[activeGroupIndex]}
									highlightedSlot={highlightedSlot}
									onDeleteTeam={setDeleteTeamId}
									disabled={isSaving}
								/>
							) : (
								// Desktop: Show all groups in responsive columns
								<div className='grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
									{snapshot.groups.map((group) => (
										<GroupCard
											key={group.id}
											group={group}
											highlightedSlot={highlightedSlot}
											onDeleteTeam={setDeleteTeamId}
											disabled={isSaving}
										/>
									))}
								</div>
							)}
						</div>

						{/* Reserve section */}
						<div className='space-y-4'>
							<ReservePool
								teams={snapshot.reserveTeams}
								capacity={capacity}
								onDeleteTeam={setDeleteTeamId}
								disabled={isSaving}
							/>

							{waitlistTeams.length > 0 ? (
								<ReserveWaitlist
									teams={snapshot.reserveTeams}
									canPromote={capacity > 0}
									onDeleteTeam={setDeleteTeamId}
									disabled={isSaving}
								/>
							) : null}
						</div>
					</div>

					{/* Action buttons */}
					<div className={actionButtonGroupVariants()}>
						<ActionButton
							type='button'
							variant='primary'
							onClick={handleSave}
							disabled={!dirty || isSaving}
						>
							{isSaving ? t('common.actions.saving') : t('common.actions.save')}
						</ActionButton>

						<ActionButton
							type='button'
							variant='secondary'
							onClick={handleCancel}
							disabled={!dirty || isSaving}
						>
							{t('common.actions.cancel')}
						</ActionButton>

						{dirty ? (
							<span className='ms-auto text-sm text-amber-600 dark:text-amber-400'>
								{t('competition.groupAssignment.unsavedChanges')}
							</span>
						) : null}
					</div>
				</div>

				{/* Drag overlay */}
				<DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
					{activeDragTeam ? <DragOverlayChip team={activeDragTeam} /> : null}
				</DragOverlay>
			</DndContext>

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				open={deleteTeamId !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTeamId(null)
				}}
				onConfirm={handleDeleteConfirm}
				title={t('competition.groupAssignment.deleteConfirmTitle')}
				description={t('competition.groupAssignment.deleteConfirmDescription')}
				confirmLabel={t('common.actions.confirmDelete')}
				cancelLabel={t('common.actions.cancel')}
				intent='danger'
				destructive
			/>

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
						if (!open) blocker.reset()
					}}
					onConfirm={() => blocker.proceed()}
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
