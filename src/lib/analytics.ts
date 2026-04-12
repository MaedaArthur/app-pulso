import { supabase } from './supabase'

export async function track(
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('events').insert({
    user_id: user.id,
    event,
    properties: properties ?? null,
  })
}
