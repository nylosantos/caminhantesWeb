/* eslint-disable react-hooks/exhaustive-deps */
import { Container } from "../components/Container";
import { Separator } from "../components/Separator";
import { useContext, useEffect } from "react";
import { GlobalDataContextType } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { IoIosBarcode, IoMdCreate } from "react-icons/io";
import { MdBrowserUpdated, MdDeleteSweep } from "react-icons/md";

export default function Dashboard() {
  // GET GLOBAL DATA
  const {
    page,
    isSubmitting,
    userData,
    setPage,
    onHeaderCustomize,
    onFooterCustomize,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize("Dashboard", false, true);
    onFooterCustomize(false, true);
  }, []);

  return (
    <Container>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <p className="mt-6 text-center text-2xl font-black uppercase text-red-600">
          Administração Bolão Caminhantes
        </p>

        <Separator />
        <div className="flex w-full flex-col gap-14">
          {userData?.role === "admin" && (
            <>
              {/* GO TO CREATE POOL BUTTON */}
              <button
                className="flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
                disabled={isSubmitting}
                onClick={() =>
                  setPage({ show: "createLeague", prev: page.show })
                }
              >
                <IoMdCreate
                  size={36}
                  color="#f3f4f6"
                  className="-my-2 pr-4 active:opacity-50"
                />
                <p className="text-center font-bold uppercase text-gray-100">
                  {isSubmitting ? "Aguarde..." : "Criar Bolão"}
                </p>
              </button>
              {/* GO TO DELETE POOL BUTTON */}
              <button
                className="flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
                disabled={isSubmitting}
                onClick={() =>
                  setPage({ show: "deleteLeague", prev: page.show })
                }
              >
                <MdDeleteSweep
                  size={36}
                  color="#f3f4f6"
                  className="-my-2 pr-4 active:opacity-50"
                />
                <p className="text-center font-bold uppercase text-gray-100">
                  {isSubmitting ? "Aguarde..." : "Deletar Bolão"}
                </p>
              </button>
              {/* UPDATE ALL LEAGUES POINTS */}
              <button
                className="flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
                disabled={isSubmitting}
                onClick={() =>
                  setPage({ show: "updateLeaguePoints", prev: page.show })
                }
              >
                <MdBrowserUpdated
                  size={36}
                  color="#f3f4f6"
                  className="-my-2 pr-4 active:opacity-50"
                />
                <p className="text-center font-bold uppercase text-gray-100">
                  {isSubmitting ? "Aguarde..." : "Atualizar Pontos"}
                </p>
              </button>
            </>
          )}
          {/* UPDATE LEAGUES RESULTS */}
          <button
            className="flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
            disabled={isSubmitting}
            onClick={() =>
              setPage({ show: "updateLeagueResults", prev: page.show })
            }
          >
            <MdBrowserUpdated
              size={36}
              color="#f3f4f6"
              className="-my-2 pr-4 active:opacity-50"
            />
            <p className="text-center font-bold uppercase text-gray-100">
              {isSubmitting ? "Aguarde..." : "Atualizar Resultados"}
            </p>
          </button>
          {/* GET LEAGUES CODES */}
          <div className="flex flex-col gap-2 justify-center items-center">
            <button
              className="flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
              onClick={() => setPage({ show: "leagueCode", prev: page.show })}
            >
              <IoIosBarcode
                size={36}
                color="#f3f4f6"
                className="-my-2 pr-4 active:opacity-50"
              />
              <p className="text-center font-bold uppercase text-gray-100">
                Códigos dos Bolões
              </p>
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
