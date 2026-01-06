import { createRequire } from 'node:module'
import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

const require = createRequire(import.meta.url)
const prettyTarget = isProduction
	? null
	: (() => {
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

export const logger = pino(
	{
		level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
		base: { env: process.env.NODE_ENV },
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
