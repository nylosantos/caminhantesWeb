/* eslint-disable react-hooks/exhaustive-deps */
import { Separator } from "./Separator";
import { /*memo, */ useContext, useEffect, useState } from "react";
import { FixturesProps, GlobalDataContextType, GuessesProps } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { v4 as uuidV4 } from "uuid";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { Doc } from "../../convex/_generated/dataModel";
import { RingLoader } from "react-spinners";
import { getCode } from "country-list";
import Flag from "react-world-flags";
import TeamResultsModal from "./TeamResultsModal";
import { Modal } from "@mui/material";
import { SelectFixtures } from "./SelectFixtures";

export interface ParticipantsWithPoints {
  participant: Doc<"users">;
  totalPoints: number;
}

interface AnotherUserGuessesModalProps {
  userId: string;
  openUserModal: boolean;
  handleCloseUserModal: () => void;
}

export default function AnotherUserGuessesModal({
  openUserModal,
  userId,
  handleCloseUserModal,
}: AnotherUserGuessesModalProps) {
  // GET GLOBAL DATA
  const { competition, dbUsersData, loading, handleClubBadge, setLoading } =
    useContext(GlobalDataContext) as GlobalDataContextType;

  const [userData, setUserData] = useState<Doc<"users">>();
  const [isMyGuesses] = useState(true);
  const [userGuessesData, setUserGuessesData] = useState<GuessesProps[]>([]);
  const [fixturesToShow, setFixturesToShow] = useState<FixturesProps[]>([]);
  const [roundSelected, setRoundSelected] = useState<number | undefined>();
  const [allRounds, setAllRounds] = useState<number[]>([]);

  // SETTING ALL ROUNDS OF COMPETITION
  useEffect(() => {
    if (userData && userData.leagues !== null && competition) {
      const selectedFixtures = competition.games;
      if (selectedFixtures !== null) {
        const roundsArray: number[] = [];
        setLoading(true);
        for (let index = 0; index < selectedFixtures.length; index++) {
          const roundExist = roundsArray.findIndex(
            (round) => round === selectedFixtures[index].RoundNumber
          );
          if (roundExist < 0) {
            roundsArray.push(selectedFixtures[index].RoundNumber);
          }
        }
        const initialRoundSelected = selectedFixtures.find(
          (fixture) => new Date(fixture.DateUtc) > new Date()
        );
        if (initialRoundSelected) {
          setRoundSelected(initialRoundSelected.RoundNumber);
        } else {
          setRoundSelected(roundsArray.length - 1);
        }
        setAllRounds(roundsArray);
        setLoading(false);
      }
    }
  }, [userData, competition]);

  // SET USER DATA WHEN USERID AND/OR DATABASE IS CHANGED
  useEffect(() => {
    if (userId !== "" && dbUsersData) {
      const foundedUser = dbUsersData.find((user) => user._id === userId);
      if (foundedUser) {
        setUserData(foundedUser);
      }
    }
  }, [dbUsersData, userId]);

  // SET USER GUESSES DATA WHEN USERDATA AND/OR COMPETITION IS CHANGED
  useEffect(() => {
    if (userData && competition) {
      const foundedUserLeagueGuesses = userData.leagues.find(
        (league) => league.id === competition._id
      );
      if (foundedUserLeagueGuesses) {
        setUserGuessesData(foundedUserLeagueGuesses.guesses);
      }
    }
  }, [userData, competition]);

  // SET LOADING TO WAIT COMPETITION AND USERDATA
  useEffect(() => {
    if (competition && userData) {
      setLoading(false);
    } else setLoading(true);
  }, [competition, userData]);

  // SET FIXTURES TO SHOW WHEN ROUNDSELECTED IS CHANGED
  useEffect(() => {
    if (roundSelected) {
      const foundedFixtures = competition?.games.filter(
        (game) => game.RoundNumber === roundSelected
      );
      if (foundedFixtures) {
        setFixturesToShow(foundedFixtures);
      }
    }
  }, [roundSelected]);

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
    if (name === "WSL") {
      return "border-[#1e1034]";
    }
    if (
      name !== "Premier League" &&
      name !== "Champions League" &&
      name !== "FA Cup" &&
      name !== "Carabao Cup" &&
      name !== "WSL"
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
    if (name === "WSL") {
      return "text-[#1e1034]";
    }
    if (
      name !== "Premier League" &&
      name !== "Champions League" &&
      name !== "FA Cup" &&
      name !== "Carabao Cup" &&
      name !== "WSL"
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
    if (name === "WSL") {
      return "#1e1034";
    }
    if (
      name !== "Premier League" &&
      name !== "Champions League" &&
      name !== "FA Cup" &&
      name !== "Carabao Cup" &&
      name !== "WSL"
    ) {
      return "#dc2626";
    }
  };

  interface ScoreGuessFunctionProps {
    matchNumber: number;
    teamLocation: "home" | "away";
  }

  // CHECK AND FILL INPUT FUNCTION
  function handleScoreGuess({
    matchNumber,
    teamLocation,
  }: ScoreGuessFunctionProps) {
    if (userGuessesData) {
      const foundedMatchGuess = userGuessesData.find(
        (matchGuess) => matchGuess.MatchNumber === matchNumber
      );

      if (foundedMatchGuess) {
        if (teamLocation === "home") {
          return foundedMatchGuess.HomeTeamScore?.toString();
        } else {
          return foundedMatchGuess.AwayTeamScore?.toString();
        }
      } else {
        return "9";
      }
    } else {
      return "9";
    }
  }

  // CLASSNAME INPUT FUNCTION COMPLEMENT
  function complementClassNameFunction(item: FixturesProps) {
    if (isMyGuesses) {
      // GUESS SCREEN
      if (
        getUserMatchPoints(item).messageIfGuessIsNull === "Palpite não enviado"
      ) {
        // IF GUESS WASN'T SEND
        if (new Date(item.DateUtc) < new Date()) {
          // IF GAME WAS STARTED
          return "bg-transparent hidden";
        } else {
          // IF GAME WASN'T START YET
          return "bg-gray-300 w-10";
        }
      } else {
        // IF GUESS WAS SEND
        return "bg-gray-300 w-10";
      }
    } else {
      // RESULTS SCREEN
      if (
        handleScoreGuess({
          matchNumber: item.MatchNumber,
          teamLocation: "home",
        })
      ) {
        return "w-5 bg-transparent font-semibold"; // RESULT UPDATED
      } else {
        return "bg-gray-300 w-10"; // RESULT TO UPDATE
      }
    }
  }

  // CLASSNAME INPUT FUNCTION
  function handleClassnameInput(item: FixturesProps) {
    const classNameInput = `h-10 rounded text-center ${textColor} outline-none ${complementClassNameFunction(item)}`;
    return classNameInput;
  }

  // MODAL STATES AND FUNCTIONS
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTeamName("");
  };

  function handleClickTeam(namePicked: string) {
    setTeamName(namePicked);
    handleOpen();
  }

  return (
    <Modal
      open={openUserModal}
      onClose={() => {
        handleCloseUserModal();
      }}
      className="flex flex-col w-screen justify-center items-center"
    >
      <>
        <TeamResultsModal
          open={open}
          teamName={teamName}
          textColor={textColor}
          chooseBorderBgCardColor={chooseBorderBgCardColor}
          chooseLoadingColor={chooseLoadingColor}
          chooseTextCardColor={chooseTextCardColor}
          getCountryFlag={getCountryFlag}
          handleClose={handleClose}
        />
        <div className="z-40 fixed top-0 flex w-full max-w-md flex-col items-center justify-center bg-white px-6">
          {/* SUBHEADER */}
          <div className="mt-6 flex w-full flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <img
                src={
                  userData?.photo === null
                    ? "https://cdn-icons-png.flaticon.com/512/4389/4389644.png"
                    : userData?.photo
                }
                className={`h-10 w-10 rounded-full border-2 border-gray-100`}
              />
              <div className="flex flex-col items-center">
                <p
                  className={`${textColor} w-full text-left text-base font-bold leading-relaxed`}
                >
                  {userData?.name}
                </p>
                <p
                  className={`${textColor} w-full text-left text-xs font-normal leading-relaxed`}
                >
                  Palpites em {competition!.name} {competition!.season}
                </p>
              </div>
            </div>
            <div
              onClick={() => {
                handleCloseUserModal();
              }}
              className={`cursor-pointer flex border p-2 rounded-xl ${chooseBorderBgCardColor(
                "String qualquer",
                "para pegar BG da competiçao"
              )}`}
            >
              <p
                className={`text-right text-base font-bold uppercase ${textColor}`}
              >
                Voltar
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex w-full flex-col gap-3 pb-3">
            <SelectFixtures
              listToShow={"guesses"}
              rounds={allRounds}
              roundSelected={roundSelected}
              setRoundSelected={setRoundSelected}
            />
          </div>
        </div>
        <div className="flex flex-col w-full h-full max-w-md items-center justify-center bg-white">
          {/* FIXTURES / RANKING LIST */}
          {loading ? (
            <div className="-mt-20 flex h-screen w-full items-center justify-center">
              <RingLoader
                color={chooseLoadingColor(competition!.name)}
                size={150}
              />
            </div>
          ) : // FIXTURES LIST (GUESSES AND RESULTS)
          fixturesToShow.length === 0 ? (
            <div className="mt-52 flex w-full flex-1 items-center justify-center px-4">
              <p className={`${textColor} text-center`}>
                Nenhum {isMyGuesses ? "palpite" : "resultado"} disponível,
                selecione outra rodada ou aguarde atualizações de jogos
                disponíveis
              </p>
            </div>
          ) : (
            <div className="mt-8 flex w-full h-full flex-col p-6 pt-32 overflow-scroll">
              {fixturesToShow
                .sort((a, b) => {
                  if (a.DateUtc === b.DateUtc) {
                    return a.MatchNumber - b.MatchNumber;
                  } else {
                    return (
                      Number(new Date(a.DateUtc)) - Number(new Date(b.DateUtc))
                    );
                  }
                })
                .map((item) => (
                  <>
                    {/* FORM */}
                    <form
                      className={`mb-3 flex w-full flex-col items-center justify-center rounded-md border-b-2 ${chooseBorderBgCardColor(
                        item.HomeTeam,
                        item.AwayTeam
                      )}`}
                      key={uuidV4()}
                    >
                      {/* FIXTURE DETAILS: TEAMS AND DATE */}
                      <div className="my-4 flex w-full flex-col">
                        <p
                          className={`w-full text-center text-sm font-bold ${chooseTextCardColor(
                            item.HomeTeam,
                            item.AwayTeam
                          )}`}
                        >
                          <span
                            className="cursor-pointer"
                            onClick={() => handleClickTeam(item.HomeTeam)}
                          >
                            {item.HomeTeam}
                          </span>{" "}
                          vs{" "}
                          <span
                            className="cursor-pointer"
                            onClick={() => handleClickTeam(item.AwayTeam)}
                          >
                            {item.AwayTeam}
                          </span>
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
                      <div className="flex flex-row items-center justify-end mb-4">
                        {/* HOME TEAM BADGE */}
                        <div
                          className="flex flex-row items-center mr-2 cursor-pointer"
                          onClick={() => handleClickTeam(item.HomeTeam)}
                        >
                          {competition!.name === "Nations League"
                            ? getCountryFlag(item.HomeTeam)
                            : handleClubBadge(item.HomeTeam)}
                        </div>
                        {/* HIDDEN INPUT MATCH NUMBER */}
                        <input
                          type="number"
                          defaultValue={item.MatchNumber}
                          hidden
                          name="MatchNumber"
                        />
                        {/* HIDDEN INPUT ROUND NUMBER */}
                        <input
                          type="number"
                          defaultValue={item.RoundNumber}
                          hidden
                          name="RoundNumber"
                        />
                        {/* HIDDEN INPUT POINTS */}
                        <input
                          type="string"
                          defaultValue={"0"}
                          hidden
                          name="points"
                        />
                        {/* HOME TEAM SCORE INPUT */}
                        <input
                          type="number"
                          name="HomeTeamScore"
                          pattern="^[+ 0-9]{5}$"
                          maxLength={2}
                          defaultValue={handleScoreGuess({
                            matchNumber: item.MatchNumber,
                            teamLocation: "home",
                          })}
                          readOnly={true}
                          className={handleClassnameInput(item)}
                        />
                        {/* TEAM SEPARATOR: '-' or 'vs' */}
                        <p
                          className={`px-1 text-center ${textColor} ${!isMyGuesses && "font-semibold"}`}
                        >
                          {
                            isMyGuesses
                              ? getUserMatchPoints(item)
                                  .messageIfGuessIsNull ===
                                "Palpite não enviado"
                                ? new Date(item.DateUtc) < new Date()
                                  ? "vs" // IF GAME WAS STARTED
                                  : "-" // IF GAME WASN'T START YET
                                : "-" // IF GUESS WAS SEND
                              : "-" // IF IS ON A RESULTS SCREEN
                          }
                        </p>
                        {/* AWAY TEAM SCORE INPUT */}
                        <input
                          type="number"
                          name="AwayTeamScore"
                          pattern="^[+ 0-9]{5}$"
                          maxLength={2}
                          defaultValue={handleScoreGuess({
                            matchNumber: item.MatchNumber,
                            teamLocation: "away",
                          })}
                          readOnly={true}
                          className={handleClassnameInput(item)}
                        />
                        {/* AWAY TEAM BADGE */}
                        <div
                          className="flex flex-row items-center ml-2 cursor-pointer"
                          onClick={() => handleClickTeam(item.AwayTeam)}
                        >
                          {competition!.name === "Nations League"
                            ? getCountryFlag(item.AwayTeam)
                            : handleClubBadge(item.AwayTeam)}
                        </div>
                      </div>
                    </form>
                  </>
                ))}
            </div>
          )}
        </div>
      </>
    </Modal>
  );
}
