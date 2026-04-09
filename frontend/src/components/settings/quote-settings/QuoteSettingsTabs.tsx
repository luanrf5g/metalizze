'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CuttingGasesSettingsTab } from './CuttingGasesSettingsTab'
import { AdditionalServicesSettingsTab } from './AdditionalServicesSettingsTab'
import { SetupRatesSettingsTab } from './SetupRatesSettingsTab'

interface Props {
  isAdmin: boolean
}

export function QuoteSettingsTabs({ isAdmin }: Props) {
  return (
    <Tabs defaultValue="cutting-gases" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
        <TabsTrigger value="cutting-gases">Gases de Corte</TabsTrigger>
        <TabsTrigger value="additional-services">Serviços Adicionais</TabsTrigger>
        <TabsTrigger value="setup-rates">Setup</TabsTrigger>
      </TabsList>

      <TabsContent value="cutting-gases" className="mt-6">
        <CuttingGasesSettingsTab isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="additional-services" className="mt-6">
        <AdditionalServicesSettingsTab isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="setup-rates" className="mt-6">
        <SetupRatesSettingsTab isAdmin={isAdmin} />
      </TabsContent>
    </Tabs>
  )
}
