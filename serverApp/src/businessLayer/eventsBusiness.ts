import { formatDate } from './../utils/dateUtils';
import { EventsDAO } from '../dataLayer/eventsDAO';
import { EmailBusiness } from "./emailBusiness";
import { User } from "../models/User";
import { AttachmentUtils } from "../fileLayer/attachmentUtils";
import { EventItem, EventState } from "../models/EventItem";
import { UpdateEventRequest } from "../requests/UpdateEventRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
import * as createError from "http-errors";
import { CreateEventRequest } from "../requests/CreateEventRequest";

const logger = createLogger("EventsBusinessLogic");

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

const eventDAO = new EventsDAO();

export const getEventsForUser = async (userId: string): Promise<EventItem[]> => {
  return await eventDAO.getEventsByUserId(userId);
};

export const createEvent = async (
  newEvent: CreateEventRequest,
  user: User
): Promise<EventItem> => {
  const eventItem = {
    id: uuid.v4(),
    imageUrl: null,
    ...newEvent,
    userId: user.sub,
    email: user.email,
    createdAt: new Date().toISOString(),
    notified: false,
    state: EventState.PENDING,
  } as EventItem;

  await eventDAO.createEvent(eventItem);

  return eventItem;
};

export const updateEvent = async (
  event: UpdateEventRequest,
  id: string,
  user: User
): Promise<EventItem> => {
  const oldEvent = await eventDAO.getEventById(id, user.sub);

  if (oldEvent) {
    const eventItem = {
      ...oldEvent,
      ...event,
      email: user.email,
    } as EventItem;

    await eventDAO.updateEvent(eventItem);

    return eventItem;
  } else {
    throw new createError.NotFound("Event not found");
  }
};

export const deleteEvent = async (eventId: string, userId: string) => {
  const eventItem = await eventDAO.getEventById(eventId, userId);

  if (eventItem) {
    await eventDAO.deleteEvent(eventItem);
  } else {
    throw new createError.NotFound("Event not found");
  }
};

export const createAttachmentPresignedUrl = async (
  eventId: string,
  userId: string
): Promise<string> => {
  logger.info("createAttachmentPresignedUrl running " + eventId);
  const eventItem = await eventDAO.getEventById(eventId, userId);

  if (eventItem) {
    logger.info(
      "createAttachmentPresignedUrl found " + JSON.stringify(eventItem)
    );
    const attachmentUtils = new AttachmentUtils();
    const presignedUrl = attachmentUtils.getUploadUrl(eventId);

    //update event
    const newEvent = {
      ...eventItem,
      imageUrl: `https://${bucketName}.s3.amazonaws.com/${eventId}`,
    } as EventItem;

    await eventDAO.updateEvent(newEvent);

    return presignedUrl;
  } else {
    logger.info("Event not found: " + eventId);
    throw new createError.NotFound("Event not found");
  }
};

export const getEventById = async (eventId: string, userId: string) => {
  return await eventDAO.getEventById(eventId, userId);
};

export const processStartedEvent = async () => {
  try {
    const date = formatDate(new Date());

    //Get all started events
    const eventList: EventItem[] = await eventDAO.getStartedEvent(date);

    if (eventList && eventList.length) {

      //Filter distinct email
      const emails = [...new Set(eventList.map((t) => t.email))];
      logger.info("Distinct email: " + emails);

      const emailBusiness = new EmailBusiness();

      //Send events notification for each email
      for (const email of emails) {

        //Get all started event created by this email
        const events = eventList.filter((t) => t.email === email);

        await emailBusiness.sendEmail(email, events);
      }

      //update notified event
      for (const event of eventList) {
        event.notified = true;
        event.state = EventState.COMPLETED
        await eventDAO.updateEventAfterSendingNotification(event)
      }

    }
  } catch (e) {
    logger.info("Error happen while process due Event: " + JSON.stringify(e));
    throw new createError.InternalServerError("Exception occured!");
  }
};
