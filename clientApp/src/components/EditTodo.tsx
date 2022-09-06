import { getTodoById, getUploadUrl, patchTodo, uploadFile } from '../api/todos-api'
import { useContext, useEffect, useState } from 'react'
import { TodoForm } from './TodoForm'
import { useNavigate, useParams } from 'react-router-dom'
import { Loading } from './Loading'
import { UserContext } from '../context/UserContext'
import { Todo } from '../types/Todo'
import { ProcessState } from '../types/ProcessState'

export const EditTodo = () => {

  const params = useParams()
  const navigate = useNavigate()

  const [processState, setProcessState] = useState(ProcessState.NoUpload)
  const [loading, setLoading] = useState(false)
  const userContext = useContext(UserContext)
  const [todoItem, setTodoItem] = useState({} as Todo)
  
  const todoId = params.todoId

  useEffect(() => {
    async function loadTodo() {
      const todo = await getTodoById(userContext.idToken, todoId)
      console.log("GetTodoById", JSON.stringify(todo))
      setTodoItem(todo)
    }

    setLoading(true)
    loadTodo()
    setLoading(false)
  }, [userContext, todoId])

  const handleSubmit = async (todo: Todo, file: any) => {

    try {
      setProcessState(ProcessState.SaveMetaData)
      await patchTodo(userContext.idToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: todo.done,
      });

    } catch {
      alert("Todo modification failed");
    }

    try {
      if (file) {
        setProcessState(ProcessState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(userContext.idToken, todoId)

        setProcessState(ProcessState.UploadingFile)
        await uploadFile(uploadUrl, file)
      }
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      setProcessState(ProcessState.NoUpload)
    }

    alert('Data is saved!')

    navigate("/")
  }

  

  return (
    <div>
      <h1>Edit todo</h1>
      {loading ? <Loading /> : <TodoForm todo={todoItem} onSubmit={handleSubmit} processState={processState} />}
    </div>
  )

}
