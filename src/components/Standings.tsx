/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { GlobalDataContextType } from "../@types";
import { Modal } from "@mui/material";
import TeamResultsModal from "./TeamResultsModal";
import { getCode } from "country-list";
import Flag from "react-world-flags";
import { RingLoader } from "react-spinners";
import { Separator } from "./Separator";

interface Team {
  deduction: any;
  draws: number;
  goalConDiff: number;
  id: number;
  idx: number;
  losses: number;
  name: string;
  ongoing: any;
  pageUrl: string;
  played: number;
  pts: number;
  qualColor: string;
  scoresStr: string;
  shortName: string;
  wins: number;
}

interface apiData {
  status: string;
  response: {
    standing: Team[];
  };
}

type StandingsProps = {
  leagueId: number;
  competitionName: string;
  openTableModal: boolean;
  handleCloseTableModal: () => void;
};

const Standings = ({
  leagueId,
  competitionName,
  openTableModal,
  handleCloseTableModal,
}: StandingsProps) => {
  // GET GLOBAL DATA
  const { competition, handleClubBadge, handleFormatClubName } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagueTable = async () => {
      const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-standing-all?leagueid=${leagueId}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "13eada8944msh179bcc5f6e6d88ap17aff9jsn82156ef129b3",
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
        },
      };
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error("Erro ao buscar dados da API");
        }
        const data: apiData = await response.json();
        setTeams(data.response.standing);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueTable();
  }, [leagueId]);

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

  const textColor = chooseTextCompetitionColor(competitionName);

  type HandleLiverpoolTextColorProps = {
    team: string;
  };

  function handleLiverpoolTextColor({ team }: HandleLiverpoolTextColorProps) {
    if (team === "Liverpool") {
      return "bg-red-100/50 text-red-600";
    } else {
      return chooseTextCompetitionColor(competitionName);
    }
  }

  type HandlePlaceBgAndTextColorProps = {
    color: string | null;
  };

  function handlePlaceBgAndTextColor({
    color,
  }: HandlePlaceBgAndTextColorProps) {
    if (color === "#2AD572") {
      return `bg-teal-600 text-gray-100`;
    } else if (color === "#0294F0") {
      return `bg-sky-700 text-gray-100`;
    } else if (color === "#FF4646") {
      return `bg-red-600 text-gray-100`;
    } else {
      return `bg-transparent ${textColor}`;
    }
  }

  // TEAMS MODAL STATES AND FUNCTIONS
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTeamName("");
  };

  // CHANGE TEXT COLOR IF LIVERPOOL ARE IN GAME
  const chooseTextCardColor = (home: string, away: string) => {
    if (home === "Liverpool" || away === "Liverpool") {
      return "text-red-600";
    } else {
      return chooseTextCompetitionColor(competitionName);
    }
  };

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
      return `${chooseBorderCardColor(competitionName)} bg-gray-200/50`;
    }
  };

  function handleClickTeam(namePicked: string) {
    const clubNameFormatted = handleFormatClubName(namePicked);
    setTeamName(clubNameFormatted);
    handleOpen();
  }

  if (loading)
    return (
      <div className="-mt-20 flex h-screen w-full items-center justify-center">
        <RingLoader color={chooseLoadingColor(competitionName)} size={150} />
      </div>
    );
  if (error)
    return (
      <div className="mt-52 flex w-full flex-1 items-center justify-center px-4">
        <p className={`${textColor} text-center`}>Erro ao carregar tabela</p>
      </div>
    );

  return (
    <Modal
      open={openTableModal}
      onClose={() => {
        handleCloseTableModal();
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
              {/* COMPETITION LOGO*/}
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
                  Classificação
                </p>
              </div>
            </div>
            <div
              onClick={() => {
                handleCloseTableModal();
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
        </div>
        <div
          className={`flex flex-col w-full max-w-md h-full bg-white p-2 pt-28 pb-6 overflow-scroll no-scrollbar ${textColor}`}
        >
          <table className="table-auto w-full">
            <thead>
              <tr className="text-xxs text-gray-500">
                <th className=" px-2.5 py-2">#</th>
                <th className=" px-2.5 py-2">Time</th>
                <th className=" px-2.5 py-2">J</th>
                <th className=" px-2.5 py-2">V</th>
                <th className=" px-2.5 py-2">E</th>
                <th className=" px-2.5 py-2">D</th>
                <th className=" px-2.5 py-2">
                  <p className="whitespace-nowrap">GF-GS</p>
                </th>
                <th className=" px-2.5 py-2">SG</th>
                <th className=" px-2.5 py-2">P</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.idx} className={`text-center text-xs`}>
                  <td className="bg-transparent">
                    <p
                      className={`flex justify-center items-center ${handlePlaceBgAndTextColor({ color: team.qualColor })} rounded-full p-1`}
                    >
                      {team.idx}
                    </p>
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 rounded-s-full`}
                  >
                    <div
                      className="flex items-center justify-start gap-1 w-full"
                      onClick={() =>
                        handleClickTeam(handleFormatClubName(team.shortName))
                      }
                    >
                      <p className="flex items-center w-5 h-5">
                        {handleClubBadge(team.shortName)}
                      </p>
                      <p className="w-full text-left whitespace-nowrap">
                        {team.shortName}
                      </p>
                    </div>
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 `}
                  >
                    {team.played}
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 `}
                  >
                    {team.wins}
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 `}
                  >
                    {team.draws}
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 `}
                  >
                    {team.losses}
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 `}
                  >
                    {team.scoresStr}
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 `}
                  >
                    {team.goalConDiff}
                  </td>
                  <td
                    className={`${handleLiverpoolTextColor({ team: team.shortName })} px-2.5 py-2 rounded-e-full`}
                  >
                    {team.pts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    </Modal>
  );
};

export default Standings;
