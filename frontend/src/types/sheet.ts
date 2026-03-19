export interface Sheet {
  id: string,
  materialId: string,
  material?: {
    id: string,
    name: string,
    slug: string
  } | null,
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
  price?: number | null,
  type: 'STANDARD' | 'SCRAP',
  createdAt: string
}