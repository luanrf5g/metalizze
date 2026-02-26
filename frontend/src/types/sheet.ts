export interface Sheet {
  id: string,
  materialId: string,
  client?: {
    id: string,
    name: string,
    document: string
  } | null,
  sku: string,
  width: number,
  height: number,
  thickness: number,
  quantity: number,
  type: 'STANDARD' | 'SCRAP',
  createdAt: string
}