'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  sku: string
  stock_quantity: number
  image_url?: string
}

interface ProductsListProps {
  businessId: string
  onProductAdded?: () => void
}

export function ProductsList({ businessId, onProductAdded }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stock_quantity: '',
    image_url: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [businessId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?business_id=${businessId}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('[v0] Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      business_id: businessId,
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity || '0'),
    }

    try {
      if (editingId) {
        const response = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        if (!response.ok) throw new Error('Failed to update product')
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        if (!response.ok) throw new Error('Failed to create product')
      }

      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        sku: '',
        stock_quantity: '',
        image_url: '',
      })
      setShowForm(false)
      setEditingId(null)
      fetchProducts()
      onProductAdded?.()
    } catch (error) {
      console.error('[v0] Error saving product:', error)
      alert('Failed to save product')
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      sku: product.sku,
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || '',
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete product')
      fetchProducts()
    } catch (error) {
      console.error('[v0] Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            if (showForm) {
              setFormData({
                title: '',
                description: '',
                price: '',
                category: '',
                sku: '',
                stock_quantity: '',
                image_url: '',
              })
            }
          }}
          variant={showForm ? 'outline' : 'default'}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="block text-sm font-medium mb-2">
                  Product Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Wireless Headphones"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku" className="block text-sm font-medium mb-2">
                  SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., WH-1000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="block text-sm font-medium mb-2">
                  Price ($) *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Electronics"
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity" className="block text-sm font-medium mb-2">
                  Stock Quantity
                </Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url" className="block text-sm font-medium mb-2">
                Image URL
              </Label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <Button type="submit" className="w-full">
              {editingId ? 'Update Product' : 'Create Product'}
            </Button>
          </form>
        </Card>
      )}

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                    {product.category && <span className="text-muted-foreground">{product.category}</span>}
                    <span className="text-muted-foreground">Stock: {product.stock_quantity}</span>
                    {product.sku && <span className="text-muted-foreground">SKU: {product.sku}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
