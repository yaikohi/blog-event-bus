import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { EventType } from "./types";
import { EventBodySchema } from "./schemas";
import { sendEventToServices } from "./utils";

const PORT = 4005;

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
