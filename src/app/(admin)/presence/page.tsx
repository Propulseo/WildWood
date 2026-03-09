import { getStaff } from '@/lib/data-access'
import { PresenceContent } from './presence-content'

export default async function PresencePage() {
  const staff = await getStaff()
  return <PresenceContent initialStaff={staff} />
}
