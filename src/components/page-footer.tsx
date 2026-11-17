import type { ReactNode } from 'react'

import Menu from '@/components/menu'

export default function PageFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
      <Menu />
      <div className='flex space-x-6'>{children}</div>
    </footer>
  )
}
