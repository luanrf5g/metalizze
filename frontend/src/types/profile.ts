export type ProfileType = 'SQUARE' | 'RECTANGULAR' | 'ROUND' | 'OBLONG' | 'ANGLE' | 'U_CHANNEL'

export interface Profile {
  id: string
  sku: string
  profileType: ProfileType
  materialId: string
  material?: {
    id: string
    name: string
    slug: string
  } | null
  client?: {
    id: string
    name: string
    document: string
  } | null
  clientId: string | null
  width: number
  height: number
  length: number
  thickness: number
  quantity: number
  price: number | null
  storageLocation: string | null
  createdAt: string
}
