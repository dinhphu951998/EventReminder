import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { Loading } from "./Loading";

export const Callback = () => {

  const userContext = useContext(UserContext)
  const navigate = useNavigate()

  if (userContext.authenticated) {
    navigate("/")
  }

  return (
    <>
      <Loading />
      <p>Loading</p>
    </>
  );
}

