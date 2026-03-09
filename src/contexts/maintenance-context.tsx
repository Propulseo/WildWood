'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { MaintenanceTask } from '@/lib/types'
import { getMaintenanceTasks } from '@/lib/data-access'

interface MaintenanceContextType {
  tasks: MaintenanceTask[]
  addTask: (task: MaintenanceTask) => void
  updateTaskStatut: (taskId: string, statut: MaintenanceTask['statut'], resolvedBy?: string) => void
  deleteTask: (taskId: string) => void
  getTasksByBungalow: (bungalowId: string) => MaintenanceTask[]
  countByStatut: (statut: MaintenanceTask['statut']) => number
  countAFaireByBungalow: (bungalowId: string) => number
}

const MaintenanceContext = createContext<MaintenanceContextType | null>(null)

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])

  useEffect(() => {
    getMaintenanceTasks().then(setTasks)
  }, [])

  function addTask(task: MaintenanceTask) {
    setTasks((prev) => [...prev, task])
  }

  function updateTaskStatut(taskId: string, statut: MaintenanceTask['statut'], resolvedBy?: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          statut,
          date_resolution: statut === 'fait' ? new Date().toISOString().slice(0, 10) : null,
          resolved_by: statut === 'fait' ? (resolvedBy ?? t.resolved_by) : null,
        }
      })
    )
  }

  function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
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
