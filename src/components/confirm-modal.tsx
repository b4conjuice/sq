import type { ComponentProps } from 'react'

import { CheckIcon, XMarkIcon } from '@/components/icons'
import Modal from '@/components/modal'

type ModalProps = ComponentProps<typeof Modal>

export default function ConfirmModal({
  action,
  ...modalProps
}: ModalProps & {
  action: () => void
}) {
  const { setIsOpen, children } = modalProps
  return (
    <Modal {...modalProps}>
      {children}
      <div className='flex space-x-4'>
        <button
          type='button'
          aria-label='confirm'
          onClick={() => {
            action()
            setIsOpen(false)
          }}
        >
          <CheckIcon className='h-6 w-6 text-green-700 hover:text-green-700/75' />
        </button>
        <button
          type='button'
          aria-label='cancel'
          onClick={() => {
            setIsOpen(false)
          }}
        >
          <XMarkIcon className='h-6 w-6 text-red-700 hover:text-red-700/75' />
        </button>
      </div>
    </Modal>
  )
}
