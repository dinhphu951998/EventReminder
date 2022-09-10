import { EventItem } from "../models/EventItem";
import * as AWS from "aws-sdk";
import { SendEmailRequest } from "aws-sdk/clients/ses";
import { createLogger } from "../utils/logger";

const sender = process.env.SENDER_EMAIL;
const sesConfig = {
  region: process.env.REGION,
  apiVersion: "2010-12-01",
};
const logger = createLogger("EmailBusiness");

export class EmailBusiness {
  constructor(private readonly sesAws = new AWS.SES(sesConfig)) {}

  async sendEmail(dest: string, events: EventItem[]) {
    const params: SendEmailRequest = {
      Destination: {
        ToAddresses: [dest],
      },
      Source: sender,
      Message: {
        Subject: {
          Data: "Your event(s) will happen soon!",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: this.createEmailBody(events),
            Charset: "UTF-8",
          },
        },
      },
    };
    try {
      const response = await this.sesAws.sendEmail(params).promise();
      logger.info("Send email sucessfully: " + JSON.stringify(response));
    } catch (error) {
      logger.info("Error while sending email: " + JSON.stringify(error));
    }
  }

  private createEmailBody(events: EventItem[]) {
    let body = "The event(s) will happen soon. Don't forget to mark your calendar, looking forward to meeting you soon\n\n";

    for (const i in events) {
      body += (Number(i) + 1) + ".\n";
      body += "Title: " + events[i].title + "\n";
      body += "Description: " + events[i].note + "\n";
      body += "StartDate: " + events[i].startDate + "\n";
    }

    body += "\nMake sure to be there early so you don't miss anything and we can have time to chat before the presentation starts\n\n";
    body += "Thank you!";

    return body;
  }
}
