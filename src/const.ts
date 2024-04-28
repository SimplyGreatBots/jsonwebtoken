import { z } from "@botpress/sdk"

export const jwtEventSchema = z.object({
    token: z.string().optional(),
    data: z.record(z.any()).optional()
  })