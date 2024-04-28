import { IntegrationDefinition, z } from '@botpress/sdk'
import { name, integrationName } from './package.json'
import { jwtEventSchema } from 'src/const'

export default new IntegrationDefinition({
  name: integrationName ?? name,
  version: '0.2.0',
  title: 'JSON Web Token',
  description: 'This integration allows you to generate and verify JSON Web Tokens (JWTs) in your bot',
  icon: 'logo.svg',
  readme: 'hub.md',
  configuration: {
   schema: z.object({
    secret: z.string()
  }),
  },
  channels: {},
  actions: {
    generateToken: {  
      input: {
        schema: z.object({
          data: z.string().describe('The data to be encoded in the token. This should be a stringified JSON object.'),
          expiresIn: z.string().optional().describe('The time after which the token will expire. The format is n(time unit). For example, 10s for 10 seconds, 30m for 30 minutes, 2h for 2 hours, 1d for 1 day, etc.')
        })
      },
      output: {
        schema: z.object({
          token: z.string().describe('The generated token. This ')
        })
      }
    },
    validateToken: {
      input: {
        schema: z.object({
          token: z.string().describe('The token to be validated')
        })
      },
      output: {
        schema: z.object({
          isValid: z.boolean().describe('Whether the token is valid or not'),
          data: z.string().optional().describe('The decoded data from the token. This field is only present if the token is valid')
        })
      }
    }
  },
  events: {
    jsonWebTokenEvent: {
      title: 'JWT Event',
      description: 'This event used to recceived a JWT token. The token can be used to authenticate the sender of the event.',
      schema: jwtEventSchema.passthrough(),
    },
  },
})
