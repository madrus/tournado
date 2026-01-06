import { afterEach, describe, expect, it, vi } from 'vitest'

const transportMock = vi.hoisted(() => vi.fn())
const pinoMock = vi.hoisted(() =>
	Object.assign(vi.fn(), {
		transport: transportMock,
	}),
)

vi.mock('pino', () => ({
	default: pinoMock,
}))

describe('logger.server', () => {
	afterEach(() => {
		vi.resetModules()
		vi.clearAllMocks()
		delete process.env.NODE_ENV
		delete process.env.LOG_LEVEL
	})

	it('configures JSON logging in production', async () => {
		process.env.NODE_ENV = 'production'

		await import('../logger.server')

		expect(pinoMock).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'info',
				base: { env: 'production' },
				redact: expect.objectContaining({
					paths: expect.arrayContaining(['password', 'token', 'email']),
				}),
			}),
			undefined,
		)
		expect(transportMock).not.toHaveBeenCalled()
	})

	it('configures pretty logging in development when available', async () => {
		process.env.NODE_ENV = 'development'
		process.env.LOG_LEVEL = 'debug'

		await import('../logger.server')

		if (transportMock.mock.calls.length > 0) {
			expect(transportMock).toHaveBeenCalledWith(
				expect.objectContaining({
					target: expect.any(String),
				}),
			)
		}
		const [config, transport] = pinoMock.mock.calls[0] ?? []
		expect(config).toEqual(
			expect.objectContaining({
				level: 'debug',
				base: { env: 'development' },
			}),
		)
		expect(transport === undefined || transport).toBe(true)
	})
})
