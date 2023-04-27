import axios from "axios";
import { knex } from "../../database";
import { RevalidateAccessToken } from "../../utils/rdstation/revalidate-access-token";
import { isBefore } from "date-fns";

export async function checkExpiresDateToken() {
  const { expires_at } = await knex('rdstation').select('expires_at').first();
  let isExpired = isBefore(expires_at, new Date());

  if (isExpired) { 
    return await RevalidateAccessToken();
  }

  const { token } = await knex('rdstation').select('token').first();
  
  const data = await axios.get('https://api.rd.services/platform/contacts/email:leadtest@email.com', {
      headers: {
        Authorization: `Bearer ${token}`
      }
  }).then(res => res.data).catch(err => err.response.data.error);

  if (data === "invalid_token") {
    return await RevalidateAccessToken();
  }
}