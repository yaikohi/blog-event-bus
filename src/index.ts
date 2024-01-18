import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { EventType } from "./types";
import { EventBodySchema } from "./schemas";

const PORT = 4005;

// --- SERVICE PORTS
const PORT_POSTS = 4000;
const PORT_COMMENTS = 4001;
const PORT_QUERY = 4002;
const PORT_MODERATION = 4003;
//
// --- SERVICE HOSTS
const HOST_POSTS = "posts-clusterip-srv";
const HOST_COMMENTS = "comments-srv";
const HOST_QUERY = "query-srv";
const HOST_MODERATION = "moderation-srv";
// --- SERVICE URLS

export const URL_POSTS = `http://${HOST_POSTS}:${PORT_POSTS}/events`;
export const URL_COMMENTS = `http://${HOST_COMMENTS}:${PORT_COMMENTS}/events`;
export const URL_QUERY = `http://${HOST_QUERY}:${PORT_QUERY}/events`;
export const URL_MODERATION =
  `http://${HOST_MODERATION}:${PORT_MODERATION}/events`;

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
  await sendEvent({ url: URL_POSTS, ev });
  await sendEvent({ url: URL_COMMENTS, ev });
  await sendEvent({ url: URL_QUERY, ev });
  await sendEvent({ url: URL_MODERATION, ev });
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
        // @ts-ignore
        events.push(body);
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
