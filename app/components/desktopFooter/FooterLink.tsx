import type { JSX } from 'react'
import { Link } from 'react-router'
import { cn } from '~/utils/misc'

type FooterLinkProps = {
  to: string
  label: string
  className?: string
}

const FooterLink = ({ to, label, className = '' }: FooterLinkProps): JSX.Element => (
  <Link
    to={to}
    className={cn(
      'text-foreground transition-colors hover:text-foreground-darker',
      className,
    )}
  >
    {label}
  </Link>
)

export default FooterLink
