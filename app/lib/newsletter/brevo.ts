import { ContactsApi, ContactsApiApiKeys, CreateContact } from '@getbrevo/brevo';

type UpsertBrevoContactInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  listId?: number;
};

const getBrevoClient = () => {
  const apiKey = process.env.BREVO_API_KEY?.trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) {
    throw new Error('Missing BREVO_API_KEY');
  }
  const client = new ContactsApi();
  client.setApiKey(ContactsApiApiKeys.apiKey, apiKey);
  return client;
};

export async function upsertBrevoContact(input: UpsertBrevoContactInput) {
  const client = getBrevoClient();
  const contact: CreateContact = {
    email: input.email,
    attributes: {
      FIRSTNAME: input.firstName || undefined,
      LASTNAME: input.lastName || undefined,
    },
    listIds: input.listId ? [input.listId] : undefined,
    updateEnabled: true,
  };

  const response = await client.createContact(contact);
  return response?.body?.id;
}

export async function blacklistBrevoContact(email: string) {
  const client = getBrevoClient();
  await client.updateContact(email, {
    emailBlacklisted: true,
  });
}
