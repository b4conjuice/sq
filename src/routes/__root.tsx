// import { createRootRouteWithContext } from '@tanstack/react-router' // uncomment if tRPC added
import { createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

// import type { QueryClient } from '@tanstack/react-query'

// import type { TRPCRouter } from '@/integrations/trpc/router'
// import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import Shell from '@/components/shell'

// interface MyRouterContext {
//   queryClient: QueryClient

//   trpc: TRPCOptionsProxy<TRPCRouter>
// }

const DEFAULT_TITLE = 'sq'

// export const Route = createRootRouteWithContext<MyRouterContext>()({
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: DEFAULT_TITLE,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: Shell,
})
