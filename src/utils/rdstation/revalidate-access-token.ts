import axios from "axios";
import { knex } from "../../database";
import { env } from "../../env";
import { format } from "date-fns-tz";
import { addHours } from "date-fns";


interface AxiosResponseProps {
  access_token: string
  expires_in: number,
  refresh_token: string
}

export async function RevalidateAccessToken() {
  const { refresh_token } = await knex('rdstation').select('refresh_token').first();

  const { data } = await axios.post<AxiosResponseProps>('https://api.rd.services/auth/token', {
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    refresh_token
  });

  const token_expires_at = format(addHours(new Date(), 23), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Sao_Paulo' });
  
  await knex('rdstation').update({
    token: data.access_token,
    refresh_token: data.refresh_token,
    updated_at: new Date(),
    expires_at: token_expires_at
  });

  return data;
}