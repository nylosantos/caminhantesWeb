/* eslint-disable react-hooks/exhaustive-deps */
import { Container } from "../components/Container";
import { Separator } from "../components/Separator";
import { Participants } from "../components/Participants";
import { PoolMenu } from "../components/PoolMenu";
import { useContext, useEffect, useState } from "react";
import { SelectFixtures } from "../components/SelectFixtures";
import { FixturesProps, GlobalDataContextType } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { v4 as uuidV4 } from "uuid";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { Doc } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { RingLoader } from "react-spinners";
import { PageProps } from "../LandingPage";
import { getCode } from "country-list";
import Flag from "react-world-flags";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export interface ParticipantsWithPoints {
  participant: Doc<"users">;
  totalPoints: number;
}

export default function PoolPage({ userData }: PageProps) {
  // GET GLOBAL DATA
  const {
    allRounds,
    convex,
    competition,
    fixturesToShow,
    inputGuesses,
    isMyGuesses,
    listToShow,
    loading,
    toggleGuessesResultsRanking,
    onFooterCustomize,
    onHeaderCustomize,
    handleClubBadge,
    setFilledGuesses,
    handleValueInputScore,
    setLoading,
    updateStateGuesses,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  const [participantsData, setParticipantsData] =
    useState<ParticipantsWithPoints[]>();

  useEffect(() => {
    if (userData && competition && isMyGuesses) {
      const emptyGuesses = [];
      const foundedLeagueIndex = userData.leagues.findIndex(
        (league) => league.id === competition._id
      );
      if (foundedLeagueIndex !== null && foundedLeagueIndex !== undefined) {
        fixturesToShow.map((item) => {
          if (new Date(item.DateUtc) < new Date()) {
            setFilledGuesses(true);
          } else {
            if (
              getUserMatchPoints(item).messageIfGuessIsNull !==
              "Palpite não enviado"
            ) {
              // console.log(getUserMatchPoints(item));
            } else {
              emptyGuesses.push(item);
            }
          }
        });
      }
      if (emptyGuesses.length === 0) {
        setFilledGuesses(true);
      } else {
        setFilledGuesses(false);
      }
    }
  }, [fixturesToShow]);

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize(`Meus Bolões`, true, true);
    onFooterCustomize(false, true);
  }, []);

  const ConfirmationAlert = withReactContent(Swal);

  async function updateGuess(item: FixturesProps) {
    const guess = inputGuesses.current.find(
      (userGuess) => userGuess.MatchNumber === item.MatchNumber
    );

    if (guess) {
      ConfirmationAlert.fire({
        title: "Você tem certeza?",
        text: "Não vai ser possível modificar o palpite!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#0d9488",
        confirmButtonText: "Sim, confirmar!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (
            guess.HomeTeamScore === null ||
            guess.AwayTeamScore === null ||
            isNaN(guess.HomeTeamScore) === true ||
            isNaN(guess.AwayTeamScore) === true
          ) {
            return toast.error(
              `Palpite inválido, verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
            );
          } else {
            const guessToUpdate = {
              leagueId: competition!._id,
              guess: guess,
            };
            convex
              .mutation(api.functions.updateOneGuess, {
                userId: userData!._id,
                guess: guessToUpdate,
              })
              .then(() => {
                toast.success("Palpite enviado! Agora é torcer! 👌");
              });
          }
        } else {
          return toast.warning(
            "Parabéns por pensar um pouco mais... Afinal, que palpite era aquele? 😂😂😂 #brinks"
          );
        }
      });
    } else {
      return toast.error(
        "Não foi possível computar seu palpite, por favor, contate a Administração... 🤯"
      );
    }
  }

  async function getLeagueAndParticipantsData() {
    if (competition) {
      const result = await convex.query(api.functions.findLeaguesParticipants, {
        leagueId: competition._id,
      });

      if (result) {
        setParticipantsData(result);
      }
    }
  }

  useEffect(() => {
    getLeagueAndParticipantsData();
    toggleGuessesResultsRanking("guesses");
  }, []);

  useEffect(() => {
    if (competition && userData) {
      getLeagueAndParticipantsData();
      setLoading(false);
    } else setLoading(true);
  }, [competition, userData]);

  function getUserMatchPoints(item: FixturesProps) {
    if (userData && competition) {
      const userActiveLeagueIndex = userData.leagues.findIndex(
        (league) => league.id === competition._id
      );
      if (userActiveLeagueIndex !== -1) {
        const userDataLeague = userData.leagues[userActiveLeagueIndex].guesses;
        if (userDataLeague) {
          const guessIndex = userDataLeague.findIndex(
            (guess) => guess.MatchNumber === item.MatchNumber
          );
          if (guessIndex !== -1) {
            if (
              userDataLeague[guessIndex].HomeTeamScore === null ||
              userDataLeague[guessIndex].AwayTeamScore === null
            ) {
              const dataReturn = {
                messageIfGuessIsNull: "Palpite não enviado",
                points: userDataLeague[guessIndex].points,
              };
              return dataReturn;
            } else {
              const dataReturn = {
                messageIfGuessIsNull: "",
                points: userDataLeague[guessIndex].points,
              };
              return dataReturn;
            }
          } else {
            const dataReturn = {
              messageIfGuessIsNull: "",
              points: -1,
            };
            return dataReturn;
          }
        } else {
          const dataReturn = {
            messageIfGuessIsNull: "",
            points: -1,
          };
          return dataReturn;
        }
      } else {
        const dataReturn = {
          messageIfGuessIsNull: "",
          points: -1,
        };
        return dataReturn;
      }
    } else {
      const dataReturn = {
        messageIfGuessIsNull: "",
        points: -1,
      };
      return dataReturn;
    }
  }

  // IF NATIONAL COMPETITION GET NATION FLAG
  function getCountryFlag(countryName: string) {
    let countryCode;
    if (countryName === "Republic of Ireland") {
      countryCode = "IE";
    } else if (countryName === "England") {
      countryCode = "GB_ENG";
    } else if (countryName === "Moldova") {
      countryCode = "MD";
    } else if (countryName === "Kosovo") {
      countryCode = "XK";
    } else if (countryName === "Wales") {
      countryCode = "GB_WLS";
    } else if (countryName === "Scotland") {
      countryCode = "GB_SCT";
    } else if (countryName === "Northern Ireland") {
      return (
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAA6CAMAAABWFo0JAAABI1BMVEX////MAADLAADVVFTTR0fIAADEAADx8fL09PTUPj6yNjbEp6fs8/PZV1e/AADOwsLg4OCzTk7W1ta6hISzAADWzMynAAC2iYmvKSn4//+wdnayRESzYWGvRQCiJQC5EwDFmwC0dAKnZQO/cHWxV1/AEx+2IQD/2wD80wDALjSzT1W1aG+9en+znGK6cwCyhCawnHehcXq8nzqslEOgeISrjWu7nljGx8u6tp6+TAC7OQC0bQ6Whl6FcEPCupu0rYSEEBWdExqXf0+DWzqfAAaWSQCiSxibNxmjjk6ObD6wDB+oNB2ePACtjCqmcAzLkgC3jAugegB7UwmNWgqPYgC1jT2qYk5mLwvUrQdpdjPvxAB+Zi+YeCrtyDjIt3nf0anGbmcaAr7DAAACJUlEQVRYhe2YXXOTQBSGd5FlSUg3sAHSkNqmjcba1lbjBzFVE2qsmtoG0tgvbfT//wp3abB3ziwzOd7wXrALM5xn9nB4zwJCOaRreCFNz3N/LhXQpUPJw3UCDt1otTbAocbmllgphoO2g0ePO0+22dOd3T0oJn+2f/D8Rfflq9cH+29CIGjvLSb9w3fvD/sG7n8wQZh00PGHkX/00Y+Go86AwkB7n6Ljz9GXr+OT4/G3HgwU8dPhZutsMtmaxNEph2Eis5vE0/M4nk3PZt+BmAhdzC6TaZxMk8vZBRhUT66ub378vLm+igEd6eR2Pv81mHdv1+GgpVpoh5SKw+8SGFQnzbaoWu64sIZflmMTtMtg4smxSiC6DKXUFF5bkgv1dhuojMUzNU1xeYnQSmjbNudWzUPByI0aXs3iXFwKK2pxHqhoxclus0Y+Y3Z25qwohUGaknA9w/i+y7zFSR2rRUFYTWxh8GVXQKt3c84Ug6hC8WojBY0Ek1hIJrixqhpDGYqDtKLSxdUdme1AOYQ61JBJ5YacDpmo2qoBBfXk9pP5YwQETdObrpThNoJJ710hVVw5J2n5Lr+QslemLuZakPeVyWkO8qGS3OaQ0wZFg8HG352gqg0q6d7wac2yLDOv4SuJmvetTSprbSbAjltf1C1ME8+gGm7KEXa7omFDVK5nQH+Jizp24D//ubRC6F86a2sYHkrIf4CmKqAFtIAW0AJaQP+hPwDUOOwnptfFAAAAAElFTkSuQmCC"
          className="h-10 w-10 object-contain"
        />
      );
    } else {
      countryCode = getCode(countryName);
    }
    return <Flag code={countryCode} className="h-10 w-10 object-contain" />;
  }

  // CUSTOMIZING BACKGROUND COLOR ACCORDING TO THE COMPETITION
  const chooseBgCompetitionColor = (name: string) => {
    if (name === "Premier League") {
      return "bg-purple-800";
    }
    if (name === "Champions League") {
      return "bg-blue-900";
    }
    if (name === "FA Cup") {
      return "bg-red-600";
    }
    if (name === "Carabao Cup") {
      return "bg-green-700";
    }
    if (name === "Nations League") {
      return "bg-amber-900";
    }
    if (
      name !== "premierLeague2425" &&
      name !== "ucl2425" &&
      name !== "faCup2425" &&
      name !== "carabaoCup2425"
    ) {
      return "bg-red-600";
    }
  };

  // CHANGE BORDER AND CARD COLOR IF LIVERPOOL ARE IN GAME
  const chooseBorderBgCardColor = (home: string, away: string) => {
    if (home === "Liverpool" || away === "Liverpool") {
      return "border-red-600 bg-red-100/50";
    } else {
      return `${chooseBorderCardColor(competition!.name)} bg-gray-200/50`;
    }
  };

  // CUSTOMIZING BORDER COLOR ACCORDING TO THE COMPETITION
  const chooseBorderCardColor = (name: string) => {
    if (name === "Premier League") {
      return "border-purple-800";
    }
    if (name === "Champions League") {
      return "border-blue-900";
    }
    if (name === "FA Cup") {
      return "border-red-600";
    }
    if (name === "Carabao Cup") {
      return "border-green-700";
    }
    if (name === "Nations League") {
      return "border-amber-500";
    }
    if (
      name !== "premierLeague2425" &&
      name !== "ucl2425" &&
      name !== "faCup2425" &&
      name !== "carabaoCup2425"
    ) {
      return "border-red-600";
    }
  };

  // CHANGE TEXT COLOR IF LIVERPOOL ARE IN GAME
  const chooseTextCardColor = (home: string, away: string) => {
    if (home === "Liverpool" || away === "Liverpool") {
      return "text-red-600";
    } else {
      return chooseTextCompetitionColor(competition!.name);
    }
  };

  // CUSTOMIZING TEXT COLOR ACCORDING TO THE COMPETITION
  const chooseTextCompetitionColor = (name: string) => {
    if (name === "Premier League") {
      return "text-purple-900";
    }
    if (name === "Champions League") {
      return "text-blue-900";
    }
    if (name === "FA Cup") {
      return "text-red-900";
    }
    if (name === "Carabao Cup") {
      return "text-green-900";
    }
    if (name === "Nations League") {
      return "text-amber-900";
    }
    if (
      name !== "premierLeague2425" &&
      name !== "ucl2425" &&
      name !== "faCup2425" &&
      name !== "carabaoCup2425"
    ) {
      return "text-gray-950";
    }
  };

  const textColor = chooseTextCompetitionColor(competition!.name);

  // CUSTOMIZING LOADING COLOR ACCORDING TO THE COMPETITION
  const chooseLoadingColor = (name: string) => {
    if (name === "Premier League") {
      return "#581c87";
    }
    if (name === "Champions League") {
      return "#1e3a8a";
    }
    if (name === "FA Cup") {
      return "#7f1d1d";
    }
    if (name === "Carabao Cup") {
      return "#14532d";
    }
    if (name === "Nations League") {
      return "#78350f";
    }
    if (
      name !== "premierLeague2425" &&
      name !== "ucl2425" &&
      name !== "faCup2425" &&
      name !== "carabaoCup2425"
    ) {
      return "#dc2626";
    }
  };

  return (
    <Container>
      <>
        <div className="z-9 fixed top-16 flex w-full max-w-md flex-col items-center justify-center bg-white px-6">
          {/* SUBHEADER */}
          <div className="mt-6 flex w-full flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <img src={competition!.logoUrl} className="h-10" />
              <div className="flex flex-col items-center">
                <p
                  className={`${textColor} w-full text-left text-base font-bold leading-relaxed`}
                >
                  {competition!.name} {competition!.season}
                </p>
                <p
                  className={`${textColor} w-full text-left text-xs font-normal leading-relaxed`}
                >
                  Criado por {competition!.createdBy}
                </p>
              </div>
            </div>
            <div>{competition && <Participants league={competition} />}</div>
          </div>
          <Separator />
          <div className="flex w-full flex-col gap-3 pb-3">
            <PoolMenu
              listToShow={listToShow}
              toggleGuessesResultsRanking={toggleGuessesResultsRanking}
            />
            <SelectFixtures listToShow={listToShow} rounds={allRounds} />
          </div>
        </div>
        {/* FIXTURES LIST */}
        {loading ? (
          <div className="-mt-20 flex h-screen w-full items-center justify-center">
            <RingLoader
              color={chooseLoadingColor(competition!.name)}
              size={150}
            />
          </div>
        ) : listToShow === "ranking" && participantsData ? (
          // RANKING LIST
          participantsData.length === 0 ? (
            <div className="flex w-full flex-1 items-center justify-center px-4">
              <p className={`${textColor} text-center`}>
                O ranking desse bolão ainda não foi formado, {"\n"} aguarde os
                resultados da rodada.
              </p>
            </div>
          ) : (
            <div className="mt-40 flex w-full flex-col">
              <ul className="w-full max-w-md overflow-auto">
                {participantsData
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((participant, index) => (
                    <div
                      className={`mb-3 flex w-full flex-row items-center justify-between rounded-md border-b-2 ${chooseBorderCardColor(competition!.name)} bg-gray-200/50 p-4`}
                      key={uuidV4()}
                    >
                      <div className="flex flex-row items-center gap-3">
                        <img
                          key={uuidV4()}
                          src={
                            participant.participant.photo === null
                              ? "https://cdn-icons-png.flaticon.com/512/4389/4389644.png"
                              : participant.participant.photo
                          }
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p
                            className={`text-left text-base font-bold leading-relaxed ${textColor}`}
                          >
                            {participant.participant.name}
                          </p>
                          <p
                            className={`text-left text-xs font-medium leading-relaxed ${textColor}`}
                          >
                            {participant.totalPoints > 1
                              ? `${participant.totalPoints} pontos`
                              : `${participant.totalPoints} ponto`}
                          </p>
                        </div>
                      </div>
                      <div className="">
                        <div
                          className={`${chooseBgCompetitionColor(competition!.name)} rounded-2xl px-3 py-1`}
                        >
                          <p className="text-sm font-bold text-gray-100">
                            {index + 1}º
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </ul>
            </div>
          )
        ) : // FIXTURES LIST (GUESSES AND RESULTS)
        fixturesToShow.length === 0 ? (
          <div className="mt-52 flex w-full flex-1 items-center justify-center px-4">
            <p className={`${textColor} text-center`}>
              Nenhum resultado disponível, selecione outra rodada ou aguarde
              atualizações de jogos disponíveis
            </p>
          </div>
        ) : (
          <div className="mt-48 flex w-full flex-col">
            {fixturesToShow.map((item) => (
              <div
                className={`mb-3 flex w-full flex-col items-center justify-center rounded-md border-b-2 ${chooseBorderBgCardColor(
                  item.HomeTeam,
                  item.AwayTeam
                )}`}
                key={uuidV4()}
              >
                {/* TEAMS AND DATE */}
                <div className="my-4 flex w-full flex-col">
                  <p
                    className={`w-full text-center text-sm font-bold ${chooseTextCardColor(
                      item.HomeTeam,
                      item.AwayTeam
                    )}`}
                  >
                    {item.HomeTeam} vs {item.AwayTeam}
                  </p>
                  <p
                    className={`w-full text-center text-xs ${chooseTextCardColor(
                      item.HomeTeam,
                      item.AwayTeam
                    )}`}
                  >
                    {`${item.Location}, ${formatInTimeZone(
                      item.DateUtc,
                      "America/Sao_Paulo",
                      "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}`}
                  </p>
                </div>
                {/* TEAMS BADGES AND SCORE INPUT */}
                <div className="mb-4 flex w-full flex-row items-center justify-center">
                  <div className="flex w-full flex-row items-center justify-center">
                    <div className="flex flex-row items-center justify-end">
                      <div className="flex flex-row items-center gap-2 px-2">
                        <div className="flex flex-row items-center">
                          {competition!._id ===
                          "jh700qq9t47yv0wxf7bzb0dmmd7030hv"
                            ? getCountryFlag(item.HomeTeam)
                            : handleClubBadge(item.HomeTeam)}
                        </div>
                      </div>
                      <input
                        hidden={
                          new Date(item.DateUtc) > new Date()
                            ? isMyGuesses
                              ? false
                              : true
                            : isMyGuesses
                              ? getUserMatchPoints(item)
                                  .messageIfGuessIsNull ===
                                "Palpite não enviado"
                                ? true
                                : false
                              : false
                        }
                        className={`${
                          isMyGuesses
                            ? getUserMatchPoints(item).messageIfGuessIsNull ===
                              "Palpite não enviado"
                              ? new Date(item.DateUtc) < new Date()
                                ? "bg-transparent" // IF GAME WAS STARTED
                                : "bg-gray-300" // IF GAME WASN'T START YET
                              : "bg-gray-300" // IF GUESS WAS SEND
                            : new Date(item.DateUtc) > new Date() // IF IS ON A RESULTS SCREEN
                              ? "bg-transparent" // IF GAME WASN'T START YET
                              : "bg-gray-300" // IF GAME WAS STARTED
                        } h-10 w-10 rounded text-center text-gray-950 outline-none`}
                        type="text"
                        id="home-score"
                        value={handleValueInputScore(item, "home")}
                        onChange={(event) => {
                          updateStateGuesses(
                            item.MatchNumber,
                            "home",
                            event.target.value
                              .replace(/[^0-9.]/g, "")
                              .replace(/(\..*?)\..*/g, "$1")
                          );
                        }}
                        readOnly={
                          !isMyGuesses
                            ? true
                            : new Date(item.DateUtc) < new Date()
                        }
                      />
                    </div>
                    {/* TEAM SEPARATOR: '-' or 'vs' */}
                    <p className="px-1 text-center text-gray-500">
                      {
                        isMyGuesses
                          ? getUserMatchPoints(item).messageIfGuessIsNull ===
                            "Palpite não enviado"
                            ? new Date(item.DateUtc) < new Date()
                              ? "vs" // IF GAME WAS STARTED
                              : "-" // IF GAME WASN'T START YET
                            : "-" // IF GUESS WAS SEND
                          : new Date(item.DateUtc) < new Date() // IF IS ON A RESULTS SCREEN
                            ? "-" // IF GAME WAS STARTED
                            : "vs" // IF GAME WASN'T START YET
                      }
                    </p>
                    <div className="flex flex-row items-center justify-start">
                      <input
                        hidden={
                          new Date(item.DateUtc) > new Date()
                            ? isMyGuesses
                              ? false
                              : true
                            : isMyGuesses
                              ? getUserMatchPoints(item)
                                  .messageIfGuessIsNull ===
                                "Palpite não enviado"
                                ? true
                                : false
                              : false
                        }
                        className={`${
                          isMyGuesses
                            ? getUserMatchPoints(item).messageIfGuessIsNull ===
                              "Palpite não enviado"
                              ? new Date(item.DateUtc) < new Date()
                                ? "bg-transparent" // IF GAME WAS STARTED
                                : "bg-gray-300" // IF GAME WASN'T START YET
                              : "bg-gray-300" // IF GUESS WAS SEND
                            : new Date(item.DateUtc) > new Date() // IF IS ON A RESULTS SCREEN
                              ? "bg-transparent" // IF GAME WASN'T START YET
                              : "bg-gray-300" // IF GAME WAS STARTED
                        } h-10 w-10 rounded text-center text-gray-950 outline-none`}
                        type="text"
                        id="away-score"
                        value={handleValueInputScore(item, "away")}
                        onChange={(event) => {
                          const score = event.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\..*/g, "$1");
                          updateStateGuesses(item.MatchNumber, "away", score);
                        }}
                        readOnly={
                          !isMyGuesses
                            ? true
                            : new Date(item.DateUtc) < new Date()
                        }
                      />
                      <div className="flex flex-row items-center gap-2 px-2">
                        <div className="flex flex-row items-center">
                          {competition!._id ===
                          "jh700qq9t47yv0wxf7bzb0dmmd7030hv"
                            ? getCountryFlag(item.AwayTeam)
                            : handleClubBadge(item.AwayTeam)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* USER POINTS */}
                {listToShow === "guesses" ? (
                  <div className="mb-4 flex w-full flex-col items-center justify-center px-4">
                    {new Date(item.DateUtc) > new Date() ? (
                      handleValueInputScore(item, "home") === undefined ||
                      handleValueInputScore(item, "away") === undefined ? (
                        <button
                          className="flex w-full items-center justify-center gap-2 rounded bg-red-600 px-2 py-1 outline-none"
                          onClick={() => updateGuess(item)}
                        >
                          <p className="text-xs font-semibold uppercase text-gray-100">
                            Enviar Palpite ?
                          </p>
                        </button>
                      ) : (
                        <div className="flex w-full items-center justify-center gap-2 rounded bg-green-600 px-2 py-1 outline-none">
                          <p className="text-xs font-semibold uppercase text-gray-100">
                            Palpite Enviado
                          </p>
                          <FaCheck className="text-gray-100" size={10} />
                        </div>
                      )
                    ) : getUserMatchPoints(item).messageIfGuessIsNull ===
                      "Palpite não enviado" ? (
                      // <p className="text-center text-xs text-gray-950">
                      //   Partida iniciada, não é possível palpitar
                      // </p>
                      <div className="flex w-full items-center justify-center gap-2 rounded bg-gray-400/70 px-2 py-1 outline-none">
                        <p className="text-xs font-semibold uppercase text-gray-100">
                          Partida iniciada, não é possível palpitar
                        </p>
                      </div>
                    ) : (
                      // <p className="text-center text-xs font-semibold text-gray-950">Faça já o seu palpite</p>

                      <div className="flex w-full items-center justify-center gap-2 rounded bg-teal-600 px-2 py-1 outline-none">
                        <p className="text-center text-xs font-semibold uppercase text-gray-100">
                          {getUserMatchPoints(item).messageIfGuessIsNull === ""
                            ? getUserMatchPoints(item).points > 1
                              ? `Pontuação: ${getUserMatchPoints(item).points} pontos`
                              : getUserMatchPoints(item).points === 1
                                ? `Pontuação: ${getUserMatchPoints(item).points} ponto`
                                : `Pontuação: 0`
                            : `Pontuação: 0`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </>
    </Container>
  );
}
