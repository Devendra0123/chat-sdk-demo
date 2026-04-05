'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { BusinessSetupForm } from '@/components/business-setup-form'
import { createClient } from '@/lib/supabase/client'

interface Business {
  id: string
  name: string
  industry: string
  description: string
  phone_number: string
  email: string
  website: string
  opening_hours: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchBusinesses()
  }

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses')
      if (!response.ok) throw new Error('Failed to fetch businesses')
      const data = await response.json()
      setBusinesses(data)
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete business')
      
      setBusinesses((prev) => prev.filter((b) => b.id !== businessId))
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('Failed to delete business')
    }
  }

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusinesses((prev) => [newBusiness, ...prev])
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            WhatsApp Business Automation
          </h1>
          <p className="text-muted-foreground">
            Manage your businesses and configure WhatsApp automation
          </p>
        </div>

        {/* Create Business Section */}
        {showForm ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Create New Business</h2>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
            <BusinessSetupForm
              onSuccess={handleBusinessCreated}
            />
          </div>
        ) : (
          <div className="mb-8">
            <Button
              onClick={() => setShowForm(true)}
              className="px-6"
            >
              + New Business
            </Button>
          </div>
        )}

        {/* Businesses List */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Businesses</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading businesses...
            </div>
          ) : businesses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No businesses created yet
              </p>
              <Button onClick={() => setShowForm(true)}>
                Create Your First Business
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <Card key={business.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {business.name}
                    </h3>
                    {business.industry && (
                      <p className="text-sm text-muted-foreground">
                        {business.industry}
                      </p>
                    )}
                  </div>

                  {business.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-6 text-sm">
                    {business.phone_number && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Phone:</span> {business.phone_number}
                      </p>
                    )}
                    {business.email && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Email:</span> {business.email}
                      </p>
                    )}
                    {business.opening_hours && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Hours:</span> {business.opening_hours}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Link
                      href={`/dashboard/businesses/${business.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteBusiness(business.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
