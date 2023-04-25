import { Knex } from "knex";
import { FirstAccessToken } from "../../src/utils/rdstation/first-access-token";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rdstation', (table) => {
    table.uuid('id').primary()
    table.text('token').notNullable()
    table.text('refresh_token').notNullable()
    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at').notNullable()
    table.timestamp('expires_at').notNullable()
  });
  
  await FirstAccessToken();
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('rdstation');
}

