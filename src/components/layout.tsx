import NavigateCommandPalette from '@/components/navigate-command-palette'
import { NavigateCommandPaletteProvider } from '@/components/navigate-command-palette-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <NavigateCommandPaletteProvider>
      <div className='bg-cb-dark-blue text-cb-white flex min-h-screen flex-col'>
        {children}
        <NavigateCommandPalette />
      </div>
    </NavigateCommandPaletteProvider>
  )
}
