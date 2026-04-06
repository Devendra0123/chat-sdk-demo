import { bot } from "@/lib/bot";

type Platform = keyof typeof bot.webhooks;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
): Promise<Response> {
  const { platform } = await params;

  // Check if we have a webhook handler for this platform
  const webhookHandler = bot.webhooks[platform as Platform];
  if (!webhookHandler) {
    return new Response(`Unknown platform: ${platform}`, { status: 404 });
  }

  // Handle the webhook - Pass a simple waitUntil that doesn't use after()
  // This avoids the issue with cookies() being called inside after()
  const pendingTasks: Promise<any>[] = [];
  
  const response = await webhookHandler(request, {
    waitUntil: (task: Promise<any>) => {
      // Store the promise to wait for it later if needed
      pendingTasks.push(task);
      // Don't wait for it to complete before returning the response
      // This allows WhatsApp to receive the webhook response immediately
    },
  });

  // Fire off background tasks without blocking the response
  // These will continue processing after the webhook response is sent
  pendingTasks.forEach((task) => {
    task.catch((error) => {
      console.error('[v0] Background task error:', error);
    });
  });

  return response;
}

// GET handler — serves as health check, but also forwards to webhook handler
// for platforms that need GET verification (e.g. WhatsApp challenge-response)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
): Promise<Response> {
  const { platform } = await params;

  const webhookHandler = bot.webhooks[platform as Platform];
  if (!webhookHandler) {
    return new Response(`${platform} adapter not configured`, { status: 404 });
  }

  // If the request has verification query params, forward to the adapter
  const url = new URL(request.url);
  if (
    url.searchParams.has("hub.mode") ||
    url.searchParams.has("hub.verify_token")
  ) {
    return webhookHandler(request);
  }

  return new Response(`${platform} webhook endpoint is active`, {
    status: 200,
  });
}
