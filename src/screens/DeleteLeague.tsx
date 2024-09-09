/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Container } from "../components/Container";
import { GlobalDataContextType } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { api } from "../../convex/_generated/api";
import Button from "../components/Button";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Doc, Id } from "../../convex/_generated/dataModel";

export type DataProps = {
  label: string;
  value: Id<"leagues">;
};

export function DeleteLeague() {
  // GET GLOBAL DATA
  const {
    convex,
    deleteLeague,
    setIsSubmitting,
    onHeaderCustomize,
    onFooterCustomize,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize("Deletar Bolão", true, true);
    onFooterCustomize(true, true);
  }, []);

  const [data, setData] = useState<DataProps[]>([]);
  const [dbLeagues, setDbLeagues] = useState<Doc<"leagues">[]>([]);
  const [leagueDetails, setLeagueDetails] = useState<
    Doc<"leagues"> | undefined
  >();

  // GET LEAGUES FROM DB
  async function getDbLeagues() {
    return await convex.query(api.dbRoot.getLeagues);
  }

  // CALL FUNCTION ON RENDER
  useEffect(() => {
    getDbLeagues().then((res) => {
      if (res) {
        setDbLeagues(res);
      }
    });
  }, []);

  function handleSelectData() {
    if (dbLeagues) {
      const array: DataProps[] = [];
      dbLeagues.map((league) =>
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
  }, [dbLeagues]);

  // GETTING LEAGUE DETAILS TO SHOW CONFIRMATION
  function handleLeagueDetail(id: Id<"leagues">) {
    const leagueDetail = dbLeagues.find((league) => league._id === id);
    if (leagueDetail) {
      setLeagueDetails(leagueDetail);
    }
  }

  const ConfirmationAlert = withReactContent(Swal);

  function callConfirmation() {
    ConfirmationAlert.fire({
      title: "Você tem certeza?",
      text: "Não vai ser possível desfazer essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleDeleteLeague();
        clearFields();
      }
    });
  }

  async function handleDeleteLeague() {
    setIsSubmitting(true);
    if (leagueDetails) {
      deleteLeague(leagueDetails?._id);
    }
    setIsSubmitting(false);
  }

  function clearFields() {
    setLeagueDetails(undefined);
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
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950"
              id="name"
              type="text"
              placeholder="Nome"
              value={`Bolão: ${leagueDetails.name}`}
              readOnly
            />
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950"
              id="season"
              type="text"
              placeholder="Season"
              value={`Temporada: ${leagueDetails.season}`}
              readOnly
            />
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950"
              id="season"
              type="text"
              placeholder="Liga criada por"
              value={`Criado por: ${leagueDetails.createdBy}`}
              readOnly
            />
            <input
              className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-center text-gray-950"
              id="participants"
              type="text"
              placeholder="Participantes"
              value={`Participantes: ${leagueDetails.participants.length}`}
              readOnly
            />
          </>
        )}

        {/* DELETE LEAGUE BUTTON */}
        {leagueDetails ? (
          <Button
            name={`Deletar ${leagueDetails.name} ${leagueDetails.season}?`}
            type="ball"
            buttonFunction={callConfirmation}
          />
        ) : null}
      </div>
    </Container>
  );
}
