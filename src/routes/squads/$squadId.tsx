import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import CommandPalette from '@/components/command-palette'
import { PencilIcon, PlusIcon, SaveIcon, TrashIcon } from '@/components/icons'
import Modal from '@/components/modal'
import { useNavigateCommands } from '@/components/navigate-command-palette-provider'
import NewMemberForm from '@/components/new-member-form'
import PageFooter from '@/components/page-footer'
import type { Squad } from '@/lib/use-squads'
import { getSquads, useSquads } from '@/lib/use-squads'
import { useMembers } from '@/lib/use-members'
import { DEFAULT_TITLE } from '@/routes/__root'

const inputClassName =
  'bg-cb-blue w-full rounded border border-cb-dusty-blue px-2 py-1 outline-none focus:border-cb-pink'

const toggleFilterValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter(currentValue => currentValue !== value)
    : [...values, value]

export const Route = createFileRoute('/squads/$squadId')({
  component: RouteComponent,
  ssr: false,
  loader: ({ params }) => {
    const squads = getSquads()
    const squad = squads[Number(params.squadId)]
    return { squad }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.squad
          ? `${loaderData.squad.name} - ${DEFAULT_TITLE}`
          : `squads - ${DEFAULT_TITLE}`,
      },
    ],
  }),
})

