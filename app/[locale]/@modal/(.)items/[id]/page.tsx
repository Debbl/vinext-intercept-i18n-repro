import { CloseButton } from './close-button'

export default async function ItemModal({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  return (
    <dialog id='modal' open>
      <p>
        Item {id} in a modal ({locale})
      </p>
      <CloseButton />
    </dialog>
  )
}
