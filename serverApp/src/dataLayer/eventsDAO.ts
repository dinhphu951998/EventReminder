import { EventState } from "../models/EventItem";
import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { createLogger } from "../utils/logger";
import { EventItem } from "../models/EventItem";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("EventsAccess");

const eventTable = process.env.EVENTS_TABLE;
const startDateIndex = process.env.EVENTS_START_DATE_INDEX;

export class EventsDAO {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
  ) {}

  async getEventsByUserId(userId: string): Promise<EventItem[]> {
    logger.info("getEventsByUserId running " + userId);

    const result = await this.docClient
      .query({
        TableName: eventTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    logger.info(
      `getEventsByUserId completed ${userId} with ${result.Count} item(s)`
    );

    return result.Items as EventItem[];
  }

  async createEvent(item: EventItem): Promise<EventItem> {
    logger.info("createEvent running " + JSON.stringify(item));

    await this.docClient
      .put({
        TableName: eventTable,
        Item: item,
      })
      .promise();

    logger.info("createEvent completed " + item.id);

    return item;
  }

  async updateEvent(item: EventItem): Promise<EventItem> {
    logger.info("updateEvent running " + JSON.stringify(item));

    await this.docClient
      .update({
        TableName: eventTable,
        Key: {
          id: item.id,
          userId: item.userId,
        },
        UpdateExpression: `set title = :title, 
          startDate = :startDate, 
          note = :note, 
          email = :email, 
          imageUrl = :imageUrl`,
        ExpressionAttributeValues: {
          ":title": item.title,
          ":startDate": item.startDate,
          ":note": item.note,
          ":email": item.email,
          ":imageUrl": item.imageUrl,
        },
      })
      .promise();

    logger.info("updateEvent completed " + item.id);

    return item;
  }

  async updateEventAfterSendingNotification(item: EventItem) {
    logger.info("updateEventAfterSendingNotification running " + JSON.stringify(item));

    await this.docClient
      .update({
        TableName: eventTable,
        Key: {
          id: item.id,
          userId: item.userId,
        },
        UpdateExpression: `set #state = :state, 
          notified = :notified`,
        ExpressionAttributeNames: {
          "#state": "state",
        },
        ExpressionAttributeValues: {
          ":state": item.state,
          ":notified": item.notified,
        },
      })
      .promise();

    logger.info("updateEventAfterSendingNotification completed " + item.id);

    return item;
  }

  async getEventById(id: string, userId: string): Promise<EventItem> {
    logger.info("getEventById running " + id);

    const result = await this.docClient
      .get({
        TableName: eventTable,
        Key: {
          id,
          userId,
        },
      })
      .promise();

    logger.info("getEventById completed " + JSON.stringify(result));

    return result.Item as EventItem;
  }

  async deleteEvent(item: EventItem): Promise<boolean> {
    logger.info("deleteEvent running " + JSON.stringify(item));

    const result = await this.docClient
      .delete({
        TableName: eventTable,
        Key: {
          id: item.id,
          userId: item.userId,
        },
      })
      .promise();

    logger.info("deleteEvent completed " + JSON.stringify(result));

    return true;
  }

  async getStartedEvent(date: string): Promise<EventItem[]> {
    logger.info("getStartedEvent running " + date);

    const result = await this.docClient
      .query({
        TableName: eventTable,
        IndexName: startDateIndex,
        KeyConditionExpression: "#state = :state and startDate >= :date",
        ExpressionAttributeNames: {
          "#state": "state",
        },
        FilterExpression: "notified = :notified",
        ExpressionAttributeValues: {
          ":notified": false,
          ":state": EventState.PENDING,
          ":date": date,
        },
      })
      .promise();

    logger.info("getStartedEvent completed " + JSON.stringify(result));

    return result.Items as EventItem[];
  }
}
