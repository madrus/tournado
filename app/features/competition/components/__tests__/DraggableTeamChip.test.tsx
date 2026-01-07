import { render } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import type { DndTeam } from '../../utils/groupStageDnd'
import { DragOverlayChip } from '../DraggableTeamChip'

const createTeam = (overrides: Partial<DndTeam> = {}): DndTeam => ({
	id: 'team-1',
	name: 'Team One',
	clubName: 'Club',
	category: 'JO8' as DndTeam['category'],
	...overrides,
})

describe('DragOverlayChip', () => {
	it('disables pointer events and transitions to prevent cursor drift', () => {
		const { container } = render(<DragOverlayChip team={createTeam()} />)
		const overlay = container.firstElementChild

		expect(overlay).not.toBeNull()
		expect(overlay).toHaveClass('pointer-events-none')
		expect(overlay).toHaveClass('transition-none')
	})
})
