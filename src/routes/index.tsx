import { Link, createFileRoute } from '@tanstack/react-router'

import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [{ title: `home - ${DEFAULT_TITLE}` }],
  }),
})

function Home() {
  return (
    <main className='flex grow flex-col p-4'>
      <div className='flex grow flex-col items-center justify-center gap-6'>
        <h1 className='text-2xl font-bold'>squadz</h1>
        <ul className='flex flex-col items-center gap-3'>
          <li>
            <Link
              to='/squads'
              className='text-cb-pink hover:text-cb-pink/75 text-lg'
            >
              squads
            </Link>
          </li>
          <li>
            <Link
              to='/members'
              className='text-cb-pink hover:text-cb-pink/75 text-lg'
            >
              members
            </Link>
          </li>
        </ul>
      </div>
    </main>
  )
}
