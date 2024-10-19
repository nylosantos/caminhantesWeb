/* eslint-disable react-hooks/exhaustive-deps */
import FooterContainer from "./components/FooterContainer";
import { Header } from "./components/Header";
import { useContext, useEffect /*, useState*/ } from "react";
import { GlobalDataContext } from "./context/GlobalDataContext";
import { GlobalDataContextType, SetPageProps } from "./@types";
import { LoginPage } from "./screens/LoginPage";
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import SearchPool from "./screens/SearchPool";
import PoolPage from "./screens/PoolPage";
import Dashboard from "./screens/Dashboard";
import { CreateLeague } from "./screens/CreateLeague";
import { DeleteLeague } from "./screens/DeleteLeague";
import { Id } from "../convex/_generated/dataModel";
import { Modal } from "@mui/material";
import ModalInfo from "./components/ModalInfo";
import { UpdatePoints } from "./screens/UpdatePoints";
import Notification from "./components/Notification";

export type PageProps = {
  userData:
    | {
        _id: Id<"users">;
        _creationTime: number;
        leagues: {
          id: Id<"leagues"> | null;
          guesses: {
            AwayTeamScore: number | null;
            HomeTeamScore: number | null;
            MatchNumber: number;
            RoundNumber: number;
            points: number;
          }[];
          totalPoints: number;
        }[];
        name: string | null;
        email: string | null;
        phone: string | null;
        photo: string | null;
        role: string;
      }
    | null
    | undefined;
};

function LandingPage() {
  // GET GLOBAL DATA
  const {
    headerLeftBackIcon,
    headerRightInfoIcon,
    headerTitle,
    logged,
    openModal,
    page,
    userData,
    userPools,
    setPage,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  useEffect(() => {
    setPage({ show: "home", prev: "home" });
  }, []);

  function renderPage(pageTo: SetPageProps) {
    if (pageTo.show === "home") {
      return <Home userData={userData} userPools={userPools} />;
    } else if (pageTo.show === "settings") {
      return <Settings userData={userData} />;
    } else if (pageTo.show === "searchPool") {
      return <SearchPool userData={userData} />;
    } else if (pageTo.show === "poolPage") {
      return <PoolPage userData={userData} />;
    } else if (pageTo.show === "dashboard") {
      return <Dashboard />;
    } else if (pageTo.show === "createLeague") {
      return <CreateLeague />;
    } else if (pageTo.show === "deleteLeague") {
      return <DeleteLeague />;
    } else if (pageTo.show === "updateLeaguePoints") {
      return <UpdatePoints />;
    }
  }

  if (!logged) {
    return <LoginPage />;
  } else {
    return (
      <div className="flex h-screen flex-col justify-between scroll-smooth">
        <Notification />
        {/* HEADER */}
        <Header
          title={headerTitle}
          showLeftButton={headerLeftBackIcon}
          showRightButton={headerRightInfoIcon}
        />
        {renderPage(page)}
        {/* FOOTER */}
        <FooterContainer />
        {/* MODAL */}
        <Modal
          open={openModal}
          className="flex w-full items-start justify-center overflow-auto"
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <ModalInfo />
        </Modal>
      </div>
    );
  }
}

export default LandingPage;
