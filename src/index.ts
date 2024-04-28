import * as botpress from '.botpress'
import { sign, verify } from 'jsonwebtoken';
import { jwtEventSchema } from './const'

type GenerateTokenOutput = botpress.actions.generateToken.output.Output
type ValidateTokenOutput = botpress.actions.validateToken.output.Output

export default new botpress.Integration({
  register: async () => {},
  unregister: async () => {},
  actions: {
    generateToken: async (args): Promise<GenerateTokenOutput> => {
      args.logger.forBot().info('Generating token')
      const secretKey = args.ctx.configuration.secret
      const data = JSON.parse(args.input.data)

      try {
        const generatedToken = await new Promise<string>((resolve, reject) => {
          sign(data, secretKey, { expiresIn: args.input.expiresIn }, (err: Error | null, token: string | undefined) => {
            if (err) {
              args.logger.forBot().error('Error generating token', err);
              reject(err);
            } else {
              resolve(token || '') 
            }
          });
        });
        return { token: generatedToken };
      } catch (err) {
        args.logger.forBot().error('Failed to generate token: ' + err);
        throw err;
      }
    },
    validateToken: async (args): Promise<ValidateTokenOutput> => {
      args.logger.forBot().info('Validating token')

      const token = args.input.token
      const secretKey = args.ctx.configuration.secret

      try {
        const verification = await new Promise<{ isValid: boolean, data: any }>((resolve) => {
          verify(token, secretKey, (err: Error | null, decoded: any) => {
            if (err) {
              resolve({ isValid: false, data: 'Error: Validation Failed' })
            } else {
              resolve({ isValid: true, data: JSON.stringify(decoded) })
            }
          });
        });
        return verification;
      }
      catch (err) {
        args.logger.forBot().error("Error when trying to validate token:", err);
        return { isValid: false, data: 'Error: Unable to validate token' }
      }
    }
  },
  channels: {},
  handler: async (args) => {

    const bodyObject = typeof args.req.body === 'string' ? JSON.parse(args.req.body) : args.req.body
    const parsedData = jwtEventSchema.safeParse(bodyObject)

    if (parsedData.success) {
      args.logger.forBot().info('Received JWT event')

      try {
        const event = await args.client.createEvent({
          type: 'jsonWebTokenEvent',
          payload: {
            token: parsedData.data.token,
            data: parsedData.data.data,
          },
        })
        args.logger.forBot().debug('JWT Event Created Succesfully.', event)
      } catch (error) {
        args.logger.forBot().error('Failed to create JWT event:', error)
      }
    }
  },
})
