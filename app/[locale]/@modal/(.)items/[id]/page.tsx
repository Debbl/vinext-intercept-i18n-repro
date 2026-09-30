export default async function ItemModal({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  return (
    <dialog id='modal' open>
      Item {id} in a modal ({locale})
    </dialog>
  )
}
