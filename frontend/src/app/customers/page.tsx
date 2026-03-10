'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { AlertCircleIcon, Edit2Icon, EyeIcon, MailIcon, PhoneIcon, FileTextIcon, UserIcon, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Client } from "@/types/clients";
import { CreateClientModal } from "@/components/CreateClientModal";
import { formatDocument, formatPhone } from "@/lib/formatters";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.permissions?.['clients']?.write;

  async function fetchClients() {
    setIsLoading(true)
    setHasError(false)
    try {
      const response = await api.get('/clients')
      setClients(response.data.clients)

    } catch (error) {
      console.error('Erro ao buscar os Materiais: ', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
    console.log(clients)
  }, [])

  function handleViewDetails(client: Client) {
    setSelectedClient(client);
    setIsEditing(false);
    setIsDetailsPanelOpen(true);
  }

  function startEditing() {
    if (!selectedClient) return;
    setEditName(selectedClient.name);
    setEditPhone(selectedClient.phone || '');
    setEditEmail(selectedClient.email || '');
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  async function handleSave() {
    if (!selectedClient) return;
    setIsSaving(true);

    try {
      await api.patch(`/clients/${selectedClient.id}`, {
        name: editName.trim(),
        email: editEmail.trim() === '' ? null : editEmail.trim(),
        phone: editPhone.trim() === '' ? null : editPhone.trim()
      });

      toast.success("Cliente atualizado com sucesso!", { duration: 2000 });
      setIsEditing(false);
      await fetchClients();

      // Atualiza o cliente selecionado com os novos dados
      const updatedClient = {
        ...selectedClient,
        name: editName.trim(),
        document: selectedClient.document,
        phone: editPhone.trim() === '' ? null : editPhone.trim(),
        email: editEmail.trim() === '' ? null : editEmail.trim()
      };
      setSelectedClient(updatedClient);
      setClients((prev) => prev.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      ));
    } catch (error) {
      console.error('Erro ao atualizar cliente: ', error);
      if (error instanceof AxiosError) {
        console.error('Detalhes da API:', error.response?.status, error.response?.data)
      }
      toast.error('Erro ao atualizar cliente. Verifique os dados.', { duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-700'>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
            Clientes
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mt-2">
            Banco de clientes cadastrados.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-black/20"
            />
          </div>
          {canCreate && <CreateClientModal onSuccess={fetchClients} />}
        </div>
      </div>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Erro ao tentar buscar a lista de materiais. Tente novamente após alguns momentos.
          </AlertDescription>
        </Alert>
      )}

      <div className="glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1">
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          <Table>
            <TableHeader className="bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-center w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : clients.filter(c => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return c.name.toLowerCase().includes(query) || formatDocument(c.document).includes(query);
              }).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.filter(c => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return c.name.toLowerCase().includes(query) || formatDocument(c.document).includes(query);
                }).map((client, index) => (
                  <TableRow key={client.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className="font-mono text-xs text-zinc-400 dark:text-zinc-500">#{(index + 1).toString().padStart(3, '0')}</TableCell>
                    <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{client.name}</TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">{formatDocument(client.document)}</TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {client.phone ? formatPhone(client.phone) : <span className="text-zinc-400 text-xs italic">Não informado</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(client)}
                        className="h-8 w-8 p-0 hover:bg-zinc-800/10 dark:hover:bg-white/10"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Painel lateral com detalhes do cliente */}
      {selectedClient && (
        <Sheet open={isDetailsPanelOpen} onOpenChange={setIsDetailsPanelOpen}>
          <SheetContent side="right" className="px-6 w-full sm:w-140 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-200/50 dark:border-zinc-800/50 overflow-y-auto">
            <SheetHeader className="space-y-3 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-500/10 shrink-0">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {isEditing ? 'Editar Cliente' : selectedClient.name}
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500 dark:text-zinc-400">
                      {isEditing ? 'Atualize as informações do cliente' : 'Detalhes do cadastro'}
                    </SheetDescription>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-5 pb-6">
              <>
                {/* Modo Visualização */}
                {/* Card Nome */}
                <div className="glass-card p-5 border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Nome</label>
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Digite o nome do cliente"
                          className="text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-fuchsia-400 focus:border-violet-500 outline-none w-full appearance-none"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{selectedClient.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Documento */}
                <div className="glass-card p-5 border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <FileTextIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Documento</label>
                      <p className="text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                        {formatDocument(selectedClient.document)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Telefone */}
                <div className="glass-card p-5 border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <PhoneIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Telefone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Digite o telefone"
                          className="text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-green-400 focus:border-emerald-500 outline-none w-full appearance-none"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                          {selectedClient.phone ? formatPhone(selectedClient.phone) : <span className="text-zinc-400 italic text-base">Não informado</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card E-mail */}
                <div className="glass-card p-5 border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <MailIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">E-mail</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Digite o e-mail"
                          className="text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-cyan-400 focus:border-blue-500 outline-none w-full appearance-none"
                        />
                      ) : (
                        <p className="text-base font-medium text-zinc-900 dark:text-zinc-100 mt-1 break-all">
                          {selectedClient.email || <span className="text-zinc-400 italic">Não informado</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card ID */}
                <div className="glass-card p-5 border border-zinc-200/50 dark:border-zinc-800/50">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">ID do Sistema</label>
                  <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/50 px-3 py-2 rounded-md">
                    {selectedClient.id}
                  </p>
                </div>

                {/* Botão Editar no modo visualização */}
                <div className="pt-2">
                  {isEditing ? (
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        variant="outline"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                      >
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={startEditing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                    >
                      <Edit2Icon className="h-4 w-4 mr-2" />
                      Editar Informações do Cliente
                    </Button>
                  )}
                </div>
              </>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}