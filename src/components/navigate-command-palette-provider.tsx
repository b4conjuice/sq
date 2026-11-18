import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import type { Command } from '@/components/command-palette'

type NavigateCommandsActions = {
  register: (id: string, commands: Command[]) => void
  unregister: (id: string) => void
}

const NavigateCommandsActionsContext =
  createContext<NavigateCommandsActions | null>(null)
const NavigateCommandsContext = createContext<Command[]>([])

export function NavigateCommandPaletteProvider({
  children,
}: {
  children: ReactNode
}) {
  const [registrations, setRegistrations] = useState<Record<string, Command[]>>(
    {}
  )
  const register = useCallback((id: string, commands: Command[]) => {
    setRegistrations(previous => {
      if (previous[id] === commands) {
        return previous
      }
      return { ...previous, [id]: commands }
    })
  }, [])
  const unregister = useCallback((id: string) => {
    setRegistrations(previous => {
      if (!(id in previous)) {
        return previous
      }
      const next = { ...previous }
      delete next[id]
      return next
    })
  }, [])
  const actions = useMemo(
    () => ({ register, unregister }),
    [register, unregister]
  )
  const commands = useMemo(
    () => Object.values(registrations).flat(),
    [registrations]
  )

  return (
    <NavigateCommandsActionsContext.Provider value={actions}>
      <NavigateCommandsContext.Provider value={commands}>
        {children}
      </NavigateCommandsContext.Provider>
    </NavigateCommandsActionsContext.Provider>
  )
}

export function useNavigateCommands(commands: Command[]) {
  const actions = useContext(NavigateCommandsActionsContext)
  if (actions === null) {
    throw new Error(
      'useNavigateCommands must be used within NavigateCommandPaletteProvider'
    )
  }
  const id = useId()
  useEffect(() => {
    actions.register(id, commands)
    return () => {
      actions.unregister(id)
    }
  }, [actions, commands, id])
}

export function useRegisteredNavigateCommands() {
  return useContext(NavigateCommandsContext)
}
