import { Fragment, useMemo, useState } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { useHotkeys } from '@tanstack/react-hotkeys'
import type { RegisterableHotkey } from '@tanstack/react-hotkeys'

export type Command = {
  id: string
  title: string
  subtitle?: string
  keywords?: string[]
  disabled?: boolean
  action: (args?: unknown) => void | Promise<void>
}

export type CommandFilterGroup = {
  id: string
  label?: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}

const defaultToggleIsOpenHotkeys: RegisterableHotkey[] = ['Mod+K', 'Control+K']
const disabledScorePenalty = 0.1

const rankCommand = (command: Command, score: number) =>
  score + (command.disabled ? disabledScorePenalty : 0)

export default function CommandPalette({
  commands,
  placeholder = 'search commands',
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  showLaunchButton,
  toggleIsOpenHotKey,
  filterGroups,
}: {
  commands: Command[]
  placeholder?: string
  isOpen?: boolean
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  showLaunchButton?: boolean
  toggleIsOpenHotKey?: RegisterableHotkey | RegisterableHotkey[]
  filterGroups?: CommandFilterGroup[]
}) {
  const [internalIsOpen, internalSetIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isOpen = externalIsOpen ?? internalIsOpen
  const setIsOpen = externalSetIsOpen ?? internalSetIsOpen
  const toggleIsOpen = () => {
    if (
      !isOpen &&
      document.querySelector('[role="dialog"][aria-modal="true"]')
    ) {
      return
    }
    setIsOpen(open => !open)
  }
  const hotkeys =
    toggleIsOpenHotKey === undefined
      ? defaultToggleIsOpenHotkeys
      : Array.isArray(toggleIsOpenHotKey)
        ? toggleIsOpenHotKey
        : [toggleIsOpenHotKey]
  useHotkeys(
    hotkeys.map(hotkey => ({
      hotkey,
      callback: toggleIsOpen,
    }))
  )

  const fuse = useMemo(
    () =>
      new Fuse(commands, {
        keys: [
          'id',
          'title',
          { name: 'subtitle', weight: 0.5 },
          { name: 'keywords', weight: 0.5 },
        ],
        includeScore: true,
        ignoreLocation: true,
        threshold: 0.4,
      }),
    [commands]
  )

  const hasActiveFilters =
    filterGroups?.some(group => group.selected.length > 0) ?? false
  const filteredCommands = useMemo(
    () =>
      (!query
        ? commands.map(command => ({ command, score: 0 }))
        : fuse.search(query.toLowerCase()).map(({ item, score }) => ({
            command: item,
            score: score ?? 0,
          }))
      )
        .sort(
          (first, second) =>
            rankCommand(first.command, first.score) -
            rankCommand(second.command, second.score)
        )
        .map(({ command }) => command),
    [commands, fuse, query]
  )

  return (
    <>
      <Transition show={isOpen} as={Fragment} afterLeave={() => setQuery('')}>
        <Dialog
          onClose={setIsOpen}
          className='fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh]'
        >
          <TransitionChild
            enter='duration-200 ease-out'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='duration-150 ease-in'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <DialogBackdrop className='bg-cobalt/80 fixed inset-0' />
          </TransitionChild>
          <TransitionChild
            enter='duration-200 ease-out'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='duration-150 ease-in'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel>
              <Combobox
                as='div'
                immediate
                onChange={(command: Command | null) => {
                  if (!command || command.disabled) {
                    return
                  }
                  setIsOpen(false)
                  void command.action()
                }}
                className='bg-cb-dusty-blue text-cb-white divide-cb-white/10 relative mx-auto max-w-lg divide-y overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/20'
              >
                <div className='flex items-center gap-2 px-4'>
                  <MagnifyingGlassIcon className='text-cb-white/50 h-5 w-5 shrink-0' />
                  <ComboboxInput
                    autoFocus
                    onChange={event => {
                      setQuery(event.target.value)
                    }}
                    onKeyDownCapture={event => {
                      if (event.key === 'Tab') {
                        event.stopPropagation()
                      }
                    }}
                    className='text-cb-white placeholder:text-cb-white/40 h-12 w-full border-0 bg-transparent px-0 outline-none'
                    placeholder={placeholder}
                  />
                  <kbd className='border-cb-white/15 bg-cb-dark-blue text-cb-white/50 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px]'>
                    esc
                  </kbd>
                </div>
                {filterGroups?.map(group =>
                  group.options.length > 0 ? (
                    <div
                      key={group.id}
                      className='flex items-start gap-2 px-4 py-2'
                    >
                      {group.label && (
                        <span className='text-cb-white/50 shrink-0 pt-2 text-xs'>
                          {group.label}
                        </span>
                      )}
                      <ul className='flex gap-2 overflow-x-auto'>
                        {group.options.map(option => (
                          <li key={option} className='shrink-0'>
                            <button
                              className={classNames(
                                'focus-visible:ring-cb-pink rounded-lg border px-2 py-1.5 text-sm text-nowrap outline-none focus-visible:ring-2',
                                group.selected.includes(option)
                                  ? 'border-cb-pink bg-cb-pink text-cb-dark-blue'
                                  : 'border-cb-white/15 bg-cb-blue text-cb-white hover:border-cb-pink/50'
                              )}
                              type='button'
                              aria-pressed={group.selected.includes(option)}
                              onMouseDown={event => {
                                event.preventDefault()
                              }}
                              onClick={() => {
                                group.onToggle(option)
                              }}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
                {filteredCommands.length > 0 && (
                  <ComboboxOptions
                    static
                    className='max-h-72 overflow-y-auto py-2 text-sm'
                  >
                    {filteredCommands.map(command => (
                      <ComboboxOption
                        key={command.id}
                        value={command}
                        disabled={command.disabled}
                      >
                        {({ active }) => (
                          <div
                            className={classNames(
                              'px-4 py-2',
                              command.disabled
                                ? 'text-cb-white/30 cursor-not-allowed'
                                : active
                                  ? 'bg-cb-pink text-cb-dark-blue'
                                  : 'text-cb-white'
                            )}
                          >
                            <span className='font-medium'>{command.title}</span>
                            {command.subtitle && (
                              <span
                                className={classNames(
                                  'ml-2',
                                  active
                                    ? 'text-cb-dark-blue/70'
                                    : 'text-cb-white/50'
                                )}
                              >
                                {command.subtitle}
                              </span>
                            )}
                          </div>
                        )}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                )}
                {filteredCommands.length === 0 && (
                  <p className='text-cb-white/50 px-4 py-6 text-center text-sm'>
                    no results found
                  </p>
                )}
                <div className='text-cb-white/40 flex items-center justify-between gap-4 px-4 py-2 text-xs'>
                  <span className='flex items-center gap-3'>
                    <span>
                      <kbd className='border-cb-white/15 bg-cb-dark-blue mr-1 rounded border px-1 py-0.5 font-mono text-[10px]'>
                        ↑
                      </kbd>
                      <kbd className='border-cb-white/15 bg-cb-dark-blue rounded border px-1 py-0.5 font-mono text-[10px]'>
                        ↓
                      </kbd>{' '}
                      navigate
                    </span>
                    <span>
                      <kbd className='border-cb-white/15 bg-cb-dark-blue mr-1 rounded border px-1 py-0.5 font-mono text-[10px]'>
                        ↵
                      </kbd>
                      select
                    </span>
                  </span>
                  {hasActiveFilters && <span>filters active</span>}
                </div>
              </Combobox>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
      {externalSetIsOpen === undefined && showLaunchButton && (
        <button
          className='bg-cb-off-blue text-cb-yellow fixed right-4 bottom-20 z-40 rounded-lg p-2 shadow-lg md:hidden'
          type='button'
          aria-label='open command palette'
          onClick={() => {
            setIsOpen(!isOpen)
          }}
        >
          <RocketLaunchIcon className='h-6 w-6' />
        </button>
      )}
    </>
  )
}
