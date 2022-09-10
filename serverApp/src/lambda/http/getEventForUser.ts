import { User } from '../../models/User';
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getEventsForUser } from '../../businessLayer/eventsBusiness'
import { getToken, parseUser } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const user: User = parseUser(getToken(event.headers.Authorization))

    const events = await getEventsForUser(user.sub)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: events
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
