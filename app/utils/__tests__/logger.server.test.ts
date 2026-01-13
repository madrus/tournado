import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLogger } from '../logger.server'

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
    vi.clearAllMocks()
  })

  it('configures JSON logging in production', async () => {
    createLogger({ nodeEnv: 'production', resolvePretty: () => 'pino-pretty' })

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
    transportMock.mockReturnValue({ target: 'pino-pretty' })

    createLogger({
      nodeEnv: 'development',
      logLevel: 'debug',
      resolvePretty: () => 'pino-pretty',
    })

    expect(pinoMock).toHaveBeenCalled()
    expect(transportMock).toHaveBeenCalled()
    expect(transportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.any(String),
      }),
    )
    const [config, transport] = pinoMock.mock.calls[0]
    expect(config).toEqual(
      expect.objectContaining({
        level: 'debug',
        base: { env: 'development' },
      }),
    )
    expect(transport).toEqual(
      expect.objectContaining({
        target: expect.any(String),
      }),
    )
  })
})
