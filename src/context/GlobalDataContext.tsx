/* eslint-disable no-constant-binary-expression */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useRef, useState } from "react";

import { signOut, User } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore } from "firebase/firestore";

import { app, auth, initFirebase } from "../utils/firebase";
import {
  CreateLeagueProps,
  FixturesProps,
  GlobalDataContextType,
  GuessesProps,
  SetPageProps,
} from "../@types";
import { toast } from "sonner";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export const GlobalDataContext = createContext<GlobalDataContextType | null>(
  null
);

interface PostsContextProviderProps {
  children: JSX.Element | JSX.Element[];
}

// INITIALIZING FIRESTORE DB
const db = getFirestore(app);

export const GlobalDataProvider = ({ children }: PostsContextProviderProps) => {
  // INITIALIZING FIREBASE AND FIREBASE ADMIN
  initFirebase();

  // CONVEX HOOK TO USE QUERY INSIDE FUNCTION
  const convex = useConvex();

  // USER AUTH STATE
  const [user] = useAuthState(auth);

  // LOGIN/REGISTER STATE
  const [login, setLogin] = useState(true);

  // USER LOGGED STATE
  const [logged, setLogged] = useState(false);

  // OPEN MODAL INFO STATE
  const [openModal, setOpenModal] = useState(false);

  // LOADING STATE
  const [loading, setLoading] = useState(true);

  // PAGE STATE
  const [page, setPage] = useState<SetPageProps>({
    prev:
      "home" ||
      "settings" ||
      "poolPage" ||
      "searchPool" ||
      "dashboard" ||
      "createLeague" ||
      "deleteLeague" ||
      "updateLeaguePoints",
    show:
      "home" ||
      "settings" ||
      "poolPage" ||
      "searchPool" ||
      "dashboard" ||
      "createLeague" ||
      "deleteLeague" ||
      "updateLeaguePoints",
  });

  // LOGGED USER DATA STATE
  const [userData, setUserData] = useState<Doc<"users">>();

  // LOGGED USER DATA LEAGUES/POOLS
  const [userPools, setUserPools] = useState<
    Doc<"leagues">[] | undefined | null
  >();

  // FILLED GUESSES STATE
  const [filledGuesses, setFilledGuesses] = useState(false);

  // HANDLE USERPOOLS FUNCTION
  async function handleUserPools() {
    if (userData) {
      await convex
        .query(api.functions.getUserPools, { leagues: userData.leagues })
        .then((userPoolsResponse) => {
          if (userPoolsResponse) {
            setUserPools(userPoolsResponse);
          }
        })
        .then(() => {
          setPage({ show: "home", prev: "home" });
          // console.log('cheguei aqui');
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      toast.error(
        "Não foi possível atualizar os dados, contate a administração. 🤯"
      );
    }
  }

  // HANDLE USER FUNCTION
  async function handleUser(user: User) {
    const userResponse = await convex.query(api.functions.findUser, {
      id: user.uid,
      type: "idString",
    });
    if (userResponse) {
      if (userResponse) {
        setUserData(userResponse);
        setLogged(true);
        setIsSubmitting(false);
        toast.success(`Bem-vindo, ${userResponse.name}! 👌`);
      }
      setLogin(false);
    } else {
      toast.error(
        "Não foi possível fazer o login, contate a administração. 🤯"
      );
    }
  }

  // HANDLE USER WITHOUT TOAST => TO USE WHEN USER REFRESH PAGE
  async function handleUserWhithoutToast(user: User) {
    const userResponse = await convex.query(api.functions.findUser, {
      id: user.uid,
      type: "idString",
    });
    if (userResponse) {
      if (userResponse) {
        setUserData(userResponse);
        setLogged(true);
        setIsSubmitting(false);
      }
      setLogin(false);
    } else {
      toast.error(
        "Não foi possível fazer o login, contate a administração. 🤯"
      );
    }
  }

  // MONITORING USER LOGIN
  useEffect(() => {
    setIsSubmitting(true);
    if (!user) {
      setLogged(false);
      setIsSubmitting(false);
    }

    if (user && !userData) {
      // setIsSubmitting(true);
      handleUserWhithoutToast(user);
    }

    if (user && userData) {
      setLogged(true);
      setIsSubmitting(false);
    }
  }, [user]);

  // MONITORING USER DATA
  useEffect(() => {
    if (userData && userData !== null) {
      handleUserPools()
        .then(() => {
          setLogged(true);
        })
        .catch((error) => {
          console.log("Esse é o erro: ", error);
          toast.error(
            "Não foi possível fazer o login, contate a administração. 🤯"
          );
          setLogged(false);
        });
    } else {
      setLogged(false);
    }
  }, [userData]);

  // LOGOUT FUNCTION
  function handleLogout() {
    setLogged(false);
    setPage({ show: "home", prev: "home" });
    signOut(auth);
    setLogin(true);
    toast.success("Já vai? Até mais, então... 👋");
  }

  // GLOBAL SUBMITING STATE
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SELECTED POOL (COMPETITION) STATE
  const [competition, setCompetition] = useState<Doc<"leagues"> | null>();

  const [headerTitle, setHeaderTitle] = useState("");
  const [headerLeftBackIcon, setHeaderLeftBackIcon] = useState(false);
  const [headerRightInfoIcon, setHeaderRightInfoIcon] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [showFooterMenu, setShowFooterMenu] = useState(false);

  // TEAM LOGO PATHS
  const teamsLogoPath = [
    // PL TEAMS
    {
      name: "Arsenal",
      url: "https://resources.premierleague.com/premierleague/badges/50/t3.png",
    },
    {
      name: "Aston Villa",
      url: "https://resources.premierleague.com/premierleague/badges/50/t7.png",
    },
    {
      name: "Bournemouth",
      url: "https://resources.premierleague.com/premierleague/badges/50/t91.png",
    },
    {
      name: "Brentford",
      url: "https://resources.premierleague.com/premierleague/badges/50/t94.png",
    },
    {
      name: "Brighton",
      url: "https://resources.premierleague.com/premierleague/badges/50/t36.png",
    },
    {
      name: "Chelsea",
      url: "https://resources.premierleague.com/premierleague/badges/50/t8.png",
    },
    {
      name: "Crystal Palace",
      url: "https://resources.premierleague.com/premierleague/badges/50/t31.png",
    },
    {
      name: "Everton",
      url: "https://resources.premierleague.com/premierleague/badges/50/t11.png",
    },
    {
      name: "Fulham",
      url: "https://resources.premierleague.com/premierleague/badges/50/t54.png",
    },
    {
      name: "Ipswich",
      url: "https://resources.premierleague.com/premierleague/badges/50/t40.png",
    },
    {
      name: "Leicester",
      url: "https://resources.premierleague.com/premierleague/badges/50/t13.png",
    },
    {
      name: "Liverpool",
      url: "https://resources.premierleague.com/premierleague/badges/50/t14.png",
    },
    {
      name: "Man City",
      url: "https://resources.premierleague.com/premierleague/badges/50/t43.png",
    },
    {
      name: "Man Utd",
      url: "https://resources.premierleague.com/premierleague/badges/50/t1.png",
    },
    {
      name: "Newcastle",
      url: "https://resources.premierleague.com/premierleague/badges/50/t4.png",
    },
    {
      name: "Nott'm Forest",
      url: "https://resources.premierleague.com/premierleague/badges/50/t17.png",
    },
    {
      name: "Southampton",
      url: "https://resources.premierleague.com/premierleague/badges/50/t20.png",
    },
    {
      name: "Spurs",
      url: "https://resources.premierleague.com/premierleague/badges/50/t6.png",
    },
    {
      name: "West Ham",
      url: "https://resources.premierleague.com/premierleague/badges/50/t21.png",
    },
    {
      name: "Wolves",
      url: "https://resources.premierleague.com/premierleague/badges/50/t39.png",
    },
    // UCL TEAMS
    {
      name: "Juventus",
      url: "https://crests.football-data.org/109.png",
    },
    {
      name: "PSV",
      url: "https://crests.football-data.org/674.png",
    },
    {
      name: "Young Boys",
      url: "https://crests.football-data.org/1871.png",
    },
    {
      name: "Bayern München",
      url: "https://crests.football-data.org/5.png",
    },
    {
      name: "GNK Dinamo",
      url: "https://crests.football-data.org/755.png",
    },
    {
      name: "Milan",
      url: "https://crests.football-data.org/98.png",
    },
    {
      name: "Real Madrid",
      url: "https://crests.football-data.org/86.png",
    },
    {
      name: "Stuttgart",
      url: "https://crests.football-data.org/10.png",
    },
    {
      name: "Sporting CP",
      url: "https://crests.football-data.org/498.png",
    },
    {
      name: "Lille",
      url: "https://crests.football-data.org/521.png",
    },
    {
      name: "Bologna",
      url: "https://crests.football-data.org/103.png",
    },
    {
      name: "Shakhtar",
      url: "https://crests.football-data.org/1887.png",
    },
    {
      name: "Sparta Praha",
      url: "https://crests.football-data.org/907.png",
    },
    {
      name: "Salzburg",
      url: "https://crests.football-data.org/1877.png",
    },
    {
      name: "Club Brugge",
      url: "https://crests.football-data.org/851.png",
    },
    {
      name: "B. Dortmund",
      url: "https://crests.football-data.org/4.png",
    },
    {
      name: "Celtic",
      url: "https://crests.football-data.org/732.png",
    },
    {
      name: "S. Bratislava",
      url: "https://crests.football-data.org/7509.png",
    },
    {
      name: "Inter",
      url: "https://crests.football-data.org/108.png",
    },
    {
      name: "Paris",
      url: "https://crests.football-data.org/524.png",
    },
    {
      name: "Girona",
      url: "https://crests.football-data.org/298.png",
    },
    {
      name: "Crvena Zvezda",
      url: "https://crests.football-data.org/7283.png",
    },
    {
      name: "Benfica",
      url: "https://crests.football-data.org/1903.png",
    },
    {
      name: "Feyenoord",
      url: "https://crests.football-data.org/675.png",
    },
    {
      name: "Leverkusen",
      url: "https://crests.football-data.org/3.png",
    },
    {
      name: "Atalanta",
      url: "https://crests.football-data.org/102.png",
    },
    {
      name: "Atleti",
      url: "https://crests.football-data.org/78.png",
    },
    {
      name: "Leipzig",
      url: "https://crests.football-data.org/721.png",
    },
    {
      name: "Monaco",
      url: "https://crests.football-data.org/548.png",
    },
    {
      name: "Barcelona",
      url: "https://crests.football-data.org/81.png",
    },
    {
      name: "Brest",
      url: "https://crests.football-data.org/512.png",
    },
    {
      name: "Sturm Graz",
      url: "https://crests.football-data.org/2021.png",
    },
    // CARABAO CUP TEAMS
    {
      name: "AFC Wimbledon",
      url: "data:image/png;base64,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",
    },
    {
      name: "Bolton Wanderers",
      url: "https://resources.premierleague.com/premierleague/badges/50/t30.png",
    },
    {
      name: "Blackpool",
      url: "https://resources.premierleague.com/premierleague/badges/50/t92.png",
    },
    {
      name: "Sheffield Wednesday",
      url: "https://crests.football-data.org/345.png",
    },
    {
      name: "Leyton Orient",
      url: "data:image/png;base64,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",
    },
    {
      name: "Barrow",
      url: "https://images.gc.barrowafcservices.co.uk/fit-in/170x170/b3ade3e0-1394-11ef-91a7-f99c56535cbc.png",
    },
    {
      name: "Coventry City",
      url: "https://crests.football-data.org/1076.png",
    },
    {
      name: "Watford",
      url: "https://crests.football-data.org/346.png",
    },
    {
      name: "Barnsley",
      url: "https://resources.premierleague.com/premierleague/badges/50/t37.png",
    },
    {
      name: "Preston North End",
      url: "https://crests.football-data.org/1081.png",
    },
    {
      name: "Queens Park Rangers",
      url: "https://crests.football-data.org/69.png",
    },
    {
      name: "Stoke City",
      url: "https://crests.football-data.org/70.png",
    },
    {
      name: "Fleetwood Town",
      url: "data:image/png;base64,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",
    },
    {
      name: "Walsall",
      url: "data:image/png;base64,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",
    },
    {
      name: "Wycombe Wanderers",
      url: "data:image/png;base64,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",
    },
  ];

  // CREATE LEAGUE FUNCTION
  const createLeague = async (leagueInfo: CreateLeagueProps) => {
    await convex
      .mutation(api.functions.createLeague, leagueInfo)
      .then(() => {
        toast.success(`${leagueInfo.name} adicionada com sucesso! 👌`);
        console.log(`${leagueInfo.name} adicionada com sucesso!`);
      })
      .catch((error) => {
        toast.error("Ocorreu um erro... 🤯");
        console.log("ESSE É O ERRO", error);
      });
  };

  // DELETE LEAGUE FUNCTION
  const deleteLeague = async (leagueId: Id<"leagues">) => {
    await convex
      .mutation(api.functions.deleteLeague, { id: leagueId })
      .then(() => {
        toast.success("Liga deletada com sucesso! 👌");
        console.log(`Liga deletada com sucesso!`);
      })
      .catch((error) => {
        toast.error("Ocorreu um erro... 🤯");
        console.log("ESSE É O ERRO", error);
      });
  };

  // HEADER CUSTOMIZE
  function onHeaderCustomize(
    title: string,
    leftBackIcon: boolean,
    rightInfoIcon: boolean
  ) {
    if (leftBackIcon) {
      setHeaderLeftBackIcon(true);
    } else {
      setHeaderLeftBackIcon(false);
    }
    if (rightInfoIcon) {
      setHeaderRightInfoIcon(true);
    } else {
      setHeaderRightInfoIcon(false);
    }
    setHeaderTitle(title);
  }

  // FOOTER CUSTOMIZE
  function onFooterCustomize(copyright: boolean, menu: boolean) {
    if (copyright) {
      setShowCopyright(true);
    } else {
      setShowCopyright(false);
    }
    if (menu) {
      setShowFooterMenu(true);
    } else {
      setShowFooterMenu(false);
    }
  }

  // ------------------------------- POOL PAGE STATES AND FUNCTIONS --------------------------- //

  const [roundSelected, setRoundSelected] = useState<number | undefined>();
  const [allRounds, setAllRounds] = useState<number[]>([]);
  const [fixturesToShow, setFixturesToShow] = useState<FixturesProps[]>([]);
  const [listToShow, setListToShow] = useState<
    "guesses" | "results" | "ranking"
  >("guesses");
  const [isMyGuesses, setIsMyGuesses] = useState(true);

  const inputGuesses = useRef<GuessesProps[]>([]);
  const emptyInputGuesses = useRef(0);

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
            if (index === 0) {
              if (new Date(selectedFixtures[index].DateUtc) > new Date()) {
                setRoundSelected(selectedFixtures[index].RoundNumber);
              }
            } else {
              if (new Date(selectedFixtures[index].DateUtc) < new Date()) {
                setRoundSelected(selectedFixtures[index].RoundNumber);
              }
            }
          }
        }
        setAllRounds(roundsArray);
        setLoading(false);
      }
    }
  }, [userData, competition]);

  // HANDLE FIXTURES BY ROUND FUNCTION
  async function updateFixturesToShow() {
    const fixturesArray: FixturesProps[] = [];
    const guessesArray: GuessesProps[] = [];
    if (listToShow !== "ranking") {
      if (competition && userData) {
        setLoading(true);
        const userGuessesFixtures = await convex.query(
          api.functions.getUserPoolGuesses,
          {
            userId: userData._id,
            leagueId: competition._id,
          }
        );
        const selectedFixtures = competition.games;
        if (selectedFixtures !== null && userGuessesFixtures !== null) {
          const userGuessesFixturesOrdered = userGuessesFixtures.sort(
            (a, b) => a.MatchNumber - b.MatchNumber
          );
          userGuessesFixturesOrdered.map((fixture, index) => {
            if (
              selectedFixtures[index] &&
              selectedFixtures[index].RoundNumber === roundSelected
            ) {
              fixturesArray.push(selectedFixtures[index]);
              guessesArray.push({
                MatchNumber: selectedFixtures[index].MatchNumber,
                HomeTeamScore: fixture.HomeTeamScore,
                AwayTeamScore: fixture.AwayTeamScore,
                RoundNumber: selectedFixtures[index].RoundNumber,
                points: 0,
              });
            }
          });
          const orderedFixturesArray = fixturesArray.sort(function (a, b) {
            return Number(new Date(a.DateUtc) < new Date(b.DateUtc));
          });
          setFixturesToShow(orderedFixturesArray);
          setLoading(false);
          inputGuesses.current = guessesArray;
        }
      }
    } else {
      setFixturesToShow([]);
    }
  }

  // MONITORING SELECTED ROUND
  useEffect(() => {
    updateFixturesToShow();
  }, [roundSelected, competition]);

  // TOGGLE MENU GUESSES - RESULTS - RANKING
  function toggleGuessesResultsRanking(
    option: "guesses" | "results" | "ranking"
  ) {
    if (option === "guesses") {
      setListToShow("guesses");
      setIsMyGuesses(true);
    } else if (option === "results") {
      setListToShow("results");
      setIsMyGuesses(false);
    } else if (option === "ranking") {
      setListToShow("ranking");
      setIsMyGuesses(false);
    }
  }

  // HANDLE CLUB BADGES FUNCTION
  function handleClubBadge(clubName: string) {
    const teamName = teamsLogoPath.find(({ name }) => name === clubName);
    return <img src={teamName?.url} className="h-10 w-10 object-contain" />;
  }

  // UPDATE GUESSES STATE FUNCTION
  function updateStateGuesses(
    matchNumber: number,
    teamLocation: "home" | "away",
    score: string
  ) {
    inputGuesses.current = inputGuesses.current.map((guess) => {
      if (guess.MatchNumber === matchNumber) {
        if (teamLocation === "home") {
          if (score === null || score === "") {
            return { ...guess, HomeTeamScore: null };
          } else {
            return { ...guess, HomeTeamScore: Number(score) };
          }
        } else {
          if (score === null || score === "") {
            return { ...guess, AwayTeamScore: null };
          } else {
            return { ...guess, AwayTeamScore: Number(score) };
          }
        }
      } else {
        return guess;
      }
    });
  }

  // VALUE INPUT SCORE FUNCTION
  function handleValueInputScore(
    item: FixturesProps,
    teamLocation: "home" | "away"
  ) {
    if (!isMyGuesses) {
      if (item.HomeTeamScore !== null && item.AwayTeamScore !== null) {
        if (teamLocation === "home") {
          return item.HomeTeamScore.toString();
        } else {
          return item.AwayTeamScore.toString();
        }
      } else {
        return "";
      }
    } else {
      if (teamLocation === "home") {
        return handleScoreGuess(item.MatchNumber, "home");
      } else {
        return handleScoreGuess(item.MatchNumber, "away");
      }
    }
  }

  // UPDATE STATE AND FILL INPUT FUNCTION
  function handleScoreGuess(
    matchNumber: number,
    teamLocation: "home" | "away"
  ) {
    const scoreGuess = inputGuesses.current.find((guess) => {
      if (guess.MatchNumber === matchNumber) {
        return guess;
      } else {
        return "";
      }
    });
    if (teamLocation === "home") {
      return scoreGuess?.HomeTeamScore?.toString();
    } else {
      return scoreGuess?.AwayTeamScore?.toString();
    }
  }

  // CHANGE BORDER AND CARD COLOR IF LIVERPOOL ARE IN GAME
  const chooseBorderBgCardColor = (home: string, away: string) => {
    if (home === "Liverpool" || away === "Liverpool") {
      return "border-red-600 bg-red-100/50";
    } else {
      return "border-gray-500 bg-gray-200/50";
    }
  };

  // CHANGE TEXT COLOR IF LIVERPOOL ARE IN GAME
  const chooseTextCardColor = (home: string, away: string) => {
    if (home === "Liverpool" || away === "Liverpool") {
      return "text-red-600";
    } else {
      return "text-gray-700";
    }
  };

  const allLeagues = useQuery(api.functions.listLeagues);

  // UPDATE ALL USER POINTS FUNCTION
  async function updatePoints() {
    if (allLeagues && allLeagues.length > 0) {
      setIsSubmitting(true);
      allLeagues.map((league) => {
        const leagueParticipants = league.participants;
        if (leagueParticipants.length > 0) {
          leagueParticipants.map(async (participant) => {
            const userData = await convex.query(api.functions.findUser, {
              id: participant!,
              type: "_idDb",
            });
            if (userData && userData.leagues) {
              // FINDING LEAGUE INDEX
              const foundedLeagueIndex = userData.leagues.findIndex(
                (userLeague) => userLeague.id === league._id
              );
              if (foundedLeagueIndex !== -1) {
                const userCompetitionGuesses =
                  userData.leagues[foundedLeagueIndex];
                userCompetitionGuesses.guesses.forEach((guess) => {
                  if (
                    guess.HomeTeamScore !== null &&
                    guess.AwayTeamScore !== null
                  ) {
                    const foundedCompetitionGameIndex = league.games.findIndex(
                      (game) =>
                        game.MatchNumber === guess.MatchNumber &&
                        new Date(game.DateUtc) < new Date()
                    );
                    if (foundedCompetitionGameIndex !== -1) {
                      const officialHomeResult =
                        league.games[foundedCompetitionGameIndex].HomeTeamScore;
                      const officialAwayResult =
                        league.games[foundedCompetitionGameIndex].AwayTeamScore;
                      const userGuessHomeResult = guess.HomeTeamScore;
                      const userGuessAwayResult = guess.AwayTeamScore;
                      if (
                        officialHomeResult !== null &&
                        officialAwayResult !== null
                      ) {
                        if (
                          userGuessHomeResult !== null &&
                          userGuessAwayResult !== null
                        ) {
                          if (
                            officialHomeResult === userGuessHomeResult &&
                            officialAwayResult === userGuessAwayResult
                          ) {
                            guess.points = 3;
                          } else {
                            const officialResultSum =
                              officialHomeResult < officialAwayResult;
                            const userGuessSum =
                              userGuessHomeResult < userGuessAwayResult;
                            if (officialResultSum === userGuessSum) {
                              guess.points = 1;
                            } else {
                              guess.points = 0;
                            }
                          }
                        } else {
                          guess.points = 0;
                        }
                      }
                    }
                  }
                });
                let totalPointsSum = 0;
                userCompetitionGuesses.guesses.map((guess) => {
                  totalPointsSum = totalPointsSum + guess.points;
                });
                await convex
                  .mutation(api.functions.updateDbUserGuesses, {
                    league: {
                      id: league._id,
                      guesses: userCompetitionGuesses.guesses,
                      totalPoints: totalPointsSum,
                    },
                    userId: userData!._id,
                  })
                  .then(() => {
                    toast.success(
                      `Resultados de ${userData.name} atualizados, confira os pontos! 👌`
                    );
                  })
                  .catch((error) => {
                    toast.error("Ocorreu um erro... 🤯");
                    console.log("ESSE É O ERRO", error);
                  });
              } else console.log("não deu");
            }
          });
        }
      });
      setIsSubmitting(false);
    }
  }

  return (
    <GlobalDataContext.Provider
      value={{
        allRounds,
        auth,
        convex,
        competition,
        db,
        emptyInputGuesses,
        filledGuesses,
        fixturesToShow,
        headerTitle,
        headerLeftBackIcon,
        headerRightInfoIcon,
        inputGuesses,
        isMyGuesses,
        isSubmitting,
        listToShow,
        loading,
        login,
        logged,
        openModal,
        page,
        roundSelected,
        showCopyright,
        showFooterMenu,
        teamsLogoPath,
        user,
        userData,
        userPools,

        chooseBorderBgCardColor,
        chooseTextCardColor,
        createLeague,
        deleteLeague,
        handleClubBadge,
        setCompetition,
        setFilledGuesses,
        setIsSubmitting,
        handleLogout,
        setOpenModal,
        setPage,
        setRoundSelected,
        handleUser,
        handleUserPools,
        handleValueInputScore,
        onHeaderCustomize,
        onFooterCustomize,
        setLoading,
        toggleGuessesResultsRanking,
        setLogin,
        updateStateGuesses,
        updatePoints,
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
};
