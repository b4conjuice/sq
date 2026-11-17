import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { XMarkIcon } from '@/components/icons'

export default function Modal({
  isOpen,
  setIsOpen,
  title,
  children,
}: {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  title?: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, setIsOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col justify-end p-4'>
      <button
        type='button'
        aria-label='close'
        className='bg-cobalt/90 absolute inset-0'
        onClick={() => setIsOpen(false)}
      />
      <div
        role='dialog'
        aria-modal='true'
        className='bg-cb-dusty-blue text-cb-white relative z-10 max-h-full overflow-y-auto overscroll-contain rounded-lg p-4'
      >
        <button
          type='button'
          aria-label='close'
          onClick={() => setIsOpen(false)}
          className='text-cb-yellow hover:text-cb-yellow/75 absolute top-4 right-4'
          tabIndex={-1}
        >
          <XMarkIcon className='h-6 w-6' />
        </button>
        <div className='space-y-3'>
          {title && <h2 className='mt-4 text-center text-xl'>{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  )
}
