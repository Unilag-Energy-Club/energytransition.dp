import { notFound } from 'next/navigation'
import { getPocketBase, getFileUrl, DpGenerationRecord } from '@/lib/pocketbase'
import ResultClient from './ResultClient'

interface Props {
  params: { id: string }
}

export default async function ResultPage({ params }: Props) {
  const pb = getPocketBase()

  let record: DpGenerationRecord

  try {
    record = await pb
      .collection('dp_generations')
      .getOne<DpGenerationRecord>(params.id)
  } catch {
    notFound()
  }

  const dpUrl = getFileUrl(record, record.generated_dp)

  return <ResultClient name={record.name} dpUrl={dpUrl} recordId={record.id} />
}
