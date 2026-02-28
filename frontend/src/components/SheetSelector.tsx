'use client'

import { Sheet } from "@/types/sheet";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { cn } from "@/lib/utils";

interface SheetSelectorProps {
  sheets: Sheet[],
  selectedSheetId: string,
  onSelectSheet: (sheetId: string) => void
}

export function SheetSelector({ sheets, selectedSheetId, onSelectSheet }: SheetSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedSheet = sheets.find((sheet) => sheet.id === selectedSheetId)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role="combobox"
          type="button"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedSheet ? `${selectedSheet.sku}` : 'Selecione uma chapa...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por SKU, material..."/>

          <CommandList>
            <CommandEmpty>Nenhuma chapa encontrada</CommandEmpty>
            {selectedSheet !== undefined && (
              <CommandItem
                key={selectedSheet?.id}
                value={`${selectedSheet?.sku}`}
                onSelect={() => {
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedSheetId === selectedSheet?.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{selectedSheet?.sku}</span>
                  <span className="text-xs text-muted-foreground">
                    Qtd: {selectedSheet?.quantity} | {selectedSheet?.type === 'STANDARD' ? 'Chapa' : 'Retalho'}
                  </span>
                </div>
              </CommandItem>
            )}
            <CommandGroup>
              {sheets.filter((item) => item !== selectedSheet).map((sheet) => (
                <CommandItem
                  key={sheet.id}
                  value={`${sheet.sku}`}
                  onSelect={() => {
                    onSelectSheet(sheet.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedSheetId === sheet.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{sheet.sku}</span>
                    <span className="text-xs text-muted-foreground">
                      Qtd: {sheet.quantity} | {sheet.type === 'STANDARD' ? 'Chapa' : 'Retalho'}
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