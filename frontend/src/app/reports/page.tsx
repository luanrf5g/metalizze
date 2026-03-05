'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"

const materialUsageData = [
  { name: 'Aço Carbono 2mm', usadas: 400, retalhos: 45 },
  { name: 'Aço Inox 1.5mm', usadas: 300, retalhos: 20 },
  { name: 'Alumínio 3mm', usadas: 200, retalhos: 10 },
  { name: 'Galvanizado 2mm', usadas: 278, retalhos: 39 },
  { name: 'Cobre 1mm', usadas: 189, retalhos: 4 },
];

const productivityData = [
  { name: 'Seg', ordens: 40 },
  { name: 'Ter', ordens: 30 },
  { name: 'Qua', ordens: 55 },
  { name: 'Qui', ordens: 45 },
  { name: 'Sex', ordens: 60 },
  { name: 'Sáb', ordens: 20 },
  { name: 'Dom', ordens: 5  },
];

export default function ReportsPage() {
  return (
    <div className="p-8 w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Gerenciais</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe os indicadores de produção, uso de chapas e eficiência.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Ordens (Mês)</CardDescription>
            <CardTitle className="text-4xl">1,248</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 font-medium">+12% comparado ao mês passado</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chapas Consumidas</CardDescription>
            <CardTitle className="text-4xl">3,092</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-600 font-medium">-4% comparado ao mês passado</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Retalhos Gerados</CardDescription>
            <CardTitle className="text-4xl">423</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 font-medium">+2% comparado ao mês passado</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clientes Ativos</CardDescription>
            <CardTitle className="text-4xl">142</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Estável desde o último trimestre</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Uso de Materiais e Retalhos</CardTitle>
            <CardDescription>
              Comparativo entre quantidade de chapas utilizadas e retalhos gerados.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialUsageData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: '#f4f4f5' }} />
                <Legend />
                <Bar dataKey="usadas" name="Chapas Usadas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retalhos" name="Retalhos" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtividade da Semana</CardTitle>
            <CardDescription>
              Volume de ordens de corte processadas por dia na última semana.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: '#f4f4f5' }} />
                <Line type="monotone" dataKey="ordens" name="Ordens Finalizadas" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}