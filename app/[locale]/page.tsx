import Link from 'next/link'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const prefix = locale === 'en' ? '' : `/${locale}`
  return (
    <main>
      <h1>Home ({locale})</h1>
      <Link href={`${prefix}/items`}>Items</Link>
    </main>
  )
}
