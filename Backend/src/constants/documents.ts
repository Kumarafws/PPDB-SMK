import { DocumentType } from "@prisma/client"


export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
  DocumentType.ktp,
  DocumentType.kk,
  DocumentType.ijazah,
  DocumentType.skhun,
  DocumentType.foto,
  DocumentType.akta,
]
