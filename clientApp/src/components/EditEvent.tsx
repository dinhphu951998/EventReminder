import {
  getEventById,
  getUploadUrl,
  patchEvent,
  uploadFile,
} from "../api/events-api";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "context/UserContext";
import { EventForm } from "./EventForm";
import { Event } from "types/Event";
import { ProcessState } from "types/ProcessState";
import { useHistory } from "react-router-dom";
import { Loading } from "./Loading";
interface EditEventProps {
  eventId: string;
}

export const EditEvent = ({ eventId }: EditEventProps) => {
  const [processState, setProcessState] = useState(ProcessState.NoUpload);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const userContext = useContext(UserContext);
  const [eventItem, setEventItem] = useState({} as Event);

  useEffect(() => {
    async function loadEvent() {
      const event = await getEventById(userContext.idToken, eventId);
      console.log("getEventById", JSON.stringify(event));
      setEventItem(event);
    }

    setLoading(true);
    loadEvent();
    setLoading(false);
  }, [userContext, eventId]);

  const handleSubmit = async (event: Event, file) => {
    try {
      setProcessState(ProcessState.SaveMetaData);
      await patchEvent(userContext.idToken, event.id, {
        title: event.title,
        note: event.note,
        startDate: event.startDate,
      });
    } catch {
      alert("Event modification failed");
    }

    try {
      if (file) {
        setProcessState(ProcessState.FetchingPresignedUrl);
        const uploadUrl = await getUploadUrl(userContext.idToken, eventId);

        setProcessState(ProcessState.UploadingFile);
        await uploadFile(uploadUrl, file);

        alert("Data is saved!");
      }
    } catch (e) {
      alert("Could not upload a file: " + (e as Error).message);
    } finally {
      setProcessState(ProcessState.NoUpload);
    }

    history.push("/");
  };

  return (
    <div>
      <h1>Edit Event</h1>
      {loading ? (
        <Loading />
      ) : (
        <EventForm
          event={eventItem}
          onSubmit={handleSubmit}
          processState={processState}
        />
      )}
    </div>
  );
};
