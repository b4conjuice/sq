import { Link, useLocation } from '@tanstack/react-router'

import { nav } from '@/lib/config'

const isActivePath = (currentPath: string, href: string) =>
  href === '/' ? currentPath === href : currentPath.startsWith(href)

export default function Menu() {
  const { pathname } = useLocation()
  return (
    <nav className='flex items-center gap-4'>
      {nav.map(({ href, text }) =>
        isActivePath(pathname, href) ? (
          <span key={href} className='text-cb-white/50'>
            {text}
          </span>
        ) : (
          <Link
            key={href}
            to={href}
            className='text-cb-pink hover:text-cb-pink/75'
          >
            {text}
          </Link>
        )
      )}
    </nav>
  )
}
