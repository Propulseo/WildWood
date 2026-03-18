import { createClient } from '@/lib/supabase/client'

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get staff record for the current authenticated user.
 * Links auth.uid() to the staff table via email.
 */
export async function getStaffForCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

  const { data } = await supabase
    .from('staff')
    .select('id, prenom, email, poste, avatar_initiales')
    .eq('email', user.email)
    .single()

  return data
}
