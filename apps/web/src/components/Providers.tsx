'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WsProvider } from '@/lib/ws-context'
import { store } from '@/store'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  )

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <WsProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="top-center" richColors />
            {mounted && <ReactQueryDevtools initialIsOpen={false} />}
          </WsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </ThemeProvider>
  )
}
