import Link from 'next/link'

export default async function Items({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const prefix = locale === 'en' ? '' : `/${locale}`
  return (
    <main>
      <h1 id='list'>Items ({locale})</h1>
      <Link id='item-link' href={`${prefix}/items/1`}>
        Open item 1
      </Link>
    </main>
  )
}
