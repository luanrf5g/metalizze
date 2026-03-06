'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function SettingsPage() {
  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Configurações salvas com sucesso!")
  }

  return (
    <div className="p-8 w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie as preferências da sua conta e do sistema.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Empresa</CardTitle>
                <CardDescription>
                  Informações básicas da sua oficina ou empresa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input id="companyName" defaultValue="Metalizze Soluções" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cnpj">CNPJ / Documento</Label>
                  <Input id="cnpj" defaultValue="00.000.000/0001-00" />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Gerencie suas informações de acesso e credenciais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Operador Padrão" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" defaultValue="oficina@metalizze.com" />
                </div>
                <div className="space-y-1 mt-4 border-t pt-4">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-end">
                <Button type="submit">Atualizar Perfil</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}