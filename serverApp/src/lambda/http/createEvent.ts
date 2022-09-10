import { formatDate } from './../../utils/dateUtils';
import { User } from "../../models/User";
import { createEvent } from "../../businessLayer/eventsBusiness";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { CreateEventRequest } from "../../requests/CreateEventRequest";
import { getToken, parseUser } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const newEvent: CreateEventRequest = JSON.parse(event.body);

    const parsedStartDate = Date.parse(newEvent.startDate);

    if (!newEvent.title.trim() || !parsedStartDate) {
      return createInvalidRequestBody();
    }

    newEvent.startDate = formatDate(parsedStartDate);

    const user: User = parseUser(getToken(event.headers.Authorization));
    const eventItem = await createEvent(newEvent, user);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: eventItem,
      }),
    };
  }
);

function createInvalidRequestBody() {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Invalid request body",
    }),
  };
}

handler.use(
  cors({
    credentials: true,
  })
);
