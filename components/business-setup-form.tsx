'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface BusinessFormData {
  name: string
  industry: string
  description: string
  phone_number: string
  email: string
  website: string
  opening_hours: string
}

interface BusinessSetupFormProps {
  onSuccess?: (business: any) => void
  initialData?: BusinessFormData
  businessId?: string
}

export function BusinessSetupForm({
  onSuccess,
  initialData,
  businessId,
}: BusinessSetupFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>(
    initialData || {
      name: '',
      industry: '',
      description: '',
      phone_number: '',
      email: '',
      website: '',
      opening_hours: '',
    }
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const url = businessId
        ? `/api/businesses/${businessId}`
        : '/api/businesses'
      const method = businessId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save business')
      }

      const data = await response.json()
      setSuccess(true)
      
      // Reset form if creating new business
      if (!businessId) {
        setFormData({
          name: '',
          industry: '',
          description: '',
          phone_number: '',
          email: '',
          website: '',
          opening_hours: '',
        })
      }

      onSuccess?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {businessId ? 'Update Business' : 'Setup Your Business'}
          </h2>
          <p className="text-muted-foreground">
            Configure your business information for WhatsApp automation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {businessId ? 'Business updated successfully!' : 'Business created successfully!'}
          </div>
        )}

        {/* Business Name */}
        <div>
          <Label htmlFor="name" className="block text-sm font-medium mb-2">
            Business Name *
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Business Name"
            required
            className="w-full"
          />
        </div>

        {/* Industry */}
        <div>
          <Label htmlFor="industry" className="block text-sm font-medium mb-2">
            Industry
          </Label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select an industry</option>
            <option value="retail">Retail</option>
            <option value="restaurant">Restaurant & Food</option>
            <option value="healthcare">Healthcare</option>
            <option value="e-commerce">E-commerce</option>
            <option value="services">Services</option>
            <option value="real-estate">Real Estate</option>
            <option value="fitness">Fitness & Wellness</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of your business"
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone_number" className="block text-sm font-medium mb-2">
              Phone Number
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="business@example.com"
              className="w-full"
            />
          </div>
        </div>

        {/* Website & Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website" className="block text-sm font-medium mb-2">
              Website
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="opening_hours" className="block text-sm font-medium mb-2">
              Opening Hours
            </Label>
            <Input
              id="opening_hours"
              name="opening_hours"
              type="text"
              value={formData.opening_hours}
              onChange={handleChange}
              placeholder="Mon-Fri 9AM-5PM"
              className="w-full"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Saving...' : businessId ? 'Update Business' : 'Create Business'}
        </Button>
      </form>
    </Card>
  )
}
