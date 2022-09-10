import { formatDate } from './../../utils/dateUtils';
import { User } from '../../models/User';
import { updateEvent } from '../../businessLayer/eventsBusiness'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { UpdateEventRequest } from '../../requests/UpdateEventRequest'
import { getToken, parseUser } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const eventId = event.pathParameters.eventId

    const updatedEvent: UpdateEventRequest = JSON.parse(event.body)

    const parsedStartDate = Date.parse(updatedEvent.startDate);

    if (!updatedEvent.title.trim() || !parsedStartDate) {
      return createInvalidRequestBody();
    }

    updatedEvent.startDate = formatDate(parsedStartDate);

    const user: User = parseUser(getToken(event.headers.Authorization))
    await updateEvent(updatedEvent, eventId, user)

    return {
      statusCode: 200,
      body: null
    }
  }
)

function createInvalidRequestBody() {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Invalid request body",
    }),
  };
}

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
