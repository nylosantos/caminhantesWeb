/* eslint-disable react-hooks/exhaustive-deps */
import { Container } from "../components/Container";
import { Separator } from "../components/Separator";
import { Participants } from "../components/Participants";
import { PoolMenu } from "../components/PoolMenu";
import { /*memo, */ useContext, useEffect, useRef, useState } from "react";
import { SelectFixtures } from "../components/SelectFixtures";
import { FixturesProps, GlobalDataContextType, GuessesProps } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { v4 as uuidV4 } from "uuid";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { RingLoader } from "react-spinners";
import { PageProps } from "../LandingPage";
import { getCode } from "country-list";
import Flag from "react-world-flags";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { z } from "zod";
import TeamResultsModal from "../components/TeamResultsModal";
import AnotherUserGuessesModal from "../components/AnotherUserGuessesModal";
import Standings from "../components/Standings";
// import Standings from "../components/Standings";

export interface ParticipantsWithPoints {
  participant: Doc<"users">;
  totalPoints: number;
}

export default function PoolPage({ userData }: PageProps) {
  // GET GLOBAL DATA
  const {
    allLeagues,
    convex,
    competition,
    dbUsersData,
    isMyGuesses,
    listToShow,
    loading,
    userAllGuesses,
    handleClubBadge,
    onFooterCustomize,
    onHeaderCustomize,
    setLoading,
    toggleGuessesResultsRanking,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

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

  // GET LEAGUE PARTICIPANTS FUNCTION (FOR SHOW THE POINTS)
  async function getLeagueAndParticipantsData() {
    const leagueParticipants: ParticipantsWithPoints[] = [];
    if (competition) {
      for (let index = 0; index < competition.participants.length; index++) {
        if (competition.participants[index]) {
          const participantId = competition.participants[index];
          if (participantId && dbUsersData) {
            const participant = dbUsersData.find(
              (dbUserData) => dbUserData._id === participantId
            );
            if (participant) {
              const userLeagueGuesses = participant.leagues.find(
                (userLeague) => userLeague.id === competition._id
              );
              if (userLeagueGuesses) {
                leagueParticipants.push({
                  participant: participant,
                  totalPoints: userLeagueGuesses.totalPoints,
                });
              }
            }
          }
        }
      }

      setParticipantsData(leagueParticipants);
    }
  }

  // SET LOADING TO WAIT COMPETITION AND USERDATA
  useEffect(() => {
    if (competition && userData) {
      getLeagueAndParticipantsData();
      setLoading(false);
    } else setLoading(true);
  }, [competition, dbUsersData,userData]);

  const [participantsData, setParticipantsData] =
    useState<ParticipantsWithPoints[]>();

  const [isSubmitting, setisSubmitting] = useState(false);

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize(`Meus Bolões`, true, true);
    onFooterCustomize(false, true);
  }, []);

  const fixtureBeingUpdated = useRef(0);

  const ConfirmationAlert = withReactContent(Swal);

  useEffect(() => {
    toggleGuessesResultsRanking("guesses");
  }, []);

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
    if (name === "WSL") {
      return "bg-[#1e1034]";
    }
    if (
      name !== "Premier League" &&
      name !== "Champions League" &&
      name !== "FA Cup" &&
      name !== "Carabao Cup" &&
      name !== "WSL"
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

  // FORM VALIDATOR
  const fixtureSchema = z.object({
    HomeTeamScore: z.string().min(1),
    AwayTeamScore: z.string().min(1),
    MatchNumber: z.string(),
    RoundNumber: z.string(),
    points: z.literal("0"),
  });

  interface GuessToDatabase {
    leagueId: Id<"leagues">;
    guess: GuessesProps;
  }

  // CHECK IF GUESS WAS SENDED
  function handleGuessSended(item: FixturesProps) {
    if (userAllGuesses && competition) {
      const competitionUserFoundedGuesses = userAllGuesses.find(
        (competitionAllGuesses) => competitionAllGuesses.id === competition._id
      );

      if (competitionUserFoundedGuesses) {
        const foundedMatchGuess = competitionUserFoundedGuesses.guesses.find(
          (matchGuess) => matchGuess.MatchNumber === item.MatchNumber
        );

        if (foundedMatchGuess) {
          if (
            foundedMatchGuess.HomeTeamScore !== null ||
            foundedMatchGuess.AwayTeamScore !== null
          ) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  // CHECK IF RESULTS WAS SENDED
  // function handleResultsSended(item: FixturesProps) {
  //   if (allLeagues && competition) {
  //     const competitionFoundedResults = allLeagues.find(
  //       (competitionAllResults) => competitionAllResults._id === competition._id
  //     );
  //     if (competitionFoundedResults) {
  //       const foundedMatchResults = competitionFoundedResults.games.find(
  //         (matchResults) => matchResults.MatchNumber === item.MatchNumber
  //       );

  //       if (foundedMatchResults) {
  //         console.log(foundedMatchResults);
  //         if (
  //           foundedMatchResults.HomeTeamScore !== null ||
  //           foundedMatchResults.AwayTeamScore !== null
  //         ) {
  //           return false;
  //         } else {
  //           return true;
  //         }
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       return true;
  //     }
  //   } else {
  //     return true;
  //   }
  // }

  interface ScoreGuessFunctionProps {
    matchNumber: number;
    teamLocation: "home" | "away";
  }

  // CHECK AND FILL INPUT FUNCTION
  function handleScoreGuess({
    matchNumber,
    teamLocation,
  }: ScoreGuessFunctionProps) {
    if (listToShow === "guesses") {
      if (userAllGuesses && competition) {
        const competitionUserFoundedGuesses = userAllGuesses.find(
          (competitionAllGuesses) =>
            competitionAllGuesses.id === competition._id
        );

        if (competitionUserFoundedGuesses) {
          const foundedMatchGuess = competitionUserFoundedGuesses.guesses.find(
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
      } else {
        return "9";
      }
    } else if (listToShow === "results") {
      if (allLeagues && competition) {
        const competitionFoundedResults = allLeagues.find(
          (competitionAllResults) =>
            competitionAllResults._id === competition._id
        );
        if (competitionFoundedResults) {
          const foundedMatchResults = competitionFoundedResults.games.find(
            (gameResults) => gameResults.MatchNumber === matchNumber
          );

          if (foundedMatchResults) {
            if (teamLocation === "home") {
              return foundedMatchResults.HomeTeamScore?.toString();
            } else {
              return foundedMatchResults.AwayTeamScore?.toString();
            }
          } else {
            return "9";
          }
        } else {
          return "9";
        }
      }
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
        return "bg-transparent hidden"; // RESULT TO UPDATE
      }
    }
  }

  // CLASSNAME INPUT FUNCTION
  function handleClassnameInput(item: FixturesProps) {
    const classNameInput = `h-10 rounded text-center ${textColor} outline-none ${complementClassNameFunction(item)}`;
    return classNameInput;
  }

  // MODAL TABLE RESULTS STATES AND FUNCTIONS
  const [openUserModal, setOpenUserModal] = useState(false);
  const [userId, setUserId] = useState("");
  const handleOpenUserModal = (id: string) => {
    setUserId(id);
    setOpenUserModal(true);
  };
  const handleCloseUserModal = () => {
    setOpenUserModal(false);
    setUserId("");
  };

  // MODAL TABLE RESULTS STATES AND FUNCTIONS
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

  // MODAL TABLE STANDINGS STATES AND FUNCTIONS
  const [openTable, setOpenTable] = useState(false);
  const [competitionName, setCompetitionName] = useState("");
  const handleOpenTable = () => setOpenTable(true);
  const handleCloseTable = () => {
    setOpenTable(false);
    setCompetitionName("");
  };

  function handleClickCompetition(competitionNamePicked: string) {
    if (
      competition!.name === "Premier League" ||
      competition!.name === "Champions League" ||
      competition!.name === "WSL"
    ) {
      setCompetitionName(competitionNamePicked);
      handleOpenTable();
    }
  }

  return (
    <Container>
      <AnotherUserGuessesModal
        openUserModal={openUserModal}
        handleCloseUserModal={handleCloseUserModal}
        userId={userId}
      />
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
      <Standings
        competitionName={competitionName}
        handleCloseTableModal={handleCloseTable}
        leagueId={
          competition!.name === "Premier League"
            ? 47
            : competition!.name === "Champions League"
              ? 42
              : 9227
        }
        openTableModal={openTable}
      />
      <>
        <div className="z-40 fixed top-16 flex w-full max-w-md flex-col items-center justify-center bg-white px-6">
          {/* SUBHEADER */}
          <div className="mt-6 flex w-full flex-row items-center justify-between">
            <div
              className={`flex flex-row items-center gap-3 ${(competition!.name === "Premier League" || competition!.name === "Champions League") && "cursor-pointer"}`}
              onClick={() => handleClickCompetition(competition!.name)}
            >
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
            <SelectFixtures
              listToShow={listToShow}
              rounds={allRounds}
              roundSelected={roundSelected}
              setRoundSelected={setRoundSelected}
            />
          </div>
        </div>
        {/* FIXTURES / RANKING LIST */}
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
                      className={`mb-3 cursor-pointer flex w-full flex-row items-center justify-between rounded-md border-b-2 ${chooseBorderCardColor(competition!.name)} bg-gray-200/50 p-4`}
                      key={uuidV4()}
                      onClick={() =>
                        handleOpenUserModal(participant.participant._id)
                      }
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
              Nenhum {isMyGuesses ? "palpite" : "resultado"} disponível,
              selecione outra rodada ou aguarde atualizações de jogos
              disponíveis
            </p>
          </div>
        ) : (
          <div className="mt-48 flex w-full flex-col">
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
                    onSubmit={(e) => {
                      e.preventDefault();
                      fixtureBeingUpdated.current = item.MatchNumber;
                      const formData = new FormData(e.currentTarget);
                      const formValues = Object.fromEntries(formData);
                      const fixtureValues = fixtureSchema.safeParse(formValues);

                      if (!fixtureValues.success) {
                        if (listToShow === "guesses") {
                          return toast.error(
                            `Palpite inválido, verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                          );
                        } else {
                          return toast.error(
                            `Resultado inválido, verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                          );
                        }
                      } else {
                        if (listToShow === "guesses") {
                          const guessToUpdate: GuessToDatabase = {
                            leagueId: competition!._id,
                            guess: {
                              AwayTeamScore: Number(
                                fixtureValues.data.AwayTeamScore
                              ),
                              HomeTeamScore: Number(
                                fixtureValues.data.HomeTeamScore
                              ),
                              MatchNumber: Number(
                                fixtureValues.data.MatchNumber
                              ),
                              RoundNumber: Number(
                                fixtureValues.data.RoundNumber
                              ),
                              points: Number(fixtureValues.data.points),
                            },
                          };

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
                                isNaN(
                                  Number(fixtureValues.data.HomeTeamScore)
                                ) === true ||
                                isNaN(
                                  Number(fixtureValues.data.AwayTeamScore)
                                ) === true
                              ) {
                                return toast.error(
                                  `Palpite inválido, verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                                );
                              } else {
                                if (
                                  Number(fixtureValues.data.HomeTeamScore) <
                                    0 ||
                                  Number(fixtureValues.data.AwayTeamScore) < 0
                                ) {
                                  if (
                                    Number(fixtureValues.data.HomeTeamScore) < 0
                                  ) {
                                    return toast.error(
                                      `Eu sei que você detesta o ${item.HomeTeam}, mas palpite negativo já é demais né? 😂 Verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                                    );
                                  } else {
                                    return toast.error(
                                      `Eu sei que você detesta o ${item.AwayTeam}, mas palpite negativo já é demais né? 😂 Verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                                    );
                                  }
                                } else {
                                  setisSubmitting(true);
                                  convex
                                    .mutation(api.functions.updateOneGuess, {
                                      userId: userData!._id,
                                      guess: guessToUpdate,
                                    })
                                    .then(() => {
                                      setisSubmitting(false);
                                      toast.success(
                                        "Palpite enviado! Agora é torcer! 👌"
                                      );
                                    });
                                }
                              }
                            } else {
                              return toast.warning(
                                "Parabéns por pensar um pouco mais... Afinal, que palpite era aquele? 😂😂😂 #brinks"
                              );
                            }
                          });
                        } else {
                          const resultToUpdate: FixturesProps = {
                            AwayTeam: item.AwayTeam,
                            DateUtc: item.DateUtc,
                            Group: item.Group,
                            HomeTeam: item.HomeTeam,
                            Location: item.Location,
                            AwayTeamScore: Number(
                              fixtureValues.data.AwayTeamScore
                            ),
                            HomeTeamScore: Number(
                              fixtureValues.data.HomeTeamScore
                            ),
                            MatchNumber: Number(fixtureValues.data.MatchNumber),
                            RoundNumber: Number(fixtureValues.data.RoundNumber),
                          };

                          ConfirmationAlert.fire({
                            title: "Você tem certeza?",
                            text: "Confira o resultado pois pra mudar depois será uma bagunça, e diretamente no banco de dados!",
                            icon: "warning",
                            showCancelButton: true,
                            cancelButtonColor: "#d33",
                            confirmButtonColor: "#0d9488",
                            confirmButtonText: "Sim, confirmar!",
                          }).then(async (result) => {
                            if (result.isConfirmed) {
                              if (
                                isNaN(
                                  Number(fixtureValues.data.HomeTeamScore)
                                ) === true ||
                                isNaN(
                                  Number(fixtureValues.data.AwayTeamScore)
                                ) === true
                              ) {
                                return toast.error(
                                  `Resultado inválido, verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                                );
                              } else {
                                if (
                                  Number(fixtureValues.data.HomeTeamScore) <
                                    0 ||
                                  Number(fixtureValues.data.AwayTeamScore) < 0
                                ) {
                                  if (
                                    Number(fixtureValues.data.HomeTeamScore) < 0
                                  ) {
                                    return toast.error(
                                      `Eu sei que você detesta o ${item.HomeTeam}, mas resultado negativo já é demais né? 😂 Verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                                    );
                                  } else {
                                    return toast.error(
                                      `Eu sei que você detesta o ${item.AwayTeam}, mas resultado negativo já é demais né? 😂 Verifique o jogo ${item.HomeTeam} vs ${item.AwayTeam}`
                                    );
                                  }
                                } else {
                                  setisSubmitting(true);
                                  convex
                                    .mutation(api.functions.updateOneFixture, {
                                      leagueId: competition!._id,
                                      fixture: resultToUpdate,
                                    })
                                    .then(() => {
                                      setisSubmitting(false);
                                      toast.success("Resultado atualizado! 👌");
                                    });
                                }
                              }
                            } else {
                              return toast.warning(
                                "Parabéns por pensar um pouco mais... Afinal, que quem nunca leu errado e vacilou atualizando o banco de dados? 😂😂😂 #brinks"
                              );
                            }
                          });
                        }
                      }
                    }}
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
                        readOnly={
                          handleScoreGuess({
                            matchNumber: item.MatchNumber,
                            teamLocation: "home",
                          })
                            ? true
                            : false
                        }
                        className={handleClassnameInput(item)}
                      />
                      {/* TEAM SEPARATOR: '-' or 'vs' */}
                      <p
                        className={`px-1 text-center ${textColor} ${!isMyGuesses && "font-semibold"}`}
                      >
                        {isMyGuesses
                          ? getUserMatchPoints(item).messageIfGuessIsNull ===
                            "Palpite não enviado"
                            ? new Date(item.DateUtc) < new Date()
                              ? "vs" // IF GAME WAS STARTED
                              : "-" // IF GAME WASN'T START YET
                            : "-" // IF GUESS WAS SEND
                          : handleScoreGuess({
                                matchNumber: item.MatchNumber,
                                teamLocation: "away",
                              }) &&
                              handleScoreGuess({
                                matchNumber: item.MatchNumber,
                                teamLocation: "home",
                              })
                            ? "-"
                            : "vs"}
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
                        readOnly={
                          handleScoreGuess({
                            matchNumber: item.MatchNumber,
                            teamLocation: "away",
                          })
                            ? true
                            : false
                        }
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
                    {/* ACTION BUTTON (SEND GUESS / UPDATE RESULTS / SHOW POINTS-MESSAGE) */}
                    {listToShow === "guesses" && (
                      <div className="mb-4 flex w-full flex-col items-center justify-center px-4">
                        {new Date(item.DateUtc) > new Date() ? (
                          handleGuessSended(item) ? (
                            <button
                              className={`flex w-full items-center justify-center gap-2 rounded ${
                                isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "bg-yellow-700"
                                  : "bg-red-600"
                              } px-2 py-1 outline-none`}
                              disabled={isSubmitting}
                            >
                              <p className="text-xs font-semibold uppercase text-gray-100">
                                {isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "Enviando palpite..."
                                  : "Enviar Palpite ?"}
                              </p>
                            </button>
                          ) : (
                            <div
                              className={`flex w-full items-center justify-center gap-2 rounded ${
                                isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "bg-yellow-700"
                                  : "bg-green-600"
                              } px-2 py-1 outline-none`}
                            >
                              <p className="text-xs font-semibold uppercase text-gray-100">
                                {isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "Enviando palpite..."
                                  : "Palpite Enviado"}
                              </p>
                              <FaCheck className="text-gray-100" size={10} />
                            </div>
                          )
                        ) : getUserMatchPoints(item).messageIfGuessIsNull ===
                          "Palpite não enviado" ? (
                          <div
                            className={`flex w-full items-center justify-center gap-2 rounded ${
                              isSubmitting &&
                              fixtureBeingUpdated.current === item.MatchNumber
                                ? "bg-yellow-700"
                                : "bg-gray-400/70"
                            } px-2 py-1 outline-none`}
                          >
                            <p className="text-xs font-semibold uppercase text-gray-100">
                              Partida iniciada, não é possível palpitar
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`flex w-full items-center justify-center gap-2 rounded ${
                              isSubmitting &&
                              fixtureBeingUpdated.current === item.MatchNumber
                                ? "bg-yellow-700"
                                : "bg-teal-600"
                            } px-2 py-1 outline-none`}
                          >
                            <p className="text-center text-xs font-semibold uppercase text-gray-100">
                              {getUserMatchPoints(item).messageIfGuessIsNull ===
                              ""
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
                    )}
                    {/* {listToShow === "guesses" ? (
                      <div className="mb-4 flex w-full flex-col items-center justify-center px-4">
                        {new Date(item.DateUtc) > new Date() ? (
                          handleGuessSended(item) ? (
                            <button
                              className={`flex w-full items-center justify-center gap-2 rounded ${
                                isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "bg-yellow-700"
                                  : "bg-red-600"
                              } px-2 py-1 outline-none`}
                              disabled={isSubmitting}
                            >
                              <p className="text-xs font-semibold uppercase text-gray-100">
                                {isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "Enviando palpite..."
                                  : "Enviar Palpite ?"}
                              </p>
                            </button>
                          ) : (
                            <div
                              className={`flex w-full items-center justify-center gap-2 rounded ${
                                isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "bg-yellow-700"
                                  : "bg-green-600"
                              } px-2 py-1 outline-none`}
                            >
                              <p className="text-xs font-semibold uppercase text-gray-100">
                                {isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "Enviando palpite..."
                                  : "Palpite Enviado"}
                              </p>
                              <FaCheck className="text-gray-100" size={10} />
                            </div>
                          )
                        ) : getUserMatchPoints(item).messageIfGuessIsNull ===
                          "Palpite não enviado" ? (
                          <div
                            className={`flex w-full items-center justify-center gap-2 rounded ${
                              isSubmitting &&
                              fixtureBeingUpdated.current === item.MatchNumber
                                ? "bg-yellow-700"
                                : "bg-gray-400/70"
                            } px-2 py-1 outline-none`}
                          >
                            <p className="text-xs font-semibold uppercase text-gray-100">
                              Partida iniciada, não é possível palpitar
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`flex w-full items-center justify-center gap-2 rounded ${
                              isSubmitting &&
                              fixtureBeingUpdated.current === item.MatchNumber
                                ? "bg-yellow-700"
                                : "bg-teal-600"
                            } px-2 py-1 outline-none`}
                          >
                            <p className="text-center text-xs font-semibold uppercase text-gray-100">
                              {getUserMatchPoints(item).messageIfGuessIsNull ===
                              ""
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
                    ) : (
                      userData?.role === "admin" && (
                        <div className="mb-4 flex w-full flex-col items-center justify-center px-4">
                          {handleResultsSended(item) ? (
                            <button
                              className={`flex w-full items-center justify-center gap-2 rounded ${
                                isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "bg-yellow-700"
                                  : "bg-red-600"
                              } px-2 py-1 outline-none`}
                              disabled={isSubmitting}
                            >
                              <p className="text-xs font-semibold uppercase text-gray-100">
                                {isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "Enviando resultado..."
                                  : "Atualizar Resultado ?"}
                              </p>
                            </button>
                          ) : (
                            <div
                              className={`flex w-full items-center justify-center gap-2 rounded ${
                                isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "bg-yellow-700"
                                  : "bg-green-600"
                              } px-2 py-1 outline-none`}
                            >
                              <p className="text-xs font-semibold uppercase text-gray-100">
                                {isSubmitting &&
                                fixtureBeingUpdated.current === item.MatchNumber
                                  ? "Enviando resultado..."
                                  : "Resultado Atualizado"}
                              </p>
                              <FaCheck className="text-gray-100" size={10} />
                            </div>
                          )}
                        </div>
                      )
                    )} */}
                  </form>
                </>
              ))}
          </div>
        )}
      </>
    </Container>
  );
}
