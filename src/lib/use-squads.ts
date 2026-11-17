import { readLocalStorage, useLocalStorage } from '@/lib/use-local-storage'
import type { Member } from '@/lib/use-members'

export type Squad = {
  name: string
  members: Member[]
}

const defaultSquads: Squad[] = []

const SQUADS_STORAGE_KEY = 'sq-squads'

export function getSquads(): Squad[] {
  return readLocalStorage(SQUADS_STORAGE_KEY, defaultSquads)
}

export const createSquad = (name: string): Squad => ({
  name,
  members: [],
})

export function useSquads() {
  const [squads, setSquads] = useLocalStorage<Squad[]>(
    SQUADS_STORAGE_KEY,
    defaultSquads
  )
  const overwriteSquads = (newSquads: Squad[]) => {
    setSquads(newSquads)
  }
  const saveSquad = ({ squad, index }: { squad: Squad; index?: number }) => {
    setSquads(prev => {
      if (index === undefined || index < 0) {
        return [...prev, squad]
      }
      const newSquads = [...prev]
      newSquads[index] = squad
      return newSquads
    })
  }
  const deleteSquadByIndex = (index: number) => {
    setSquads(prev => prev.filter((_, currentIndex) => currentIndex !== index))
  }
  const addMemberToSquad = ({
    squadIndex,
    member,
  }: {
    squadIndex: number
    member: Member
  }) => {
    setSquads(prev =>
      prev.map((squad, index) => {
        if (index !== squadIndex) {
          return squad
        }
        if (
          squad.members.some(
            currentMember => currentMember.name === member.name
          )
        ) {
          return squad
        }
        return { ...squad, members: [...squad.members, member] }
      })
    )
  }
  const removeMemberFromSquad = ({
    squadIndex,
    memberIndex,
  }: {
    squadIndex: number
    memberIndex: number
  }) => {
    setSquads(prev =>
      prev.map((squad, index) =>
        index === squadIndex
          ? {
              ...squad,
              members: squad.members.filter(
                (_, currentIndex) => currentIndex !== memberIndex
              ),
            }
          : squad
      )
    )
  }
  const updateMemberInSquads = ({
    memberName,
    member,
  }: {
    memberName: string
    member: Member
  }) => {
    setSquads(prev =>
      prev.map(squad => ({
        ...squad,
        members: squad.members.map(squadMember =>
          squadMember.name === memberName ? member : squadMember
        ),
      }))
    )
  }
  const removeMemberFromAllSquads = ({
    memberName,
  }: {
    memberName: string
  }) => {
    setSquads(prev =>
      prev.map(squad => ({
        ...squad,
        members: squad.members.filter(
          squadMember => squadMember.name !== memberName
        ),
      }))
    )
  }
  return {
    squads,
    saveSquad,
    deleteSquadByIndex,
    addMemberToSquad,
    removeMemberFromSquad,
    updateMemberInSquads,
    removeMemberFromAllSquads,
    overwriteSquads,
  }
}
