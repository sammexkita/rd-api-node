import axios from "axios";
import { knex } from "../../database";
import { env } from "../../env";
import { randomUUID } from "crypto";
import { addHours } from "date-fns";
import { format } from "date-fns-tz";

interface AxiosResponseProps {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export async function FirstAccessToken() {
  const { data } = await axios.post<AxiosResponseProps>('https://api.rd.services/auth/token', {
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    code: env.CODE
  });

  const token_expires_at = format(addHours(new Date(), 23), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Sao_Paulo' });

  const rd_station_table = {
    id: randomUUID(),
    token: data.access_token,
    refresh_token: data.refresh_token,
    created_at: new Date(),
    updated_at: new Date(),
    expires_at: token_expires_at
  };

  await knex('rdstation').insert(rd_station_table);

  return rd_station_table;
}