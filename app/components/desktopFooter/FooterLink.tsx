import { JSX } from 'react'
import { Link } from 'react-router'

type FooterLinkProps = {
  to: string
  label: string
  className?: string
}

const FooterLink = ({ to, label, className = '' }: FooterLinkProps): JSX.Element => (
  <Link to={to} className={`transition-colors hover:text-gray-600 ${className}`}>
    {label}
  </Link>
)

export default FooterLink
