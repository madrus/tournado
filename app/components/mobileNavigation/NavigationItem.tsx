import { JSX } from 'react'
import { Link, useLocation } from 'react-router'

type NavigationItemProps = {
  to: string
  icon: string
  label: string
}

function NavigationItem({ to, icon, label }: NavigationItemProps): JSX.Element {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className='flex flex-col items-center'
      aria-label={`Navigate to ${label}`}
      data-cy={`nav-${label.toLowerCase()}`}
    >
      <span
        className={`material-symbols-outlined ${isActive ? 'text-red-500' : 'text-emerald-800'}`}
        style={{
          fontSize: '36px',
          fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 48`,
        }}
        aria-hidden='true'
      >
        {icon}
      </span>
      <span
        className={`mt-1 text-xs ${isActive ? 'font-bold text-red-500' : 'text-emerald-800'}`}
      >
        {label}
      </span>
    </Link>
  )
}

export default NavigationItem
