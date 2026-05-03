import VentaDetailClient from '../../../components/VentaDetailClient'

export default function Page({ params }: { params: { id: string } }) {
  return <VentaDetailClient id={params.id} />
}
