export interface InventoryMovements {
  id: string,
  sheetId: string | null,
  profileId: string | null,
  type: 'ENTRY' | 'EXIT',
  description?: string | null,
  quantity?: number,
  createdAt: string
}