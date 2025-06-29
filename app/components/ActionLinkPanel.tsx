import { JSX, ReactNode } from 'react'
import { Link } from 'react-router'

import { type ColorAccent } from '~/lib/lib.types'
import { getActionLinkPanelClasses } from '~/styles/actionLinkPanel.styles'
import { cn } from '~/utils/misc'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'

type ActionLinkPanelProps = {
  title: string
  description: string
  icon: JSX.Element
  colorScheme: ColorAccent
  to?: string
  onClick?: () => void
  children?: ReactNode
  language: string
}

export function ActionLinkPanel({
  title,
  description,
  icon,
  colorScheme,
  to,
  onClick,
  children,
  language,
}: ActionLinkPanelProps): JSX.Element {
  const typographyClasses = getTypographyClasses(language)
  const classes = getActionLinkPanelClasses(colorScheme)

  const content = (
    <div
      className={cn(
        'flex flex-col items-start space-y-4 break-words',
        typographyClasses.textAlign
      )}
    >
      <div className={classes.icon}>{icon}</div>
      <h3 className={cn(classes.title, getLatinTitleClass(language))}>{title}</h3>
      <p className={classes.description}>{description}</p>
      {children}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className={cn(classes.base, classes.focus)}>
        {content}
      </Link>
    )
  }

  return (
    <div className={cn(classes.base, 'cursor-pointer')} onClick={onClick}>
      {content}
    </div>
  )
}
