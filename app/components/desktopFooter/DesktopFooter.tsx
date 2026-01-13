import type { JSX } from 'react'
import { Link } from 'react-router'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

const DesktopFooter = (): JSX.Element => (
  <footer className='hidden border-emerald-950/10 border-t bg-emerald-900 md:block'>
    <div
      className='container mx-auto grid h-14 grid-cols-2 px-4'
      data-testid='footer-container'
    >
      <div className='flex items-center' data-testid='footer-left-section'>
        <Link to='/' className='flex items-center'>
          <span
            className={cn(
              'm-0 p-0 font-light text-white/90 leading-[1]',
              getLatinTextClass(),
            )}
          >
            Tournado
          </span>
        </Link>
      </div>
      <div className='flex items-center justify-end' data-testid='footer-right-section'>
        <span
          data-testid='footer-attribution'
          className={cn('m-0 p-0 text-white/90 leading-[1]', getLatinTextClass())}
        >
          Built with ♥️ by{' '}
          <a
            href='https://madrus4u.com'
            target='_blank'
            rel='noopener noreferrer'
            className='underline hover:text-white'
          >
            Madrus4U
          </a>
        </span>
      </div>
    </div>
  </footer>
)

export default DesktopFooter
