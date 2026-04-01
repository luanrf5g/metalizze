'use client'

import { useCallback, useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { Sheet } from "@/types/sheet"
import { Profile } from "@/types/profile"
import { Client } from "@/types/clients"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Layers, Loader2, RectangleHorizontal, Scissors } from "lucide-react"

import { Stepper } from "@/components/cut-orders/Stepper"
import { StepSheetSelection } from "@/components/cut-orders/StepSheetSelection"
import { StepScraps, ScrapForm } from "@/components/cut-orders/StepScraps"
import { StepSummary } from "@/components/cut-orders/StepSummary"
import { StepProfileSelection } from "@/components/cut-orders/StepProfileSelection"
import { StepProfileLeftover, LeftoverForm } from "@/components/cut-orders/StepProfileLeftover"
import { StepProfileSummary } from "@/components/cut-orders/StepProfileSummary"

type CutMode = 'sheet' | 'profile'

function CutOrdersWizard() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<CutMode>('sheet')
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Shared data
  const [clients, setClients] = useState<Client[]>([])

  // Sheet data
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [sheetId, setSheetId] = useState("")
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null)
  const [sheetQuantity, setSheetQuantity] = useState("")
  const [sheetDescription, setSheetDescription] = useState("")

  // Scraps
  const [hasScraps, setHasScraps] = useState(false)
  const [scraps, setScraps] = useState<ScrapForm[]>([
    { width: "", height: "", quantity: "1", clientId: "none" }
  ])

  // Profile data
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profileId, setProfileId] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profileQuantity, setProfileQuantity] = useState("")
  const [profileDescription, setProfileDescription] = useState("")
  const [hasLeftover, setHasLeftover] = useState(false)
  const [leftovers, setLeftovers] = useState<LeftoverForm[]>([
    { length: "", quantity: "1" }
  ])

  const totalSteps = 3

  // Mode change resets
  function handleModeChange(newMode: CutMode) {
    if (newMode === mode) return
    setMode(newMode)
    setCurrentStep(0)
  }

  // ─── Sheet helpers ────────────────────────────────────
  const fetchSheetDetails = useCallback(async (id: string) => {
    if (!id) { setSelectedSheet(null); return }
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

  // ─── Profile helpers ──────────────────────────────────
  const fetchProfileDetails = useCallback(async (id: string) => {
    if (!id) { setSelectedProfile(null); return }
    try {
      const response = await api.get(`/profiles/${id}`)
      setSelectedProfile(response.data.profile)
    } catch {
      toast.error("Erro ao buscar detalhes do perfil.")
    }
  }, [])

  function handleSelectProfile(id: string) {
    setProfileId(id)
    fetchProfileDetails(id)
  }

  // ─── Fetch data ───────────────────────────────────────
  useEffect(() => {
    let active = true

    async function load() {
      try {
        // Fetch sheets (paginated)
        const aggregatedSheets: Sheet[] = []
        let currentPage = 1
        let totalPages: number | null = null

        while (totalPages === null || currentPage <= totalPages) {
          const pageRes = await api.get(`/sheets?page=${currentPage}`)
          const pageSheets: Sheet[] = pageRes.data.sheets || []
          aggregatedSheets.push(...pageSheets)

          const meta = pageRes.data.meta
          if (meta && typeof meta.totalPages === 'number') {
            totalPages = meta.totalPages
          } else if (pageSheets.length < 15) {
            break
          }
          currentPage += 1
        }

        // Fetch profiles (all)
        const profilesRes = await api.get('/profiles/all')

        // Fetch clients
        const clientsRes = await api.get('/clients')

        if (!active) return

        setSheets(aggregatedSheets)
        setProfiles(profilesRes.data.profiles || [])
        setClients(clientsRes.data.clients)

        // Auto-select from URL params
        const urlSheetId = searchParams.get('sheetId')
        const urlProfileId = searchParams.get('profileId')

        if (urlProfileId) {
          setMode('profile')
          handleSelectProfile(urlProfileId)
        } else if (urlSheetId) {
          handleSelectSheet(urlSheetId)
        }
      } catch {
        if (!active) return
        toast.error("Erro ao carregar dados.")
      }
    }
    load()

    return () => { active = false }
  }, [searchParams, fetchSheetDetails, fetchProfileDetails])

  // ─── Scrap helpers ────────────────────────────────────
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

  // ─── Leftover helpers ─────────────────────────────────
  function addLeftover() {
    setLeftovers((prev) => [...prev, { length: "", quantity: "1" }])
  }

  function removeLeftover(index: number) {
    setLeftovers((prev) => prev.filter((_, i) => i !== index))
  }

  function updateLeftover(index: number, field: keyof LeftoverForm, value: string) {
    setLeftovers((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    )
  }

  // ─── Validation ───────────────────────────────────────
  function canAdvanceSheetStep1() {
    return sheetId !== "" && sheetQuantity !== "" && Number(sheetQuantity) > 0 && sheetDescription.trim() !== ""
  }

  function canAdvanceSheetStep2() {
    if (!hasScraps) return true
    return scraps.every(
      (s) => s.width !== "" && Number(s.width) > 0 && s.height !== "" && Number(s.height) > 0 && s.quantity !== "" && Number(s.quantity) > 0
    )
  }

  function canAdvanceProfileStep1() {
    return profileId !== "" && profileQuantity !== "" && Number(profileQuantity) > 0 && profileDescription.trim() !== ""
  }

  function canAdvanceProfileStep2() {
    if (!hasLeftover) return true
    return leftovers.every(
      (l) => l.length !== "" && Number(l.length) > 0 && l.quantity !== "" && Number(l.quantity) > 0 &&
        (!selectedProfile || Number(l.length) < selectedProfile.length)
    )
  }

  // ─── Navigation ───────────────────────────────────────
  function nextStep() {
    if (mode === 'sheet') {
      if (currentStep === 0 && !canAdvanceSheetStep1()) {
        toast.error("Preencha todos os campos obrigatórios.")
        return
      }
      if (currentStep === 1 && !canAdvanceSheetStep2()) {
        toast.error("Preencha corretamente os dados dos retalhos.")
        return
      }
    } else {
      if (currentStep === 0 && !canAdvanceProfileStep1()) {
        toast.error("Preencha todos os campos obrigatórios.")
        return
      }
      if (currentStep === 1 && !canAdvanceProfileStep2()) {
        toast.error("Informe corretamente o comprimento restante.")
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // ─── Submit ───────────────────────────────────────────
  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      if (mode === 'sheet') {
        const payload = {
          sheetId,
          quantityToCut: Number(sheetQuantity),
          description: sheetDescription,
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

        // Reset sheet form
        setSheetId("")
        setSelectedSheet(null)
        setSheetQuantity("")
        setSheetDescription("")
        setHasScraps(false)
        setScraps([{ width: "", height: "", quantity: "1", clientId: "none" }])
      } else {
        await api.post("/profiles/cut", {
          profileId,
          quantityToCut: Number(profileQuantity),
          description: profileDescription,
          leftovers: hasLeftover
            ? leftovers
              .filter((l) => Number(l.length) > 0 && Number(l.quantity) > 0)
              .map((l) => ({ length: Number(l.length), quantity: Number(l.quantity) }))
            : [],
        })

        // Update local profile quantity
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? { ...p, quantity: p.quantity - Number(profileQuantity) }
              : p
          )
        )

        // Reset profile form
        setProfileId("")
        setSelectedProfile(null)
        setProfileQuantity("")
        setProfileDescription("")
        setHasLeftover(false)
        setLeftovers([{ length: "", quantity: "1" }])
      }

      toast.success("Ordem de corte registrada com sucesso!")
      setCurrentStep(0)
    } catch {
      toast.error("Erro ao registrar a ordem de corte.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mode selector */}
      <div className="shrink-0 flex items-center gap-2 mb-6">
        <Button
          type="button"
          variant={mode === 'sheet' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => handleModeChange('sheet')}
        >
          <Layers className="w-4 h-4" />
          Chapas
        </Button>
        <Button
          type="button"
          variant={mode === 'profile' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => handleModeChange('profile')}
        >
          <RectangleHorizontal className="w-4 h-4" />
          Perfis
        </Button>
      </div>

      <div className="shrink-0">
        <Stepper currentStep={currentStep} mode={mode} />
      </div>

      {/* Card with carousel slides */}
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden border-zinc-200 shadow-sm bg-white mt-8">
        <CardContent className="flex-1 min-h-0 p-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <div
              className="flex h-full absolute inset-0 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              {mode === 'sheet' ? (
                <>
                  <div className="w-full shrink-0 h-full overflow-y-auto">
                    <StepSheetSelection
                      sheets={sheets}
                      sheetId={sheetId}
                      selectedSheet={selectedSheet}
                      quantity={sheetQuantity}
                      description={sheetDescription}
                      onSelectSheet={handleSelectSheet}
                      onQuantityChange={setSheetQuantity}
                      onDescriptionChange={setSheetDescription}
                    />
                  </div>

                  <div className="w-full shrink-0 h-full overflow-y-auto">
                    <StepScraps
                      hasScraps={hasScraps}
                      scraps={scraps}
                      clients={clients}
                      onToggleScraps={() => setHasScraps(!hasScraps)}
                      onAddScrap={addScrap}
                      onRemoveScrap={removeScrap}
                      onUpdateScrap={updateScrap}
                    />
                  </div>

                  <div className="w-full shrink-0 h-full overflow-y-auto">
                    <StepSummary
                      selectedSheet={selectedSheet}
                      quantity={sheetQuantity}
                      description={sheetDescription}
                      hasScraps={hasScraps}
                      scraps={scraps}
                      clients={clients}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full shrink-0 h-full overflow-y-auto">
                    <StepProfileSelection
                      profiles={profiles}
                      profileId={profileId}
                      selectedProfile={selectedProfile}
                      quantity={profileQuantity}
                      description={profileDescription}
                      onSelectProfile={handleSelectProfile}
                      onQuantityChange={setProfileQuantity}
                      onDescriptionChange={setProfileDescription}
                    />
                  </div>

                  <div className="w-full shrink-0 h-full overflow-y-auto">
                    <StepProfileLeftover
                      selectedProfile={selectedProfile}
                      hasLeftover={hasLeftover}
                      leftovers={leftovers}
                      onToggleLeftover={() => setHasLeftover(!hasLeftover)}
                      onAddLeftover={addLeftover}
                      onRemoveLeftover={removeLeftover}
                      onUpdateLeftover={updateLeftover}
                    />
                  </div>

                  <div className="w-full shrink-0 h-full overflow-y-auto">
                    <StepProfileSummary
                      selectedProfile={selectedProfile}
                      quantity={profileQuantity}
                      description={profileDescription}
                      hasLeftover={hasLeftover}
                      leftovers={leftovers}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer with navigation buttons */}
          <div className="shrink-0 flex items-center justify-between p-6 pt-4 border-t mt-auto">
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

            {currentStep < totalSteps - 1 ? (
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

export default function CutOrdersPage() {
  return (
    <div className="flex flex-col h-full p-8 max-w-3xl mx-auto space-y-2">
      {/* Page Header */}
      <div className="shrink-0 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Operação de Corte</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Registre uma ordem de corte ou utilização de um material.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-12 shrink-0">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      }>
        <CutOrdersWizard />
      </Suspense>
    </div>
  )
}