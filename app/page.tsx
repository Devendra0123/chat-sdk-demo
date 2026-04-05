import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            WhatsApp Business Automation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Automate customer support with AI-powered responses
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8">
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="px-8">
                  Log In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Feature 1 */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              WhatsApp Integration
            </h3>
            <p className="text-muted-foreground">
              Connect your WhatsApp Business Account and reach customers where they are
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              AI-Powered Responses
            </h3>
            <p className="text-muted-foreground">
              GPT-4 learns your business context and provides intelligent, personalized responses
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Easy Setup
            </h3>
            <p className="text-muted-foreground">
              Configure your business info, FAQs, and services without coding
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              FAQ Management
            </h3>
            <p className="text-muted-foreground">
              Create a knowledge base that the AI uses to answer customer questions
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              24-Hour Compliance
            </h3>
            <p className="text-muted-foreground">
              Fully compliant with Meta&apos;s 24-hour message window policy
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Conversation Tracking
            </h3>
            <p className="text-muted-foreground">
              Monitor conversations and track customer interactions
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-foreground mb-2">Setup Business</h4>
              <p className="text-sm text-muted-foreground">
                Configure your business information
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-foreground mb-2">Connect WhatsApp</h4>
              <p className="text-sm text-muted-foreground">
                Integrate your WhatsApp Business Account
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-foreground mb-2">Add FAQs</h4>
              <p className="text-sm text-muted-foreground">
                Create knowledge base for AI learning
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-foreground mb-2">Start Automating</h4>
              <p className="text-sm text-muted-foreground">
                AI handles customer inquiries
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to automate your customer support?
          </h2>
          <p className="text-muted-foreground mb-6">
            Set up your first business and connect WhatsApp in minutes
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
