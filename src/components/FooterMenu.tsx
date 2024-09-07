import { GiSoccerBall } from "react-icons/gi";
import { GrSystem } from "react-icons/gr";
import { IoSettings } from "react-icons/io5";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { GlobalDataContextType } from "../@types";
import { useContext } from "react";

export function FooterMenu() {
  // GET GLOBAL DATA
  const { page, userData, setPage } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  return (
    <div className="z-9 flex w-full items-center justify-center bg-gray-200 pb-5">
      <div className="flex w-full max-w-md justify-evenly pt-2 align-top">
        <button
          onClick={() =>
            page.show === "home"
              ? null
              : setPage({ show: "home", prev: page.show })
          }
          className={`flex flex-col items-center gap-1 ${page.show === "home" ? "text-red-600" : "text-gray-500/70"}`}
        >
          <GiSoccerBall size={24} />
          <p className="text-xs">Meus Bolões</p>
        </button>
        <button
          onClick={() =>
            page.show === "settings"
              ? null
              : setPage({ show: "settings", prev: page.show })
          }
          className={`flex flex-col items-center gap-1 ${page.show === "settings" ? "text-red-600" : "text-gray-500/70"}`}
        >
          <IoSettings size={24} />
          <p className="text-xs">Configurações</p>
        </button>
        {userData?.role === "admin" && (
          <button
            onClick={() =>
              page.show === "dashboard"
                ? null
                : setPage({ show: "dashboard", prev: page.show })
            }
            className={`flex flex-col items-center gap-1 ${page.show === "dashboard" ? "text-red-600" : "text-gray-500/70"}`}
          >
            <GrSystem size={24} />
            <p className="text-xs">Administração</p>
          </button>
        )}
      </div>
    </div>
  );
}
