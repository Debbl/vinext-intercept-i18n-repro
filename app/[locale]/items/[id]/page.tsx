export default async function Item({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  return <h1 id='full-page'>Item {id} full page ({locale})</h1>
}
