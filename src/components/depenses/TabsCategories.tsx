'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type DepenseTab = 'all' | 'gym' | 'resort' | 'fnb'

interface Props {
  value: DepenseTab
  onChange: (v: DepenseTab) => void
}

export function TabsCategories({ value, onChange }: Props) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as DepenseTab)}>
      <TabsList>
        <TabsTrigger value="all">TOUTES</TabsTrigger>
        <TabsTrigger value="gym">GYM</TabsTrigger>
        <TabsTrigger value="fnb">F&B</TabsTrigger>
        <TabsTrigger value="resort">RESORT</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
