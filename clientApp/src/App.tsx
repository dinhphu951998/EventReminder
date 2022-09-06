import { Route, Routes } from "react-router-dom";
import { EditTodo } from "./components/EditTodo";
import { LogIn } from "./components/LogIn";
import { NotFound } from "./components/NotFound";
import { Todos } from "./components/Todos";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";
import { Col, Container, Nav, Row } from "react-bootstrap";

export const App = () => {
  const { loginWithRedirect, logout } = useAuth0();
  const userContext = useContext(UserContext);

  const logInLogOutButton = () => {
    if (userContext.authenticated) {
      return (
        <Nav.Link
          onClick={() => {
            localStorage.clear();
            logout({ returnTo: window.location.origin });
          }}
        >
          Log Out
        </Nav.Link>
      );
    } else {
      return (
        <Nav.Link onClick={loginWithRedirect}>
          Log In
        </Nav.Link>
      );
    }
  };

  const generateMenu = () => {
    return (
      <Nav>
        <Nav.Item>
          <Nav.Link href="/">Home</Nav.Link>
        </Nav.Item>

        <Nav.Item className="justify-content-end">{logInLogOutButton()}</Nav.Item>
      </Nav >
    );
  };

  const generateCurrentPage = () => {
    if (!userContext.authenticated) {
      return <LogIn />;
    }

    return (
      <Routes>
        <Route path="/" element={<Todos />} />
        <Route path="/todos/:todoId/edit" element={<EditTodo />} />
        <Route element={<NotFound />} />
      </Routes>
    );
  };

  return (
    <div>
      <Container>
        <Row>
          <Col width={16}>
            {generateMenu()}

            {generateCurrentPage()}
          </Col>
        </Row>
      </Container>
    </div>
  );
};
