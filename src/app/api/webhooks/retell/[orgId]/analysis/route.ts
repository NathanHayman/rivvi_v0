import { RetellPostCallWebhook } from "@/types/retell";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const payload = (await req.json()) as RetellPostCallWebhook["body"];
    const { call, event } = payload;

    // 2. Check if the event is a `call_analyzed` event
    if (event !== "call_analyzed") {
      return new Response("Event is not a call_analyzed event", {
        status: 400,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
