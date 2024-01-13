import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { EventType } from "./types";
import { EventBodySchema } from "./schemas";

const PORT = 4005;

export async function sendEvent(
  { url, ev }: { url: string; ev: any },
) {
  console.log(`Sending event to ${url}...`);
  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(ev),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(`Something went wrong sending event to ${url}`, err);
  } finally {
    console.log(`Successfully sent the event to ${url}`);
  }
}
export async function sendEventToServices(
  ev: any,
) {
  const url = "http://localhost";

  await sendEvent({ url: `${url}:4000/events`, ev });
  await sendEvent({ url: `${url}:4001/events`, ev });
  await sendEvent({ url: `${url}:4002/events`, ev });
  await sendEvent({ url: `${url}:4003/events`, ev });
}

// --- EVENTS DB
const events: EventType[] = [];
// -- APP
const app = new Elysia();
// --- MIDDLEWARE
app
  .use(cors());
// --- ROUTES
app
  .get("/", () => "Hello Elysia")
  .group("/events", (app) =>
    app
      .get("/", ({ set }) => {
        set.status = "OK";
        return events;
      })
      .post("/", async ({ body, set }) => {
        console.log(body);
        await sendEventToServices(body);

        set.status = "OK";
        return { success: true, message: `Event has been sent to services.` };
      }, {
        body: t.Any(EventBodySchema),
      }))
  .listen(PORT);

console.log(
  `🦊 Elysia is running the 'event-bus' service at ${app.server?.hostname}:${app.server?.port}`,
);
