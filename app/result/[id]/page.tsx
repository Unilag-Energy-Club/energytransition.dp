import { notFound } from 'next/navigation'
import { getPocketBase, getFileUrl, DpGenerationRecord } from '@/lib/pocketbase'
import ResultClient from './ResultClient'

interface Props {
  params: { id: string }
}

export async function generateStaticParams() {
  // For dynamic IDs created at runtime (stored in PocketBase),
  // we return an empty array to opt out of static generation.
  // This page will use on-demand ISR or dynamic rendering instead.
  return []
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
