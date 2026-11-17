import { useState } from 'react'

import { SaveIcon } from '@/components/icons'
import type { Member } from '@/lib/use-members'

type MemberDraft = {
  name: string
  nickname: string
  roles: string
  tags: string
}

const splitList = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

const inputClassName =
  'bg-cb-blue w-full rounded border border-cb-dusty-blue px-2 py-1 outline-none focus:border-cb-pink'

export default function NewMemberForm({
  onSubmit,
  submitLabel = 'save',
}: {
  onSubmit: (member: Member) => void
  submitLabel?: string
}) {
  const [draft, setDraft] = useState<MemberDraft>({
    name: '',
    nickname: '',
    roles: '',
    tags: '',
  })
  const submit = () => {
    const name = draft.name.trim()
    if (name === '') {
      return
    }
    const nickname = draft.nickname.trim()
    onSubmit({
      name,
      nickname: nickname === '' ? undefined : nickname,
      roles: splitList(draft.roles),
      tags: splitList(draft.tags),
    })
    setDraft({ name: '', nickname: '', roles: '', tags: '' })
  }
  return (
    <form
      className='space-y-3'
      onSubmit={event => {
        event.preventDefault()
        submit()
      }}
      onKeyDown={event => {
        if (event.key !== 'Enter') {
          return
        }
        event.preventDefault()
        submit()
      }}
    >
      <input
        type='text'
        autoFocus
        className={inputClassName}
        placeholder='name'
        value={draft.name}
        onChange={event => {
          setDraft(prev => ({ ...prev, name: event.target.value }))
        }}
      />
      <input
        type='text'
        className={inputClassName}
        placeholder='nickname (optional)'
        value={draft.nickname}
        onChange={event => {
          setDraft(prev => ({ ...prev, nickname: event.target.value }))
        }}
      />
      <input
        type='text'
        className={inputClassName}
        placeholder='roles (comma separated)'
        value={draft.roles}
        onChange={event => {
          setDraft(prev => ({ ...prev, roles: event.target.value }))
        }}
      />
      <input
        type='text'
        className={inputClassName}
        placeholder='tags (comma separated)'
        value={draft.tags}
        onChange={event => {
          setDraft(prev => ({ ...prev, tags: event.target.value }))
        }}
      />
      <div className='flex items-center gap-4'>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
          type='submit'
          disabled={draft.name.trim() === ''}
        >
          <SaveIcon className='h-6 w-6' /> {submitLabel}
        </button>
      </div>
    </form>
  )
}
