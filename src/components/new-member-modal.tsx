import type { Dispatch, SetStateAction } from 'react'

import Modal from '@/components/modal'
import NewMemberForm from '@/components/new-member-form'
import type { Member } from '@/lib/use-members'

export default function NewMemberModal({
  isOpen,
  setIsOpen,
  title = 'create new member',
  onSubmit,
}: {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  title?: string
  onSubmit: (member: Member) => void
}) {
  return (
    <Modal title={title} isOpen={isOpen} setIsOpen={setIsOpen}>
      <NewMemberForm
        onSubmit={member => {
          onSubmit(member)
          setIsOpen(false)
        }}
      />
    </Modal>
  )
}
