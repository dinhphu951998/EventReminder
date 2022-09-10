import { createEvent, getUploadUrl, uploadFile } from "api/events-api";
import { UserContext } from "context/UserContext";
import { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { Event } from "types/Event";
import { ProcessState } from "types/ProcessState";
import { EventForm } from "./EventForm";

export const CreateEvent = () => {
  const [processState, setProcessState] = useState(ProcessState.NoUpload);
  const userContext = useContext(UserContext);
  const history = useHistory();

  const handleSubmit = async (event: Event, file: any) => {
    console.log("Submit request to create event");

    try {
      setProcessState(ProcessState.SaveMetaData);
      const newEvent = await createEvent(userContext.idToken, event);

      if (file) {
        setProcessState(ProcessState.FetchingPresignedUrl);
        const uploadUrl = await getUploadUrl(userContext.idToken, newEvent.id);

        setProcessState(ProcessState.UploadingFile);
        await uploadFile(uploadUrl, file);
      }

      alert("Data is saved!");
      history.push("/");

    } catch (e) {
      console.log("Event creation fail:", e);
      alert("Event creation fail");
    } finally {
      setProcessState(ProcessState.NoUpload);
    }
  };

  return (
    <div>
      <h1>Create event</h1>
      <EventForm
        onSubmit={handleSubmit}
        processState={processState}
      />
    </div>
  );
};
