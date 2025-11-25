import { createClient } from '@/app/db/create-server-client'
import { redirect } from 'next/navigation'

export default async function Home () {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session === null) redirect('/login')

  
}