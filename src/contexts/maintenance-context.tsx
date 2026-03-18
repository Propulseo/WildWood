'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { MaintenanceTask } from '@/lib/types'
import { getMaintenanceTasks } from '@/lib/data-access'
import * as maintenanceQ from '@/lib/supabase/queries/maintenance'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface MaintenanceContextType {
  tasks: MaintenanceTask[]
  addTask: (task: MaintenanceTask) => void
  updateTaskStatut: (taskId: string, statut: MaintenanceTask['statut'], resolvedBy?: string) => void
  deleteTask: (taskId: string) => void
  getTasksByBungalow: (bungalowId: string) => MaintenanceTask[]
  countByStatut: (statut: MaintenanceTask['statut']) => number
  countAFaireByBungalow: (bungalowId: string) => number
  loading: boolean
  error: string | null
  refetch: () => void
}

const MaintenanceContext = createContext<MaintenanceContextType | null>(null)

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setTasks(await getMaintenanceTasks()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('maintenance_taches', '*', fetchData)

  async function addTask(task: MaintenanceTask) {
    await mutate({
      optimistic: () => { const prev = tasks; setTasks((p) => [...p, task]); return prev },
      mutationFn: () => maintenanceQ.insertMaintenanceTache({
        bungalow_id: Number(task.bungalow_id.replace('bung-', '')),
        titre: task.titre,
        description: task.description,
        priorite: task.priorite,
      }).then(() => {}),
      rollback: (prev) => setTasks(prev),
      successMessage: 'Tache ajoutee',
      errorMessage: 'Erreur ajout tache',
    })
  }

  async function updateTaskStatut(taskId: string, statut: MaintenanceTask['statut'], resolvedBy?: string) {
    await mutate({
      optimistic: () => {
        const prev = tasks
        setTasks((p) =>
          p.map((t) => {
            if (t.id !== taskId) return t
            return {
              ...t, statut,
              date_resolution: statut === 'fait' ? new Date().toISOString().slice(0, 10) : null,
              resolved_by: statut === 'fait' ? (resolvedBy ?? t.resolved_by) : null,
            }
          })
        )
        return prev
      },
      mutationFn: () => maintenanceQ.updateMaintenanceTache(taskId, {
        statut,
        ...(statut === 'fait' ? { date_resolution: new Date().toISOString(), resolved_by: resolvedBy } : {}),
      }).then(() => {}),
      rollback: (prev) => setTasks(prev),
      successMessage: statut === 'fait' ? 'Tache terminee' : 'Statut mis a jour',
      errorMessage: 'Erreur mise a jour tache',
    })
  }

  async function deleteTask(taskId: string) {
    await mutate({
      optimistic: () => { const prev = tasks; setTasks((p) => p.filter((t) => t.id !== taskId)); return prev },
      mutationFn: () => maintenanceQ.deleteMaintenanceTache(taskId),
      rollback: (prev) => setTasks(prev),
      successMessage: 'Tache supprimee',
      errorMessage: 'Erreur suppression tache',
    })
  }

  function getTasksByBungalow(bungalowId: string) {
    return tasks.filter((t) => t.bungalow_id === bungalowId)
  }

  function countByStatut(statut: MaintenanceTask['statut']) {
    return tasks.filter((t) => t.statut === statut).length
  }

  function countAFaireByBungalow(bungalowId: string) {
    return tasks.filter((t) => t.bungalow_id === bungalowId && t.statut === 'a_faire').length
  }

  return (
    <MaintenanceContext value={{
      tasks, addTask, updateTaskStatut, deleteTask,
      getTasksByBungalow, countByStatut, countAFaireByBungalow,
      loading, error, refetch: fetchData,
    }}>
      {children}
    </MaintenanceContext>
  )
}

export function useMaintenance() {
  const ctx = useContext(MaintenanceContext)
  if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider')
  return ctx
}
