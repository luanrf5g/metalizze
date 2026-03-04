'use client'

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Sheet } from "@/types/sheet"
import { Client } from "@/types/clients"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Scissors } from "lucide-react"

import { Stepper } from "@/components/cut-orders/Stepper"
import { StepSheetSelection } from "@/components/cut-orders/StepSheetSelection"
import { StepScraps, ScrapForm } from "@/components/cut-orders/StepScraps"
import { StepSummary } from "@/components/cut-orders/StepSummary"

export default function CutOrdersPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [clients, setClients] = useState<Client[]>([])

  // Step 1 - Sheet selection
  const [sheetId, setSheetId] = useState("")
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null)
  const [quantity, setQuantity] = useState("")
  const [description, setDescription] = useState("")

  // Step 2 - Scraps
  const [hasScraps, setHasScraps] = useState(false)
  const [scraps, setScraps] = useState<ScrapForm[]>([
    { width: "", height: "", quantity: "1", clientId: "none" }
  ])

  // Fetch full sheet details when selection changes
  const fetchSheetDetails = useCallback(async (id: string) => {
    if (!id) {
      setSelectedSheet(null)
      return
    }
    try {
      const response = await api.get(`/sheets/${id}`)
      setSelectedSheet(response.data.sheet)
    } catch {
      toast.error("Erro ao buscar detalhes da chapa.")
    }
  }, [])

  function handleSelectSheet(id: string) {
    setSheetId(id)
    fetchSheetDetails(id)
  }

  // Fetch data
  useEffect(() => {
    async function load() {
      try {
        const [sheetsRes, clientsRes] = await Promise.all([
          api.get('/sheets'),
          api.get('/clients'),
        ])
        setSheets(sheetsRes.data.sheets)
        setClients(clientsRes.data.clients)
      } catch {
        toast.error("Erro ao carregar dados.")
      }
    }
    load()
  }, [])

  // Scrap helpers
  function addScrap() {
    setScraps((prev) => [...prev, { width: "", height: "", quantity: "1", clientId: "none" }])
  }

  function removeScrap(index: number) {
    setScraps((prev) => prev.filter((_, i) => i !== index))
  }

  function updateScrap(index: number, field: keyof ScrapForm, value: string) {
    setScraps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  // Validation
  function canAdvanceStep1() {
    return sheetId !== "" && quantity !== "" && Number(quantity) > 0 && description.trim() !== ""
  }

  function canAdvanceStep2() {
    if (!hasScraps) return true
    return scraps.every(
      (s) => s.width !== "" && Number(s.width) > 0 && s.height !== "" && Number(s.height) > 0 && s.quantity !== "" && Number(s.quantity) > 0
    )
  }

  // Navigation
  function nextStep() {
    if (currentStep === 0 && !canAdvanceStep1()) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }
    if (currentStep === 1 && !canAdvanceStep2()) {
      toast.error("Preencha corretamente os dados dos retalhos.")
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2))
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Submit
  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const payload = {
        sheetId,
        quantityToCut: Number(quantity),
        description,
        generatedScraps: hasScraps
          ? scraps.map((s) => ({
              width: Number(s.width),
              height: Number(s.height),
              quantity: Number(s.quantity),
              clientId: s.clientId === "none" ? null : s.clientId,
            }))
          : [],
      }

      await api.post("/sheets/cut", payload)

      toast.success("Ordem de corte registrada com sucesso!")

      // Reset form
      setSheetId("")
      setSelectedSheet(null)
      setQuantity("")
      setDescription("")
      setHasScraps(false)
      setScraps([{ width: "", height: "", quantity: "1", clientId: "none" }])
      setCurrentStep(0)
    } catch {
      toast.error("Erro ao registrar a ordem de corte.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Operação de Corte</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Registre uma ordem de corte ou utilização de um material.
        </p>
      </div>

      <Stepper currentStep={currentStep} />

      {/* Card with carousel slides */}
      <Card className="overflow-hidden border-zinc-200 shadow-sm bg-white">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              <StepSheetSelection
                sheets={sheets}
                sheetId={sheetId}
                selectedSheet={selectedSheet}
                quantity={quantity}
                description={description}
                onSelectSheet={handleSelectSheet}
                onQuantityChange={setQuantity}
                onDescriptionChange={setDescription}
              />

              <StepScraps
                hasScraps={hasScraps}
                scraps={scraps}
                clients={clients}
                onToggleScraps={() => setHasScraps(!hasScraps)}
                onAddScrap={addScrap}
                onRemoveScrap={removeScrap}
                onUpdateScrap={updateScrap}
              />

              <StepSummary
                selectedSheet={selectedSheet}
                quantity={quantity}
                description={description}
                hasScraps={hasScraps}
                scraps={scraps}
                clients={clients}
              />
            </div>
          </div>

          {/* Footer with navigation buttons */}
          <div className="flex items-center justify-between p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>

            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="gap-1"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    Registrar Ordem de Corte
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}