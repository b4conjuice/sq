import { readLocalStorage, useLocalStorage } from '@/lib/use-local-storage'

export type Member = {
  name: string
  nickname?: string
  roles: string[]
  tags: string[]
}

const defaultMembers: Member[] = [
  {
    name: 'Ada Lovelace',
    nickname: 'ada',
    roles: ['lead'],
    tags: ['engineering'],
  },
]

const MEMBERS_STORAGE_KEY = 'sq-members'

export function getMembers(): Member[] {
  return readLocalStorage(MEMBERS_STORAGE_KEY, defaultMembers)
}

export function useMembers() {
  const [members, setMembers] = useLocalStorage<Member[]>(
    MEMBERS_STORAGE_KEY,
    defaultMembers
  )
  const overwriteMembers = (newMembers: Member[]) => {
    setMembers(newMembers)
  }
  const saveMember = ({
    member,
    index,
  }: {
    member: Member
    index?: number
  }) => {
    setMembers(prev => {
      if (index === undefined || index < 0) {
        return [...prev, member]
      }
      const newMembers = [...prev]
      newMembers[index] = member
      return newMembers
    })
  }
  const deleteMemberByIndex = (index: number) => {
    setMembers(prev => prev.filter((_, currentIndex) => currentIndex !== index))
  }
  return {
    members,
    saveMember,
    deleteMemberByIndex,
    overwriteMembers,
  }
}
