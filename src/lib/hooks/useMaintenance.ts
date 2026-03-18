'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MaintenanceTask } from '@/lib/types'
import * as maintenanceQ from '@/lib/supabase/queries/maintenance'
import * as bungalowsQ from '@/lib/supabase/queries/bungalows'

interface BungalowSimple { id: string; numero: number }

interface UseMaintenanceReturn {
  tasks: MaintenanceTask[]
  bungalows: BungalowSimple[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addTask: (task: MaintenanceTask) => Promise<void>
  updateTaskStatut: (taskId: string, statut: MaintenanceTask['statut'], resolvedBy?: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  getTasksByBungalow: (bungalowId: string) => MaintenanceTask[]
  countByStatut: (statut: MaintenanceTask['statut']) => number
  countAFaireByBungalow: (bungalowId: string) => number
}

function mapTask(row: Record<string, unknown>): MaintenanceTask {
  return {
    id: row.id as string,
    bungalow_id: `bung-${row.bungalow_id}`,
    titre: row.titre as string,
    description: (row.description as string) ?? '',
    priorite: row.priorite as MaintenanceTask['priorite'],
    statut: row.statut as MaintenanceTask['statut'],
    date_creation: row.date_creation as string,
    date_resolution: row.date_resolution as string | null,
    created_by: (row.created_by as string) ?? '',
    resolved_by: row.resolved_by as string | null,
  }
}

export function useMaintenance(): UseMaintenanceReturn {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])
  const [bungalows, setBungalows] = useState<BungalowSimple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [tachesData, bungData] = await Promise.all([
        maintenanceQ.getMaintenanceTaches(),
        bungalowsQ.getBungalows(),
      ])
      setTasks(tachesData.map((r: Record<string, unknown>) => mapTask(r)))
      setBungalows(
        bungData
          .map((b: { id: number; nom: string; statut: string }) => ({ id: `bung-${b.id}`, numero: b.id }))
          .sort((a: BungalowSimple, b: BungalowSimple) => a.numero - b.numero)
          .slice(0, 6)
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  async function addTask(task: MaintenanceTask) {
    const dbBungId = parseInt(task.bungalow_id.replace('bung-', ''), 10)
    await maintenanceQ.insertMaintenanceTache({
      bungalow_id: dbBungId,
      titre: task.titre,
      description: task.description || undefined,
      priorite: task.priorite || undefined,
      created_by: task.created_by || undefined,
    })
    await refetch()
  }

  async function updateTaskStatut(
    taskId: string, statut: MaintenanceTask['statut'], resolvedBy?: string
  ) {
    const updates: Record<string, unknown> = { statut }
    if (statut === 'fait') {
      updates.date_resolution = new Date().toISOString()
      if (resolvedBy) updates.resolved_by = resolvedBy
    }
    await maintenanceQ.updateMaintenanceTache(taskId, updates)
    await refetch()
  }

  async function deleteTask(taskId: string) {
    await maintenanceQ.deleteMaintenanceTache(taskId)
    await refetch()
  }

  const getTasksByBungalow = useCallback(
    (bungalowId: string) => tasks.filter((t) => t.bungalow_id === bungalowId),
    [tasks]
  )

  const countByStatut = useCallback(
    (statut: MaintenanceTask['statut']) => tasks.filter((t) => t.statut === statut).length,
    [tasks]
  )

  const countAFaireByBungalow = useCallback(
    (bungalowId: string) => tasks.filter((t) => t.bungalow_id === bungalowId && t.statut === 'a_faire').length,
    [tasks]
  )

  return {
    tasks, bungalows, loading, error, refetch,
    addTask, updateTaskStatut, deleteTask,
    getTasksByBungalow, countByStatut, countAFaireByBungalow,
  }
}
