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

async function resolvePage({ pageId, pageName, userToken }) {
  if (pageId) {
    const page = await graphGet(pageId, userToken);
    return { id: page.id, name: page.name, access_token: userToken };
  }

  const pages = await graphGet("me/accounts", userToken);
  const match = (pages.data || []).find((page) => page.name === pageName);
  if (!match) {
    const available = (pages.data || []).map((page) => page.name).join(", ");
    throw new Error(`Page "${pageName}" not found. Visible pages: ${available || "none"}`);
  }
  return match;
}

async function main() {
  const pageId = getArg("pageId");
  const pageName = getArg("pageName");
  const message = requireArg("message");
  const link = getArg("link");
  const imageUrl = getArg("imageUrl");
  const userToken =
    process.env.FACEBOOK_USER_ACCESS_TOKEN ||
    process.env.FB_ACCESS_TOKEN ||
    process.env.FACEBOOK_ACCESS_TOKEN;

  if (!userToken) {
    throw new Error("Missing FACEBOOK_USER_ACCESS_TOKEN or FB_ACCESS_TOKEN in environment");
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

  const result = await graphPost(endpoint, page.access_token || userToken, body);
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
