import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import ConfirmModal from '@/components/confirm-modal'
import { PlusIcon, SaveIcon, TrashIcon } from '@/components/icons'
import Modal from '@/components/modal'
import PageFooter from '@/components/page-footer'
import type { Member } from '@/lib/use-members'
import { getMembers, useMembers } from '@/lib/use-members'
import { createSquad, useSquads } from '@/lib/use-squads'
import { DEFAULT_TITLE } from '@/routes/__root'

const inputClassName =
  'bg-cb-blue w-full rounded border border-cb-dusty-blue px-2 py-1 outline-none focus:border-cb-pink'

const listsAreEqual = (listA: string[], listB: string[]) => {
  if (listA.length !== listB.length) {
    return false
  }
  const counts = new Map<string, number>()
  for (const item of listA) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  for (const item of listB) {
    const count = counts.get(item)
    if (count === undefined) {
      return false
    }
    if (count === 1) {
      counts.delete(item)
    } else {
      counts.set(item, count - 1)
    }
  }
  return counts.size === 0
}

function TagEditor({
  label,
  values,
  suggestions,
  onChange,
}: {
  label: string
  values: string[]
  suggestions: string[]
  onChange: (values: string[]) => void
}) {
  const [newValue, setNewValue] = useState('')
  const chips = [...new Set([...suggestions, ...values])]
  const addValue = () => {
    const value = newValue.trim()
    if (value === '' || values.includes(value)) {
      return
    }
    onChange([...values, value])
    setNewValue('')
  }
  return (
    <div className='space-y-2'>
      <p className='text-sm'>{label}</p>
      <ul className='flex flex-wrap gap-2'>
        {chips.map(chip => (
          <li key={chip}>
            <button
              className={`bg-cb-blue rounded-lg border p-2 text-nowrap ${
                values.includes(chip) ? 'border-cb-pink' : 'border-cb-blue'
              }`}
              type='button'
              onClick={() => {
                onChange(
                  values.includes(chip)
                    ? values.filter(value => value !== chip)
                    : [...values, chip]
                )
              }}
            >
              {chip}
            </button>
          </li>
        ))}
      </ul>
      <div className='flex gap-2'>
        <input
          type='text'
          className={inputClassName}
          placeholder={`add ${label}`}
          value={newValue}
          onChange={event => {
            setNewValue(event.target.value)
          }}
          onKeyDown={event => {
            if (event.key !== 'Enter') {
              return
            }
            event.preventDefault()
            event.stopPropagation()
            addValue()
          }}
        />
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          aria-label={`add ${label}`}
          onClick={addValue}
          disabled={newValue.trim() === ''}
        >
          <PlusIcon className='h-6 w-6' />
        </button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/members/$memberId')({
  component: RouteComponent,
  ssr: false,
  loader: ({ params }) => {
    const member = getMembers()[Number(params.memberId)]
    return { member }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.member
          ? `${loaderData.member.name} - ${DEFAULT_TITLE}`
          : `members - ${DEFAULT_TITLE}`,
      },
    ],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { memberId: memberIdParam } = Route.useParams()
  const memberIndex = Number(memberIdParam)
  const { members, saveMember, deleteMemberByIndex } = useMembers()
  const {
    squads,
    saveSquad,
    addMemberToSquad,
    updateMemberInSquads,
    removeMemberFromAllSquads,
  } = useSquads()
  const member = members.at(memberIndex)
  const [newMember, setNewMember] = useState<Member>(
    member ?? { name: '', nickname: '', roles: [], tags: [] }
  )
  const [isAddSquadModalOpen, setIsAddSquadModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [newSquadName, setNewSquadName] = useState('')
  if (!member) {
    return <p>member does not exist</p>
  }

  const { name } = member
  const roles = [...new Set(members.flatMap(current => current.roles))]
  const tags = [...new Set(members.flatMap(current => current.tags))]
  const squadsWithMember = squads.filter(squad =>
    squad.members.some(squadMember => squadMember.name === name)
  )
  const squadsWithoutMember = squads.filter(squad =>
    squad.members.every(squadMember => squadMember.name !== name)
  )
  const hasChanges =
    newMember.name !== member.name ||
    (newMember.nickname ?? '') !== (member.nickname ?? '') ||
    !listsAreEqual(newMember.roles, member.roles) ||
    !listsAreEqual(newMember.tags, member.tags)
  const submitMember = () => {
    if (!hasChanges) {
      return
    }
    saveMember({ member: newMember, index: memberIndex })
    updateMemberInSquads({ memberName: member.name, member: newMember })
  }
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2 className='flex items-baseline gap-2'>
          <span>{memberIndex + 1}</span>
          <span>{name}</span>
          <span>{member.roles.join(', ')}</span>
          <span className='text-sm'>{member.tags.join(', ')}</span>
        </h2>
        <form
          className='flex flex-col gap-4'
          onSubmit={event => {
            event.preventDefault()
            submitMember()
          }}
          onKeyDown={event => {
            if (event.key !== 'Enter') {
              return
            }
            event.preventDefault()
            submitMember()
          }}
        >
          <input
            type='text'
            className={inputClassName}
            placeholder='name'
            value={newMember.name}
            onChange={event => {
              setNewMember(prev => ({ ...prev, name: event.target.value }))
            }}
          />
          <input
            type='text'
            className={inputClassName}
            placeholder='nickname'
            value={newMember.nickname ?? ''}
            onChange={event => {
              setNewMember(prev => ({ ...prev, nickname: event.target.value }))
            }}
          />
          <TagEditor
            label='roles'
            values={newMember.roles}
            suggestions={roles}
            onChange={newRoles => {
              setNewMember(prev => ({ ...prev, roles: newRoles }))
            }}
          />
          <TagEditor
            label='tags'
            values={newMember.tags}
            suggestions={tags}
            onChange={newTags => {
              setNewMember(prev => ({ ...prev, tags: newTags }))
            }}
          />
          <div className='flex items-center gap-4'>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
              type='submit'
              disabled={!hasChanges}
            >
              <SaveIcon className='h-6 w-6' /> save
            </button>
            <button
              className='flex items-center gap-2 text-red-700 hover:text-red-700/75'
              type='button'
              onClick={() => {
                setIsConfirmModalOpen(true)
              }}
            >
              <TrashIcon className='h-6 w-6' /> delete
            </button>
          </div>
        </form>
        <div className='flex items-center justify-between'>
          <h3>squads</h3>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            aria-label='add to squad'
            onClick={() => {
              setIsAddSquadModalOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
        {squadsWithMember.length === 0 ? (
          <p>this member is not on any squads</p>
        ) : (
          <ul className='divide-cb-dusty-blue divide-y'>
            {squadsWithMember.map(squad => (
              <li key={squad.name} className='flex gap-2 py-4 first:pt-0'>
                <Link
                  to='/squads/$squadId'
                  params={{ squadId: String(squads.indexOf(squad)) }}
                  className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline gap-2'
                >
                  {squad.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <PageFooter />
      <Modal
        title={`add ${name} to squad`}
        isOpen={isAddSquadModalOpen}
        setIsOpen={setIsAddSquadModalOpen}
      >
        {squadsWithoutMember.length > 0 && (
          <ul className='divide-cb-white/25 divide-y'>
            {squadsWithoutMember.map(squad => (
              <li key={squad.name} className='flex gap-2 py-4 first:pt-0'>
                <button
                  className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2'
                  type='button'
                  onClick={() => {
                    addMemberToSquad({
                      squadIndex: squads.indexOf(squad),
                      member,
                    })
                    setIsAddSquadModalOpen(false)
                  }}
                >
                  <PlusIcon className='h-6 w-6' /> {squad.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <hr className='border-cb-white/25' />
        <form
          className='space-y-3'
          onSubmit={event => {
            event.preventDefault()
            saveSquad({
              squad: {
                ...createSquad(newSquadName.trim()),
                members: [member],
              },
            })
            setNewSquadName('')
            setIsAddSquadModalOpen(false)
          }}
        >
          <p>create new squad with member</p>
          <input
            type='text'
            className={inputClassName}
            placeholder='name'
            value={newSquadName}
            onChange={event => {
              setNewSquadName(event.target.value)
            }}
          />
          <div className='flex items-center gap-4'>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
              type='submit'
              disabled={newSquadName.trim() === ''}
            >
              <SaveIcon className='h-6 w-6' /> save
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        title={`delete ${name}`}
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        action={() => {
          deleteMemberByIndex(memberIndex)
          removeMemberFromAllSquads({ memberName: name })
          navigate({ to: '/members' })
        }}
      >
        delete {name}?
      </ConfirmModal>
    </>
  )
}
