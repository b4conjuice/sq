import { useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'

import CommandPalette from '@/components/command-palette'
import ConfirmModal from '@/components/confirm-modal'
import {
  ArrowDownOnSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'
import Modal from '@/components/modal'
import { useNavigateCommands } from '@/components/navigate-command-palette-provider'
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
  inputRef,
}: {
  label: string
  values: string[]
  suggestions: string[]
  onChange: (values: string[]) => void
  inputRef?: RefObject<HTMLInputElement | null>
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
          ref={inputRef}
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
  const nameInputRef = useRef<HTMLInputElement>(null)
  const roleInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const focusAfterCloseRef = useRef<(() => void) | null>(null)
  const hasChanges =
    member !== undefined &&
    newMember.name.trim() !== '' &&
    (newMember.name !== member.name ||
      (newMember.nickname ?? '') !== (member.nickname ?? '') ||
      !listsAreEqual(newMember.roles, member.roles) ||
      !listsAreEqual(newMember.tags, member.tags))
  const submitMember = () => {
    if (!member || !hasChanges) {
      return
    }
    saveMember({ member: newMember, index: memberIndex })
    updateMemberInSquads({ memberName: member.name, member: newMember })
  }
  const navigateCommands = useMemo(
    () =>
      member
        ? squads.flatMap((squad, index) =>
            squad.members.some(squadMember => squadMember.name === member.name)
              ? [
                  {
                    id: `go-squad-${index}`,
                    title: `go ${squad.name}`,
                    subtitle: 'squad',
                    keywords: [
                      'squad',
                      squad.name,
                      ...squad.members.map(squadMember => squadMember.name),
                    ],
                    action: () => {
                      navigate({
                        to: '/squads/$squadId',
                        params: { squadId: String(index) },
                      })
                    },
                  },
                ]
              : []
          )
        : [],
    [member, navigate, squads]
  )
  useNavigateCommands(navigateCommands)
  useHotkey('A', () => {
    setIsAddSquadModalOpen(true)
  })
  useHotkey('Mod+S', () => {
    submitMember()
  })
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
  const roleOptions = [...new Set([...roles, ...newMember.roles])]
  const tagOptions = [...new Set([...tags, ...newMember.tags])]
  const toggleRole = (role: string) => {
    setNewMember(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(currentRole => currentRole !== role)
        : [...prev.roles, role],
    }))
  }
  const toggleTag = (tag: string) => {
    setNewMember(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(currentTag => currentTag !== tag)
        : [...prev.tags, tag],
    }))
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
            ref={nameInputRef}
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
            inputRef={roleInputRef}
            values={newMember.roles}
            suggestions={roles}
            onChange={newRoles => {
              setNewMember(prev => ({ ...prev, roles: newRoles }))
            }}
          />
          <TagEditor
            label='tags'
            inputRef={tagInputRef}
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
              <ArrowDownOnSquareIcon className='h-6 w-6' /> save
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
      <CommandPalette
        placeholder='member actions'
        afterClose={() => {
          const focus = focusAfterCloseRef.current
          if (!focus) {
            return
          }
          focusAfterCloseRef.current = null
          focus()
        }}
        commands={[
          {
            id: 'rename-member',
            title: 'rename member',
            subtitle: name,
            keywords: ['name', 'edit'],
            action: () => {
              focusAfterCloseRef.current = () => {
                nameInputRef.current?.focus()
                nameInputRef.current?.select()
              }
            },
          },
          {
            id: 'create-role',
            title: 'create new role',
            subtitle: 'add a role to this member',
            keywords: ['new', 'create', 'role'],
            action: () => {
              focusAfterCloseRef.current = () => {
                roleInputRef.current?.focus()
              }
            },
          },
          {
            id: 'create-tag',
            title: 'create new tag',
            subtitle: 'add a tag to this member',
            keywords: ['new', 'create', 'tag'],
            action: () => {
              focusAfterCloseRef.current = () => {
                tagInputRef.current?.focus()
              }
            },
          },
          ...roleOptions.map(role => ({
            id: `toggle-role-${role}`,
            title: `toggle role ${role}`,
            subtitle: newMember.roles.includes(role)
              ? 'selected'
              : 'not selected',
            keywords: ['role', 'toggle', role],
            action: () => {
              toggleRole(role)
            },
          })),
          ...tagOptions.map(tag => ({
            id: `toggle-tag-${tag}`,
            title: `toggle tag ${tag}`,
            subtitle: newMember.tags.includes(tag)
              ? 'selected'
              : 'not selected',
            keywords: ['tag', 'toggle', tag],
            action: () => {
              toggleTag(tag)
            },
          })),
          {
            id: 'add-to-squad',
            title: 'add to squad',
            subtitle: name,
            keywords: ['new'],
            action: () => {
              setIsAddSquadModalOpen(true)
            },
          },
          {
            id: 'delete-member',
            title: 'delete member',
            subtitle: name,
            keywords: ['remove'],
            action: () => {
              setIsConfirmModalOpen(true)
            },
          },
        ]}
      />
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
              <ArrowDownOnSquareIcon className='h-6 w-6' /> save
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
