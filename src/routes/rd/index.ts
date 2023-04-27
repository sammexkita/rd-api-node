import { FastifyInstance } from "fastify";
import { knex } from "../../database";
import { z } from "zod";
import { checkExpiresDateToken } from "../../middlewares/rdstation/check-expires-date-token";
import axios from "axios";

interface KeyProps {
  name: string;
  operator: string;
}

export async function rdstationmktRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, reply) => {
    await checkExpiresDateToken();
  })

  app.get('/contacts/:id', async (req, reply) => {

    let key = "";

    const getContactParamsSchema = z.object({
      id: z.string().email().or(z.string().uuid())
    })
    
    const { id } = getContactParamsSchema.parse(req.params);

    id.includes("@") ? key = "email" : key = "uuid";
    
    const { token } = await knex('rdstation').select('token').first();

    const data = await axios.get(`https://api.rd.services/platform/contacts/${key}:${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.data).catch(err => {
      return reply.send(err.response.data);
    });

    return reply.send(data);
  }); 

  app.post('/contacts', async (req, reply) => {
    const createContactSchema = z.object({
      name: z.string().optional(),
      email: z.string().email(),
      personal_phone: z.string().optional(),
    });
    
    const body = createContactSchema.parse(req.body);

    const { token } = await knex('rdstation').select('token').first();

    const rd = await axios.post('https://api.rd.services/platform/contacts', body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(err => reply.send(err.response.data));
    
    return reply.send(rd.data);
  })

  app.patch('/contacts/:email', async (req, reply) => {
    const { token } = await knex('rdstation').select('token').first();
    let key = {} as KeyProps;

    const paramsContactParamsSchema = z.object({
      email: z.string().email()
    })

    const { email } = paramsContactParamsSchema.parse(req.params);

    key = email.includes("@") ?  { 
      name: "email",
      operator: "uuid" 
    }
    : 
    { 
      name: "uuid",
      operator: "email"
    };
  
    const lead = await axios.get(`http://localhost:3333/rd/contacts/${email}`)
      .then(res => res.data)
      .catch(err => reply.send(err))
    
    const data = await axios.patch(`https://api.rd.services/platform/contacts/${key.operator}:${lead[key.operator]}`, req.body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.data).catch(err => {
      return reply.send(err.response.data);
    });

    return reply.send(data);
  })

  app.delete('/contacts/:email', async (req, reply) => {
    const { token } = await knex('rdstation').select('token').first();
    let key = {} as KeyProps;

    const paramsContactParamsSchema = z.object({
      email: z.string().email()
    })

    const { email } = paramsContactParamsSchema.parse(req.params);

    key = email.includes("@") ?  { 
      name: "email",
      operator: "uuid" 
    }
    : 
    { 
      name: "uuid",
      operator: "email"
    };
  
    const lead = await axios.get(`http://localhost:3333/rd/contacts/${email}`)
      .then(res => res.data)
      .catch(err => reply.send(err))
  
      const data = await axios.delete(`https://api.rd.services/platform/contacts/${key.operator}:${lead[key.operator]}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.data).catch(err => {
      return reply.send(err.response.data);
    });

    return reply.send(data);
  })
}