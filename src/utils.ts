import { env } from "bun";

const PORT_POSTS = 4000;
const PORT_COMMENTS = 4001;
const PORT_QUERY = 4002;
const PORT_MODERATION = 4003;

const HOST_POSTS = "posts-clusterip-srv";
const HOST_COMMENTS = "comments-srv";
const HOST_QUERY = "query-srv";
const HOST_MODERATION = "moderation-srv";

const URLTable = {
  posts: {
    local: `http://localhost:${PORT_POSTS}/events`,
    prod: `http://${HOST_POSTS}:${PORT_POSTS}/events`,
  },
  comments: {
    local: `http://localhost:${PORT_COMMENTS}/events`,
    prod: `http://${HOST_COMMENTS}:${PORT_COMMENTS}/events`,
  },
  moderation: {
    local: `http://localhost:${PORT_MODERATION}/events`,
    prod: `http://${HOST_MODERATION}:${PORT_MODERATION}/events`,
  },
  query: {
    local: `http://localhost:${PORT_QUERY}/events`,
    prod: `http://${HOST_QUERY}:${PORT_QUERY}/events`,
  },
};

const getURL = (service: "posts" | "comments" | "query" | "moderation") => {
  if (env.NODE_ENV === "development") {
    return URLTable[service].local;
  } else {
    return URLTable[service].prod;
  }
};

export async function sendEvent(
  { url, ev }: { url: string; ev: any },
) {
  // @ts-ignore: I KNOW WHAT 'ev' IS
  console.log(`Sending event ${ev.type} to ${url}...`);
  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(ev),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(`Something went wrong sending event to ${url} `, err);
  } finally {
    // @ts-ignore
    console.log(`Successfully sent the event (${ev.type}) to ${url} `);
  }
}
export async function sendEventToServices(
  ev: any,
) {
  await sendEvent({ url: getURL("posts"), ev });
  await sendEvent({ url: getURL("comments"), ev });
  await sendEvent({ url: getURL("query"), ev });
  await sendEvent({ url: getURL("moderation"), ev });
}
