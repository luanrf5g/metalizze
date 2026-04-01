'use client'

import { Profile } from "@/types/profile"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { cn } from "@/lib/utils"
import { translateProfileType } from "@/lib/formatters"

interface ProfileSelectorProps {
  profiles: Profile[]
  selectedProfileId: string
  onSelectProfile: (profileId: string) => void
  selectedProfile?: Profile | null
}

export function ProfileSelector({ profiles, selectedProfileId, onSelectProfile, selectedProfile: selectedProfileProp }: ProfileSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedProfileFromList = profiles.find((p) => p.id === selectedProfileId)
  const selectedProfile = selectedProfileFromList ?? selectedProfileProp ?? undefined

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={open}
          className="w-full justify-between font-normal overflow-hidden"
        >
          {selectedProfile ? `${selectedProfile.sku}` : 'Selecione um perfil...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white" align="start">
        <Command>
          <CommandInput placeholder="Buscar por SKU, material, tipo..." />

          <CommandList>
            <CommandEmpty>Nenhum perfil encontrado</CommandEmpty>
            {selectedProfile !== undefined && (
              <CommandItem
                key={selectedProfile?.id}
                value={`${selectedProfile?.sku} ${selectedProfile?.material?.name ?? ''} ${translateProfileType(selectedProfile?.profileType ?? '')}`}
                onSelect={() => {
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedProfileId === selectedProfile?.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{selectedProfile?.sku}</span>
                  <span className="text-xs text-muted-foreground">
                    Qtd: {selectedProfile?.quantity} | {translateProfileType(selectedProfile?.profileType ?? '')}
                  </span>
                </div>
              </CommandItem>
            )}
            <CommandGroup>
              {profiles.filter((item) => item.id !== selectedProfile?.id).map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={`${profile.sku} ${profile.material?.name ?? ''} ${translateProfileType(profile.profileType)}`}
                  onSelect={() => {
                    onSelectProfile(profile.id)
                    setOpen(false)
                  }}
                  className="hover:cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProfileId === profile.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{profile.sku}</span>
                    <span className="text-xs text-muted-foreground">
                      Qtd: {profile.quantity} | {translateProfileType(profile.profileType)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
