import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from "supertest";
import { app } from '../src/app';

describe('RD Station Marketing Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able create a new user', async () => {
    const createNewLeadResponse = await request(app.server)
    .post('/rd/contacts')
    .send({
      name: "Lead Tests",
      email: "leadtest@email.com"
    })
    
    expect(createNewLeadResponse.body).toEqual(
      expect.objectContaining({
        name: "Lead Tests",
        email: "leadtest@email.com"
      })
    )
  })

  it('should be able to list a user', async () => {
    const listLeadResponse = await request(app.server)
    .get('/rd/contacts/leadtest@email.com')
    .send()

    expect(listLeadResponse.body).toEqual(
      expect.objectContaining({
        email: "leadtest@email.com"
      })
    )
  })

  it('should be able to update a user', async () => {
    const updateLeadResponse = await request(app.server)
    .patch('/rd/contacts/leadtest@email.com')
    .send({
      email: "leadtestupdated@email.com"
    })
    
    expect(updateLeadResponse.body).toEqual(
      expect.objectContaining({
        email: "leadtestupdated@email.com"
      })
    )
  })

  it('should be able to delete a user', async () => {
    await request(app.server)
    .delete('/rd/contacts/leadtestupdated@email.com')
    .send().expect(200)
  })
})