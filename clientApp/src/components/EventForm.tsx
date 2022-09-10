import { useEffect, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { ProcessState } from "types/ProcessState";
import { Event } from "types/Event";

interface IProps {
  event?: Event;
  processState: ProcessState;
  onSubmit: (event: Event, file: any) => void;
}

// const DEBOUNCE_DELAY = 100
// const debounce = (fn, delay) => {
//     var timer = null;
//     console.log("timer", timer)
//     return function () {
//         var context = this, args = arguments;
//         clearTimeout(timer);
//         timer = setTimeout(function () {
//             fn.apply(context, args);
//         }, delay);
//     };
// }

export const EventForm = ({ event, processState, onSubmit }: IProps) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(undefined);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartDate(event.startDate);
      setNote(event.note);
    }
  }, [event]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSubmit(
      {
        ...event,
        title,
        startDate,
        note,
      },
      file
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setFile(files[0]);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
  };

  const renderButton = () => (
    <>
      {processState === ProcessState.SaveMetaData && <p>Saving event</p>}
      {processState === ProcessState.FetchingPresignedUrl && (
        <p>Uploading image metadata</p>
      )}
      {processState === ProcessState.UploadingFile && <p>Uploading file</p>}
      <Button loading={processState !== ProcessState.NoUpload} type="submit">
        Save
      </Button>
    </>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <Form.Input
          type="text"
          label="Title"
          value={title}
          onChange={handleTitleChange}
        />
      </Form.Field>

      <Form.Field>
        <Form.Input
          type="text"
          label="Start date"
          value={startDate}
          onChange={handleStartDateChange}
        />
      </Form.Field>

      <Form.Field>
        <Form.Input
          type="text"
          label="Note"
          value={note}
          onChange={handleNoteChange}
        />
      </Form.Field>

      <Form.Field>
        <Form.Input
          type="file"
          accept="image/*"
          label="File"
          placeholder="Image to upload"
          onChange={handleFileChange}
        />
      </Form.Field>
      {renderButton()}
    </Form>
  );
};
