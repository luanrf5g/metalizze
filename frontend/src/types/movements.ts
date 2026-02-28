export interface InventoryMovements {
  id: string,
  sheetId: string,
  type: 'ENTRY' | 'EXIT',
  description?: string | null,
  quantity?: number,
  createdAt: string
}