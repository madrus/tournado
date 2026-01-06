import { createRequire } from 'node:module'
import pino from 'pino'

type LoggerFactoryOptions = {
	nodeEnv?: string
	logLevel?: string
	resolvePretty?: () => string | null
}

export function createLogger({
	nodeEnv,
	logLevel,
	resolvePretty,
}: LoggerFactoryOptions = {}): ReturnType<typeof pino> {
	const resolvedNodeEnv = nodeEnv ?? process.env.NODE_ENV
	const resolvedLogLevel = logLevel ?? process.env.LOG_LEVEL
	const isProduction = resolvedNodeEnv === 'production'

	const require = createRequire(import.meta.url)
	const prettyTarget = isProduction
		? null
		: (() => {
				if (resolvePretty) {
					return resolvePretty()
				}
				try {
					return require.resolve('pino-pretty')
				} catch {
					return null
				}
			})()

	const transport =
		prettyTarget === null
			? undefined
			: pino.transport({
					target: prettyTarget,
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
						customColors: 'error:red,warn:yellowBright',
					},
				})

	return pino(
		{
			level: resolvedLogLevel ?? (isProduction ? 'info' : 'debug'),
			base: { env: resolvedNodeEnv },
			redact: {
				paths: [
					'password',
					'token',
					'secret',
					'apiKey',
					'authorization',
					'cookie',
					'session',
					'firebaseUid',
					'email',
					'phone',
					'ip',
					'headers.authorization',
					'headers.cookie',
					'req.headers.authorization',
					'req.headers.cookie',
				],
				remove: true,
			},
		},
		transport,
	)
}

export const logger = createLogger()
