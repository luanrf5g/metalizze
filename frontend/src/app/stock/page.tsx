'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layers, RectangleHorizontal } from 'lucide-react'
import { SheetsTab } from '@/components/stock/SheetsTab'
import { ProfilesTab } from '@/components/stock/ProfilesTab'

type StockTab = 'sheets' | 'profiles'

export default function StockPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = (searchParams.get('tab') as StockTab) || 'sheets'
  const [activeTab, setActiveTab] = useState<StockTab>(initialTab)

  function handleTabChange(tab: StockTab) {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'sheets') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.replace(`/stock${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  return (
    <div className='p-6 md:p-10 w-full h-full mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4'>
        <div>
          <h1 className='text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1'>Estoque</h1>
          <p className='text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1'>Gerencie chapas e perfis disponíveis no estoque.</p>
        </div>
      </div>

      {/* Top-level tab switcher: Chapas | Perfis */}
      <div className='flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl w-full md:w-auto overflow-hidden shrink-0 self-start'>
        <button
          onClick={() => handleTabChange('sheets')}
          className={`flex items-center gap-2 flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${activeTab === 'sheets' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
        >
          <Layers className="h-4 w-4" />
          Chapas
        </button>
        <button
          onClick={() => handleTabChange('profiles')}
          className={`flex items-center gap-2 flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${activeTab === 'profiles' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
        >
          <RectangleHorizontal className="h-4 w-4" />
          Perfis
        </button>
      </div>

      {activeTab === 'sheets' ? <SheetsTab /> : <ProfilesTab />}
    </div>
  )
}