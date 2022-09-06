import React, { useContext, useEffect, useState } from "react";
import update from "immutability-helper";

import { createTodo, deleteTodo, getTodos, patchTodo } from "../api/todos-api";
import { Todo } from "../types/Todo";
import { calculateDueDate } from "../utils/dateUtils";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Form, Image, InputGroup, Row } from "react-bootstrap";
import { Loading } from "./Loading";
import PencilIcon from "./PencilIcon";
import DeleteIcon from "./DeleteIcon";

export const Todos = () => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate()

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [loadingTodos, setLoadingTodos] = useState(false);

  useEffect(() => {
    async function loadTodoAsync() {
      try {
        if (userContext.idToken) {
          setLoadingTodos(true);
          const todos = await getTodos(userContext.idToken);
          setTodos(todos);
          setLoadingTodos(false);
        }
      } catch (e) {
        alert(`Failed to fetch todos: ${(e as Error).message}`);
      }
    }

    loadTodoAsync();
  }, [userContext.idToken]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(event.target.value);
  };

  const onEditButtonClick = (todoId: string) => {
    navigate(`/todos/${todoId}/edit`);
  };

  const onTodoCreate = async () => {
    try {
      const dueDate = calculateDueDate();
      const newTodo = await createTodo(userContext.idToken, {
        name: newTodoName,
        dueDate,
      });
      setTodos([...todos, newTodo]);
      setNewTodoName(newTodoName);
    } catch {
      alert("Todo creation failed");
    }
  };

  const onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(userContext.idToken, todoId);
      setTodos(todos.filter((todo) => todo.todoId !== todoId));
    } catch {
      alert("Todo deletion failed");
    }
  };

  const onTodoCheck = async (pos: number) => {
    try {
      const todo = todos[pos];
      await patchTodo(userContext.idToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done,
      });
      setTodos(
        update(todos, {
          [pos]: { done: { $set: !todo.done } },
        })
      );
    } catch {
      alert("Todo deletion failed");
    }
  };

  const renderCreateTodoInput = () => (
    <Row>
      <Col width={16}>
        <InputGroup className="mb-3">
          <Button onClick={onTodoCreate}>New task</Button>
          <Form.Control
            placeholder="To change the world..."
            onChange={handleNameChange}
          />

        </InputGroup>
        {/* <Form.Control
          action={{
            color: "teal",
            labelPosition: "left",
            icon: "add",
            content: "New task",
            onClick: onTodoCreate,
          }}
          fluid
          actionPosition="left"
          placeholder="To change the world..."
          onChange={handleNameChange}
        /> */}
      </Col>
      <Col width={16}>
        <hr />
      </Col>
    </Row>
  );

  const renderTodos = () => {
    if (loadingTodos) {
      return renderLoading();
    }

    return renderTodosList();
  };

  const renderLoading = () => (
    <Loading />
  );

  const renderTodosList = () => (
    <Container>
      {todos &&
        todos.map((todo, pos) => {
          return (
            <Row key={todo.todoId}>
              <Col width={1} verticalAlign="middle">
                <Form.Check
                  onChange={() => onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Col>
              <Col width={10} verticalAlign="middle">
                {todo.name}
              </Col>
              <Col width={3} floated="right">
                {todo.dueDate}
              </Col>
              <Col width={1} floated="right">
                <Button onClick={() => onEditButtonClick(todo.todoId)}>
                  <PencilIcon />
                </Button>
              </Col>
              <Col width={1} floated="right">
                <Button
                  color="red"
                  onClick={() => onTodoDelete(todo.todoId)}
                >
                  <DeleteIcon />
                </Button>
              </Col>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} thumbnail rounded />
              )}
              <Col width={16}>
                <hr />
              </Col>
            </Row>
          );
        })}
    </Container>
  );

  return (
    <div>
      <h1>TODOs</h1>

      {renderCreateTodoInput()}

      {renderTodos()}
    </div>
  );
};
