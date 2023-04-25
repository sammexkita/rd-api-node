import { knex } from "../../database";
import { RevalidateAccessToken } from "../../utils/rdstation/revalidate-access-token";
import { isBefore } from "date-fns";

export async function checkExpiresDateToken() {
  const { expires_at } = await knex('rdstation').select('expires_at').first();
  let isExpired = isBefore(expires_at, new Date());
  
  if (isExpired) { 
    await RevalidateAccessToken();
  }
}