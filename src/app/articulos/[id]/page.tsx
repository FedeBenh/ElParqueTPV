import ArticuloEditClient from '../../../components/ArticuloEditClient'

export default function Page({ params }: { params: { id: string } }) {
  return <ArticuloEditClient id={params.id} />
}
