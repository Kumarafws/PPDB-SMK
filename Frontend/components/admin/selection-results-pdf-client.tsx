"use client"

import dynamic from "next/dynamic"

type SelectionItem = {
  id: string
  full_name: string
  email: string | null
  major_label: string
  selection_notes: string | null
  wave_label: string
}

type Props = {
  acceptedStudents: SelectionItem[]
  rejectedStudents: SelectionItem[]
}

const SelectionResultsPdf = dynamic(
  () => import("@/components/admin/selection-results-pdf").then((m) => m.SelectionResultsPdf),
  { ssr: false }
)

export function SelectionResultsPdfClient(props: Props) {
  return <SelectionResultsPdf {...props} />
}

