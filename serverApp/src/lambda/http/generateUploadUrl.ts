import { User } from './../../models/User';
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLayer/eventsBusiness'
import { getToken, parseUser } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const eventId = event.pathParameters.eventId

    const user: User = parseUser(getToken(event.headers.Authorization))
    
    const presignedUrl = await createAttachmentPresignedUrl(eventId, user.sub)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
