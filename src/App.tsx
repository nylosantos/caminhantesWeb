import { useContext } from "react";
import { GlobalDataContext } from "./context/GlobalDataContext";
import { GlobalDataContextType } from "./@types";
import { LoginPage } from "./screens/LoginPage";
import LandingPage from "./LandingPage";

function App() {
  // GET GLOBAL DATA
  const { logged } = useContext(GlobalDataContext) as GlobalDataContextType;

  if (!logged) {
    return <LoginPage />;
  } else {
    return <LandingPage />;
  }
}

export default App;
