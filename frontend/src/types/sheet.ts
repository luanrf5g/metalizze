export interface Sheet {
  id: string,
  materialId: string,
  clientId: string | null,
  sku: string,
  width: number,
  height: number,
  thickness: number,
  quantity: number,
  type: 'STANDARD' | 'SCRAP',
  createdAt: string
}