import { useEffect, useState } from "react"
import { Button, Form } from "react-bootstrap"
import { ProcessState } from "../types/ProcessState"
import { Todo } from "../types/Todo"

interface IProps {
    todo: Todo,
    processState: ProcessState,
    onSubmit: (todo: Todo, file: any) => void
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

export const TodoForm = ({ todo, processState, onSubmit }: IProps) => {
    const [name, setName] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [done, setDone] = useState(false)
    const [file, setFile] = useState(undefined as any)

    useEffect(() => {
        setName(todo.name)
        setDueDate(todo.dueDate)
        setDone(todo.done)
    }, [todo])

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()
        onSubmit({
            ...todo,
            name,
            dueDate,
            done
        }, file)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return
        setFile(files[0])
    }

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }

    const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDueDate(event.target.value)
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.checked)
        setDone(event.target.checked)
    }

    const renderButton = () => (
        <>
            {processState === ProcessState.SaveMetaData && <p>Saving todo</p>}
            {processState === ProcessState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
            {processState === ProcessState.UploadingFile && <p>Uploading file</p>}
            <Button disabled={processState !== ProcessState.NoUpload} type="submit">
                Save
            </Button>
        </>
    )

    return <Form onSubmit={handleSubmit}>
        <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control type='text' value={name} onChange={handleNameChange} />
        </Form.Group>
        <Form.Group>
            <Form.Label>Due date</Form.Label>
            <Form.Control type='text' value={dueDate} onChange={handleDueDateChange} />
        </Form.Group>
        <Form.Group>
            <Form.Label>Done</Form.Label>
            <Form.Check defaultChecked={done} onChange={handleCheckboxChange} />
        </Form.Group>
        <Form.Group>
            <Form.Label>File</Form.Label>
            <Form.Control type='file' accept="image/*" placeholder="Image to upload"
                onChange={handleFileChange} />
        </Form.Group>
        {renderButton()}
    </Form>
}