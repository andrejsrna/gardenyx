#!/usr/bin/env node

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return null;
  return args[index + 1] ?? null;
}

function requireArg(name) {
  const value = getArg(name);
  if (!value) {
    throw new Error(`Missing required argument --${name}`);
  }
  return value;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

async function graphGet(path, token) {
  const url = new URL(`https://graph.facebook.com/v23.0/${path}`);
  url.searchParams.set("access_token", token);
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok || json.error) {
    throw new Error(json.error?.message || `Graph GET failed for ${path}`);
  }
  return json;
}

async function graphPost(path, token, body) {
  const response = await fetch(`https://graph.facebook.com/v23.0/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      ...body,
      access_token: token,
    }),
  });

  const json = await response.json();
  if (!response.ok || json.error) {
    throw new Error(json.error?.message || `Graph POST failed for ${path}`);
  }
  return json;
}

async function getManagedPages(userToken) {
  const pages = await graphGet("me/accounts", userToken);
  return pages.data || [];
}

async function resolvePage({ pageId, pageName, userToken }) {
  const pages = await getManagedPages(userToken);
  const match = pages.find((page) => {
    if (pageId && page.id === pageId) return true;
    if (pageName && page.name === pageName) return true;
    return false;
  });

  if (!match) {
    const available = pages.map((page) => `${page.name} (${page.id})`).join(", ");
    const target = pageId ? `ID "${pageId}"` : `name "${pageName}"`;
    throw new Error(`Page with ${target} not found in /me/accounts. Visible pages: ${available || "none"}`);
  }
  return match;
}

async function main() {
  const pageId = getArg("pageId");
  const pageName = getArg("pageName");
  const listPages = hasFlag("listPages");
  const message = listPages ? null : requireArg("message");
  const link = getArg("link");
  const imageUrl = getArg("imageUrl");
  const userToken =
    process.env.FACEBOOK_USER_ACCESS_TOKEN ||
    process.env.FB_ACCESS_TOKEN ||
    process.env.FACEBOOK_ACCESS_TOKEN;

  if (!userToken) {
    throw new Error("Missing FACEBOOK_USER_ACCESS_TOKEN or FB_ACCESS_TOKEN in environment");
  }

  if (listPages) {
    const pages = await getManagedPages(userToken);
    console.log(
      JSON.stringify(
        pages.map((page) => ({
          id: page.id,
          name: page.name,
          tasks: page.tasks || [],
          category: page.category || null,
        })),
        null,
        2
      )
    );
    return;
  }

  if (!pageId && !pageName) {
    throw new Error("Provide either --pageId or --pageName");
  }

  const page = await resolvePage({ pageId, pageName, userToken });
  const endpoint = imageUrl && !link ? `${page.id}/photos` : `${page.id}/feed`;
  const body =
    imageUrl && !link
      ? { message, url: imageUrl }
      : imageUrl && link
        ? { message, link, picture: imageUrl }
        : link
          ? { message, link }
          : { message };

  const tokenToUse = page.access_token || userToken;
  const result = await graphPost(endpoint, tokenToUse, body);
  console.log(
    JSON.stringify(
      {
        page_id: page.id,
        page_name: page.name,
        endpoint,
        result,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
