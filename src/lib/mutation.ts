import { toast } from 'sonner'

interface MutateOptions<T> {
  optimistic?: () => T
  mutationFn: () => Promise<void>
  rollback?: (snapshot: T) => void
  successMessage?: string
  errorMessage?: string
}

export async function mutate<T>(opts: MutateOptions<T>) {
  const snapshot = opts.optimistic?.()
  try {
    await opts.mutationFn()
    if (opts.successMessage) toast.success(opts.successMessage)
  } catch (e) {
    if (snapshot !== undefined && opts.rollback) opts.rollback(snapshot)
    toast.error(opts.errorMessage ?? 'Erreur', {
      description: e instanceof Error ? e.message : 'Une erreur est survenue',
    })
  }
}
