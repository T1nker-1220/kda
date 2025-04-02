import { Sidebar } from '@/components/dashboard/layout/sidebar'
import { Header } from '@/components/dashboard/layout/header'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is logged in and is admin
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  // Get user role from our database
  const { data: userData } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single()
    
  // Only allow admins to access dashboard
  if (!userData || userData.role !== 'ADMIN') {
    redirect('/')
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 