/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { Container } from "../components/Container";
import { FixturesProps, GlobalDataContextType, MatchesProps } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { api } from "../../convex/_generated/api";
import Button from "../components/Button";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Separator } from "../components/Separator";

export type DataProps = {
  label: string;
  value: Id<"leagues">;
};

export function UpdateResults() {
  // GET GLOBAL DATA
  const {
    convex,
    dbLeaguesData,
    handleFormatClubName,
    onFooterCustomize,
    onHeaderCustomize,
    setIsSubmitting,
    setPage,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize("Atualizar Resultados", true, true);
    onFooterCustomize(true, true);
  }, []);

  const [data, setData] = useState<DataProps[]>([]);

  const [leagueId, setLeagueId] = useState<number | undefined>();

  const [leagueDetails, setLeagueDetails] = useState<
    Doc<"leagues"> | undefined
  >();

  function handleSelectData() {
    if (dbLeaguesData) {
      const array: DataProps[] = [];
      dbLeaguesData.map((league) => {
        if (league.participants.length > 0) {
          array.push({
            label: `${league.name} ${league.season}`,
            value: league._id,
          });
        }
      });
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
      if (leagueDetail.name === "Premier League") {
        setLeagueId(47);
      } else if (leagueDetail.name === "Champions League") {
        setLeagueId(42);
      } else if (leagueDetail.name === "Carabao Cup") {
        setLeagueId(133);
      } else {
        setLeagueId(undefined);
      }
    }
  }

  const ConfirmationAlert = withReactContent(Swal);

  function callUpdateOneLeaguePointsConfirmation(name: string) {
    if (leagueId) {
      ConfirmationAlert.fire({
        title: "Você tem certeza?",
        text: `Vamos atualizar toda a pontuação de ${name}!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, atualizar!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setIsSubmitting(true);
          try {
            await handleUpdateLeagueResults();
          } catch (error) {
            console.log(error);
          } finally {
            setIsSubmitting(false);
          }

          clearFields();
        }
      });
    } else {
      return toast.error(
        "Não é possível atualizar os resultados da liga selecionada [leagueId undefined]... 🤯"
      );
    }
  }

  async function handleUpdateLeagueResults() {
    setIsSubmitting(true);
    const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-all-matches-by-league?leagueid=${leagueId}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "13eada8944msh179bcc5f6e6d88ap17aff9jsn82156ef129b3",
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const result: MatchesProps = await response.json();

      const matchesToUpdate: FixturesProps[] = [];

      result.response.matches.map((match) => {
        for (let index = 0; index < leagueDetails!.games.length; index++) {
          if (
            leagueDetails!.games[index].AwayTeam ===
              handleFormatClubName(match.away.name) &&
            leagueDetails!.games[index].HomeTeam ===
              handleFormatClubName(match.home.name) &&
            !match.notStarted
          ) {
            matchesToUpdate.push({
              ...leagueDetails!.games[index],
              AwayTeamScore: match.away.score,
              HomeTeamScore: match.home.score,
            });
          }
        }
      });

      const newCompetitionGames = leagueDetails!.games.map((game) => {
        const score = matchesToUpdate.find(
          (match) =>
            handleFormatClubName(match.AwayTeam) === game.AwayTeam &&
            handleFormatClubName(match.HomeTeam) === game.HomeTeam
        );
        if (score) {
          return {
            ...game,
            AwayTeamScore: score.AwayTeamScore,
            HomeTeamScore: score.HomeTeamScore,
          };
        } else {
          return game;
        }
      });

      await convex.mutation(api.functions.updateLeagueFixtureResults, {
        leagueId: leagueDetails!._id,
        fixtures: newCompetitionGames,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setPage({ prev: "home", show: "dashboard" });
    }
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

        <Separator />

        {/* UPDATE LEAGUE POINTS || UPDATE ALL LEAGUES POINTS BUTTON */}
        {leagueDetails && (
          <Button
            name={`Atualizar os resultados de  ${leagueDetails.name} ${leagueDetails.season}?`}
            type="ball"
            buttonFunction={() =>
              callUpdateOneLeaguePointsConfirmation(
                `${leagueDetails.name} ${leagueDetails.season}`
              )
            }
          />
        )}
      </div>
    </Container>
  );
}
