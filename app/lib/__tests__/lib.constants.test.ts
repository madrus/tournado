import { Category, Division } from '@prisma/client'

import { CATEGORIES, DIVISIONS } from '../lib.constants'

function getSortedValues(values: string[]): string[] {
	return [...values].sort()
}

function getMissingValues(base: string[], compare: string[]): string[] {
	return base.filter((value) => !compare.includes(value))
}

describe('lib.constants', () => {
	it('keeps division constants aligned with Prisma enums', () => {
		const prismaValues = Object.values(Division)
		const constantValues = Object.values(DIVISIONS).map((division) => division.value)

		const missingFromConstants = getMissingValues(prismaValues, constantValues)
		const extraInConstants = getMissingValues(constantValues, prismaValues)

		expect(missingFromConstants).toEqual([])
		expect(extraInConstants).toEqual([])
		expect(getSortedValues(prismaValues)).toEqual(getSortedValues(constantValues))
	})

	it('keeps category constants aligned with Prisma enums', () => {
		const prismaValues = Object.values(Category)
		const constantValues = Object.values(CATEGORIES).map((category) => category.value)

		const missingFromConstants = getMissingValues(prismaValues, constantValues)
		const extraInConstants = getMissingValues(constantValues, prismaValues)

		expect(missingFromConstants).toEqual([])
		expect(extraInConstants).toEqual([])
		expect(getSortedValues(prismaValues)).toEqual(getSortedValues(constantValues))
	})
})
