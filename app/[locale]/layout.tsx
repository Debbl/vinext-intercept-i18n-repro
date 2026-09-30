import type { ReactNode } from 'react'

export default async function Layout({
  children,
  modal,
  params,
}: {
  children: ReactNode
  modal: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>
        {children}
        {modal}
      </body>
    </html>
  )
}
