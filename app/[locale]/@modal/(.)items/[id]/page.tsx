export default async function ItemModal({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  return (
    <div id='modal' role='dialog'>
      Item {id} in a modal ({locale})
    </div>
  )
}
