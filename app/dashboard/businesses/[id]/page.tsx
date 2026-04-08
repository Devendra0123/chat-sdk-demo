'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BusinessSetupForm } from '@/components/business-setup-form'
import { ProductsList } from '@/components/products-list'

interface Business {
  id: string
  name: string
  industry: string
  description: string
  phone_number: string
  email: string
  website: string
  opening_hours: string
  whatsapp_phone_number_id?: string
  created_at: string
}

export default function BusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'products'>('settings')

  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`)
      if (!response.ok) throw new Error('Failed to fetch business')
      const data = await response.json()
      setBusiness(data)
    } catch (error) {
      console.error('Error fetching business:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessUpdated = (updatedBusiness: Business) => {
    setBusiness(updatedBusiness)
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Business not found</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="outline">← Back</Button>
          </Link>
          {!editMode && (
            <Button onClick={() => setEditMode(true)}>
              Edit Business
            </Button>
          )}
        </div>

        {editMode ? (
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">
              Edit {business.name}
            </h1>
            <BusinessSetupForm
              initialData={business}
              businessId={business.id}
              onSuccess={handleBusinessUpdated}
            />
          </div>
        ) : (
          <div>
            {/* Business Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {business.name}
              </h1>
              {business.industry && (
                <p className="text-lg text-muted-foreground">
                  {business.industry}
                </p>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-border mb-8">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Business Settings
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Products
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'products' ? (
              <ProductsList businessId={business.id} />
            ) : (
              <>
              {/* Business Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Overview Card */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Overview
                </h2>
                <div className="space-y-3">
                  {business.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Description
                      </p>
                      <p className="text-foreground">{business.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Created
                    </p>
                    <p className="text-foreground">
                      {new Date(business.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Contact Info Card */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {business.phone_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-foreground">{business.phone_number}</p>
                    </div>
                  )}
                  {business.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="text-foreground">{business.email}</p>
                    </div>
                  )}
                  {business.website && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Website
                      </p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                  {business.opening_hours && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Hours
                      </p>
                      <p className="text-foreground">{business.opening_hours}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Automation Setup Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                WhatsApp Automation Setup
              </h2>
              <p className="text-muted-foreground mb-6">
                Configure WhatsApp messaging and AI-powered responses for this business.
              </p>
              <div className="space-y-3">
                <Link href={`/dashboard/businesses/${business.id}/faq`}>
                  <Button variant="outline" className="w-full justify-start">
                    → Configure FAQs & Knowledge Base
                  </Button>
                </Link>
                <Link href={`/dashboard/businesses/${business.id}/services`}>
                  <Button variant="outline" className="w-full justify-start">
                    → Manage Services & Products
                  </Button>
                </Link>
                <Link href={`/dashboard/businesses/${business.id}/settings`}>
                  <Button variant="outline" className="w-full justify-start">
                    → WhatsApp Integration Settings
                  </Button>
                </Link>
              </div>
            </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
