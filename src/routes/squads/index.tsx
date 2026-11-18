import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import ConfirmModal from '@/components/confirm-modal'
import { PlusIcon, SaveIcon, TrashIcon } from '@/components/icons'
import Modal from '@/components/modal'
import { useNavigateCommands } from '@/components/navigate-command-palette-provider'
import PageFooter from '@/components/page-footer'
import { createSquad, useSquads } from '@/lib/use-squads'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/squads/')({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [{ title: `squads - ${DEFAULT_TITLE}` }],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { squads, saveSquad, deleteSquadByIndex } = useSquads()
  const [isAddSquadModalOpen, setIsAddSquadModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [newSquadName, setNewSquadName] = useState('')
  const [squadToBeDeletedIndex, setSquadToBeDeletedIndex] = useState<
    number | null
  >(null)
  const squadToBeDeleted =
    squadToBeDeletedIndex === null ? null : squads[squadToBeDeletedIndex]
  const navigateCommands = useMemo(
    () =>
      squads.map((squad, index) => ({
        id: `go-squad-${index}`,
        title: `go ${squad.name}`,
        subtitle: 'squad',
        keywords: [
          'squad',
          squad.name,
          ...squad.members.map(member => member.name),
        ],
        action: () => {
          navigate({
            to: '/squads/$squadId',
            params: { squadId: String(index) },
          })
        },
      })),
    [navigate, squads]
  )
  useNavigateCommands(navigateCommands)
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        {squads.length === 0 ? (
          <p>no squads yet</p>
        ) : (
          <ul className='divide-cb-dusty-blue divide-y'>
            {squads.map((squad, index) => (
              <li
                key={index}
                className='flex items-center gap-2 py-4 first:pt-0'
              >
                <Link
                  to='/squads/$squadId'
                  params={{
                    squadId: String(index),
                  }}
                  className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline justify-between gap-2'
                >
                  <span>{squad.name}</span>
                  <span className='text-cb-white/60 text-sm'>
                    {squad.members.length}{' '}
                    {squad.members.length === 1 ? 'member' : 'members'}
                  </span>
                </Link>
                <button
                  className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                  type='button'
                  aria-label={`delete ${squad.name}`}
                  onClick={() => {
                    setSquadToBeDeletedIndex(index)
                    setIsConfirmModalOpen(true)
                  }}
                >
                  <TrashIcon className='h-6 w-6' />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <PageFooter>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          aria-label='add squad'
          onClick={() => {
            setIsAddSquadModalOpen(true)
          }}
        >
          <PlusIcon className='h-6 w-6' />
        </button>
      </PageFooter>
      <Modal
        title='add squad'
        isOpen={isAddSquadModalOpen}
        setIsOpen={setIsAddSquadModalOpen}
      >
        <form
          className='space-y-3'
          onSubmit={event => {
            event.preventDefault()
            saveSquad({ squad: createSquad(newSquadName.trim()) })
            setNewSquadName('')
            setIsAddSquadModalOpen(false)
            navigate({
              to: '/squads/$squadId',
              params: { squadId: String(squads.length) },
            })
          }}
        >
          <input
            type='text'
            autoFocus
            className='bg-cb-blue border-cb-dusty-blue focus:border-cb-pink w-full rounded border px-2 py-1 outline-none'
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
      {squadToBeDeletedIndex !== null && squadToBeDeleted && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          action={() => {
            deleteSquadByIndex(squadToBeDeletedIndex)
            setSquadToBeDeletedIndex(null)
          }}
        >
          delete {squadToBeDeleted.name}?
        </ConfirmModal>
      )}
    </>
  )
}
