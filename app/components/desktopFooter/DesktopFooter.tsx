import { JSX } from 'react'
import { Link } from 'react-router'

const DesktopFooter = (): JSX.Element => (
  <footer className='hidden md:block'>
    <div className='container mx-auto grid h-14 grid-cols-2 px-4'>
      <div className='flex items-center'>
        <Link to='/' className='flex items-center'>
          <span className='m-0 p-0 leading-[1] font-light'>Tournado</span>
        </Link>
      </div>
      <div className='flex items-center justify-end'>
        <span className='m-0 p-0 leading-[1]'>Built with ♥️ by Madrus</span>
      </div>
    </div>
  </footer>
)

export default DesktopFooter
