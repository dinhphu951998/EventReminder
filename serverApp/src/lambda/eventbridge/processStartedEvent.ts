import { processStartedEvent } from '../../businessLayer/eventsBusiness';
import "source-map-support/register";

export const handler = async (event, context, callback) => {
  console.log("LogScheduledEvent");
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Context", JSON.stringify(context))

  await processStartedEvent()

  callback(null, "Finished");
};