function RouteComponent() {
  const { squadId: squadIdParam } = Route.useParams()
  const squadIndex = Number(squadIdParam)
  const navigate = useNavigate()
  const { squads, saveSquad, addMemberToSquad, removeMemberFromSquad } =
    useSquads()
  const { members: memberList, saveMember } = useMembers()
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isAddMemberCommandPaletteOpen, setIsAddMemberCommandPaletteOpen] =
    useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newSquadName, setNewSquadName] = useState('')
  const squad = squads.at(squadIndex)
  const navigateCommands = useMemo(
    () =>
      (squad?.members ?? []).flatMap(member => {
        const globalIndex = memberList.findIndex(
          currentMember => currentMember.name === member.name
        )
        if (globalIndex === -1) {
          return []
        }
        return [
          {
            id: `go-member-${globalIndex}`,
            title: `go ${member.name}`,
            subtitle: 'member',
            keywords: [
              'member',
              member.nickname ?? '',
              ...member.roles,
              ...member.tags,
            ],
            action: () => {
              navigate({
                to: '/members/$memberId',
                params: { memberId: String(globalIndex) },
              })
            },
          },
        ]
      }),
    [memberList, navigate, squad]
  )
  useNavigateCommands(navigateCommands)
  if (!squad) {
    return <p>squad does not exist</p>
  }

  const { name, members } = squad
  const updateSquad = (updates: Partial<Squad>) => {
    saveSquad({
      index: squadIndex,
      squad: { ...squad, ...updates },
    })
  }
  const squadMemberNames = new Set(members.map(member => member.name))
  const roles = [...new Set(memberList.flatMap(member => member.roles))]
  const tags = [...new Set(memberList.flatMap(member => member.tags))]
  const filteredMemberList = memberList.filter(
    member =>
      (selectedRoles.length === 0 ||
        selectedRoles.every(role => member.roles.includes(role))) &&
      (selectedTags.length === 0 ||
        selectedTags.every(tag => member.tags.includes(tag)))
  )
  const membersNotOnSquad = memberList.filter(
    member => !squadMemberNames.has(member.name)
  )
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2 className='flex items-center gap-2'>
          <span>{name}</span>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            aria-label='edit squad name'
            onClick={() => {
              setNewSquadName(name)
              setIsEditNameModalOpen(true)
            }}
          >
            <PencilIcon className='h-6 w-6' />
          </button>
        </h2>
        <div className='flex items-center justify-between'>
          <h3>members</h3>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            aria-label='add member'
            onClick={() => {
              setIsAddMemberCommandPaletteOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
        {members.length === 0 ? (
          <p>no members yet</p>
        ) : (
          <ul className='divide-cb-dusty-blue divide-y'>
            {members.map((member, memberIndex) => {
              const globalIndex = memberList.findIndex(
                currentMember => currentMember.name === member.name
              )
              const content = (
                <>
                  <span>{member.name}</span>
                  {member.nickname && (
                    <span className='text-sm'>{member.nickname}</span>
                  )}
                  <span>{member.roles.join(', ')}</span>
                  <span className='text-sm'>{member.tags.join(', ')}</span>
                </>
              )
              return (
                <li
                  key={`${member.name}-${memberIndex}`}
                  className='flex items-center gap-2 py-4 first:pt-0'
                >
                  {globalIndex > -1 ? (
                    <Link
                      to='/members/$memberId'
                      params={{ memberId: String(globalIndex) }}
                      className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline gap-2'
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className='flex grow items-baseline gap-2'>
                      {content}
                    </div>
                  )}
                  <button
                    className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                    type='button'
                    aria-label={`remove ${member.name}`}
                    onClick={() => {
                      removeMemberFromSquad({ squadIndex, memberIndex })
                    }}
                  >
                    <TrashIcon className='h-6 w-6' />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
      <PageFooter />
      <CommandPalette
        placeholder='squad actions'
        commands={[
          {
            id: 'edit-squad-name',
            title: 'edit squad name',
            subtitle: name,
            keywords: ['rename', 'squad'],
            action: () => {
              setNewSquadName(name)
              setIsEditNameModalOpen(true)
            },
          },
        ]}
      />
      <CommandPalette
        toggleIsOpenHotKey='A'
        placeholder='add member'
        isOpen={isAddMemberCommandPaletteOpen}
        setIsOpen={setIsAddMemberCommandPaletteOpen}
        filterGroups={[
          {
            id: 'role',
            label: 'role',
            options: roles,
            selected: selectedRoles,
            onToggle: role => {
              setSelectedRoles(prev => toggleFilterValue(prev, role))
            },
          },
          {
            id: 'tag',
            label: 'tag',
            options: tags,
            selected: selectedTags,
            onToggle: tag => {
              setSelectedTags(prev => toggleFilterValue(prev, tag))
            },
          },
        ]}
        commands={[
          {
            id: 'create-new-member',
            title: 'create new member',
            subtitle: 'create and add to this squad',
            keywords: ['new', 'create'],
            action: () => {
              setIsAddMemberModalOpen(true)
            },
          },
          ...filteredMemberList.map(member => ({
            id: `add-member-${member.name}`,
            title: `add ${member.name}`,
            subtitle: member.roles.join(', ') || 'member',
            keywords: [
              'member',
              member.nickname ?? '',
              ...member.roles,
              ...member.tags,
            ],
            disabled: squadMemberNames.has(member.name),
            action: () => {
              addMemberToSquad({ squadIndex, member })
            },
          })),
        ]}
      />
      <CommandPalette
        toggleIsOpenHotKey='R'
        placeholder='remove member'
        commands={members.map((member, memberIndex) => ({
          id: `remove-member-${member.name}`,
          title: `remove ${member.name}`,
          subtitle: member.roles.join(', ') || 'member',
          keywords: [
            'remove',
            'drop',
            member.nickname ?? '',
            ...member.roles,
            ...member.tags,
          ],
          action: () => {
            removeMemberFromSquad({ squadIndex, memberIndex })
          },
        }))}
      />
      <Modal
        title='edit squad name'
        isOpen={isEditNameModalOpen}
        setIsOpen={setIsEditNameModalOpen}
      >
        <form
          className='space-y-3'
          onSubmit={event => {
            event.preventDefault()
            updateSquad({ name: newSquadName.trim() })
            setIsEditNameModalOpen(false)
          }}
        >
          <input
            type='text'
            autoFocus
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
              disabled={
                newSquadName.trim() === '' || newSquadName.trim() === name
              }
            >
              <SaveIcon className='h-6 w-6' /> save
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        title='add member'
        isOpen={isAddMemberModalOpen}
        setIsOpen={setIsAddMemberModalOpen}
      >
        {membersNotOnSquad.length > 0 && (
          <ul className='divide-cb-white/25 divide-y'>
            {membersNotOnSquad.map(member => (
              <li key={member.name} className='flex gap-2 py-4 first:pt-0'>
                <button
                  className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2'
                  type='button'
                  onClick={() => {
                    addMemberToSquad({ squadIndex, member })
                    setIsAddMemberModalOpen(false)
                  }}
                >
                  <PlusIcon className='h-6 w-6' /> {member.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <hr className='border-cb-white/25' />
        <p>create new member</p>
        <NewMemberForm
          submitLabel='create and add'
          onSubmit={member => {
            saveMember({ member })
            addMemberToSquad({ squadIndex, member })
            setIsAddMemberModalOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
