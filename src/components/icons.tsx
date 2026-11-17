import type { ReactNode } from 'react'

type IconProps = {
  className?: string
}

function Icon({
  className,
  children,
}: IconProps & {
  children: ReactNode
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.8}
      stroke='currentColor'
      className={className}
      aria-hidden='true'
    >
      {children}
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap='round' d='M12 4.5v15m7.5-7.5h-15' />
    </Icon>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M4 7h16M9 7V4.5h6V7m-8.5 0 1 13h9l1-13M10 11v5.5M14 11v5.5'
      />
    </Icon>
  )
}

export function SaveIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'
      />
    </Icon>
  )
}

export function PencilIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m16.5 3.75 3.75 3.75L8.25 19.5H4.5v-3.75L16.5 3.75Z'
      />
    </Icon>
  )
}

export function XMarkIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap='round' d='M6 6l12 12M18 6 6 18' />
    </Icon>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m4.5 12.75 6 6 9-13.5'
      />
    </Icon>
  )
}
