import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'

import { PlusIcon } from '@/components/icons'
import NewMemberModal from '@/components/new-member-modal'
import { useNavigateCommands } from '@/components/navigate-command-palette-provider'
import PageFooter from '@/components/page-footer'
import { useMembers } from '@/lib/use-members'
import { DEFAULT_TITLE } from '@/routes/__root'

const inputClassName =
  'bg-cb-blue w-full rounded border border-cb-dusty-blue px-2 py-1 outline-none focus:border-cb-pink'

export const Route = createFileRoute('/members/')({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [{ title: `members - ${DEFAULT_TITLE}` }],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { members, saveMember } = useMembers()
  const [search, setSearch] = useState('')
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const navigateCommands = useMemo(
    () =>
      members.map((member, index) => ({
        id: `go-member-${index}`,
        title: `go ${member.name}`,
        subtitle: member.roles.join(', ') || 'member',
        keywords: [
          'member',
          member.nickname ?? '',
          ...member.roles,
          ...member.tags,
        ],
        action: () => {
          navigate({
            to: '/members/$memberId',
            params: { memberId: String(index) },
          })
        },
      })),
    [members, navigate]
  )
  useNavigateCommands(navigateCommands)
  useHotkey('A', () => {
    setIsAddMemberModalOpen(true)
  })

  const roles = [...new Set(members.flatMap(member => member.roles))]
  const allRoleTags = [...roles, 'no-role']
  const tags = [...new Set(members.flatMap(member => member.tags))]
  const allTagTags = [...tags, 'no-tag']

  const query = search.trim().toLowerCase()
  const filteredMembers = members
    .filter(member =>
      query === ''
        ? true
        : [
            member.name,
            member.nickname ?? '',
            ...member.roles,
            ...member.tags,
          ].some(value => value.toLowerCase().includes(query))
    )
    .filter(member =>
      selectedRoles.length === 0
        ? true
        : selectedRoles.every(role =>
            role === 'no-role'
              ? member.roles.length === 0
              : member.roles.includes(role)
          )
    )
    .filter(member =>
      selectedTags.length === 0
        ? true
        : selectedTags.every(tag =>
            tag === 'no-tag'
              ? member.tags.length === 0
              : member.tags.includes(tag)
          )
    )

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(currentRole => currentRole !== role)
        : [...prev, role]
    )
  }
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(currentTag => currentTag !== tag)
        : [...prev, tag]
    )
  }

  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <input
          type='text'
          className={inputClassName}
          placeholder='search'
          value={search}
          onChange={event => {
            setSearch(event.target.value)
          }}
        />
        {allRoleTags.length > 0 && (
          <ul className='flex gap-2 overflow-x-auto'>
            {allRoleTags.map(role => (
              <li key={role}>
                <button
                  className={`bg-cb-blue rounded-lg border p-2 text-nowrap ${
                    selectedRoles.includes(role)
                      ? 'border-cb-pink'
                      : 'border-cb-blue'
                  }`}
                  type='button'
                  onClick={() => {
                    toggleRole(role)
                  }}
                >
                  {role}
                </button>
              </li>
            ))}
          </ul>
        )}
        {allTagTags.length > 0 && (
          <ul className='flex gap-2 overflow-x-auto'>
            {allTagTags.map(tag => (
              <li key={tag}>
                <button
                  className={`bg-cb-blue rounded-lg border p-2 text-nowrap ${
                    selectedTags.includes(tag)
                      ? 'border-cb-pink'
                      : 'border-cb-blue'
                  }`}
                  type='button'
                  onClick={() => {
                    toggleTag(tag)
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        )}
        {filteredMembers.length === 0 &&
          (query !== '' ||
            selectedRoles.length > 0 ||
            selectedTags.length > 0) && <p>no results found</p>}
        <ul className='divide-cb-dusty-blue divide-y'>
          {filteredMembers.map(member => {
            const index = members.indexOf(member)
            return (
              <li
                key={`${member.name}-${index}`}
                className='flex items-center gap-2 py-4 first:pt-0'
              >
                <Link
                  to='/members/$memberId'
                  params={{ memberId: String(index) }}
                  className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline gap-2'
                >
                  <span>{member.name}</span>
                  {member.nickname && (
                    <span className='text-sm'>{member.nickname}</span>
                  )}
                  <span>{member.roles.join(', ')}</span>
                  <span className='text-sm'>{member.tags.join(', ')}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
      <PageFooter>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          aria-label='add member'
          onClick={() => {
            setIsAddMemberModalOpen(true)
          }}
        >
          <PlusIcon className='h-6 w-6' />
        </button>
      </PageFooter>
      <NewMemberModal
        isOpen={isAddMemberModalOpen}
        setIsOpen={setIsAddMemberModalOpen}
        title='add member'
        onSubmit={member => {
          saveMember({ member })
        }}
      />
    </>
  )
}
