/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Container } from "../components/Container";
import { GlobalDataContextType } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
// import { api } from "../../convex/_generated/api";
import Select from "react-select";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { IoIosBarcode } from "react-icons/io";
import useClipboard from "../hooks/useClipboard";

export type DataProps = {
  label: string;
  value: Id<"leagues">;
};

export function LeagueCode() {
  // GET GLOBAL DATA
  const { dbLeaguesData, onHeaderCustomize, onFooterCustomize } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize("Código dos Bolões", true, true);
    onFooterCustomize(true, true);
  }, []);

  const [data, setData] = useState<DataProps[]>([]);
  const [leagueDetails, setLeagueDetails] = useState<
    Doc<"leagues"> | undefined
  >();
  const copyToClipboard = useClipboard();

  function handleSelectData() {
    if (dbLeaguesData) {
      const array: DataProps[] = [];
      dbLeaguesData.map((league) =>
        array.push({
          label: `${league.name} ${league.season}`,
          value: league._id,
        })
      );
      setData(array);
    }
  }

  // PUT DATA ON SELECT
  useEffect(() => {
    handleSelectData();
  }, [dbLeaguesData]);

  // GETTING LEAGUE DETAILS TO SHOW CONFIRMATION
  function handleLeagueDetail(id: Id<"leagues">) {
    const leagueDetail = dbLeaguesData!.find((league) => league._id === id);
    if (leagueDetail) {
      setLeagueDetails(leagueDetail);
    }
  }

  return (
    <Container>
      <div className="mt-8 flex h-full w-full flex-col items-center justify-center gap-4">
        <Select
          options={data}
          isClearable={false}
          isSearchable={false}
          onChange={(e) => e && handleLeagueDetail(e.value)}
          className="w-full text-gray-600 outline-none"
          placeholder="Escolha..."
        />
        {leagueDetails && leagueDetails._id !== "" && (
          <>
            {leagueDetails.logoUrl === "" ? (
              <input
                className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
                id="no-image"
                type="text"
                placeholder="Sem imagem"
                readOnly
              />
            ) : (
              <img src={leagueDetails.logoUrl} className="h-24" />
            )}
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950 cursor-default"
              id="name"
              type="text"
              placeholder="Nome"
              value={`Bolão: ${leagueDetails.name}`}
              readOnly
              disabled
            />
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950 cursor-default"
              id="season"
              type="text"
              placeholder="Season"
              value={`Temporada: ${leagueDetails.season}`}
              readOnly
              disabled
            />
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950 cursor-default"
              id="season"
              type="text"
              placeholder="Liga criada por"
              value={`Criado por: ${leagueDetails.createdBy}`}
              readOnly
              disabled
            />
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950 cursor-default"
              id="participants"
              type="text"
              placeholder="Participantes"
              value={`Participantes: ${leagueDetails.participants.length}`}
              readOnly
              disabled
            />
          </>
        )}

        {/* DELETE LEAGUE BUTTON */}
        {leagueDetails && (
          <div className="flex flex-col w-full gap-2 justify-center items-center">
            <button
              className="flex flex-col w-full max-w-md items-center justify-between rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
              onClick={() => copyToClipboard(leagueDetails.code)}
            >
              <div className="flex w-full justify-center items-center">
                <IoIosBarcode
                  size={36}
                  color="#f3f4f6"
                  className="-my-2 pr-4 active:opacity-50"
                />
                <p className="text-center font-bold uppercase text-gray-100">
                  Código de acesso: {leagueDetails.code}
                </p>
              </div>
            </button>
            <p className="text-gray-500 text-xxs/relaxed uppercase">
              Clique no código para copiar e compartilhar
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
