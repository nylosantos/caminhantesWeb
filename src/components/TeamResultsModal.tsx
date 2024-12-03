import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { useContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { FixturesProps, GlobalDataContextType } from "../@types";
import { RingLoader } from "react-spinners";
import { Modal } from "@mui/material";
import { Separator } from "./Separator";

interface TeamResultsModalProps {
  open: boolean;
  teamName: string;
  textColor:
    | "text-purple-900"
    | "text-blue-900"
    | "text-red-900"
    | "text-green-900"
    | "text-amber-900"
    | "text-[#1e1034]"
    | "text-gray-950"
    | undefined;
  chooseBorderBgCardColor: (home: string, away: string) => string;
  chooseLoadingColor: (
    name: string
  ) =>
    | "#581c87"
    | "#1e3a8a"
    | "#7f1d1d"
    | "#14532d"
    | "#78350f"
    | "#1e1034"
    | "#dc2626"
    | undefined;
  chooseTextCardColor: (
    home: string,
    away: string
  ) =>
    | "text-purple-900"
    | "text-blue-900"
    | "text-red-900"
    | "text-green-900"
    | "text-amber-900"
    | "text-[#1e1034]"
    | "text-gray-950"
    | "text-red-600"
    | undefined;
  getCountryFlag: (countryName: string) => JSX.Element;
  handleClose: () => void;
}

export default function TeamResultsModal({
  open,
  teamName,
  textColor,
  chooseBorderBgCardColor,
  chooseLoadingColor,
  chooseTextCardColor,
  getCountryFlag,
  handleClose,
}: TeamResultsModalProps) {
  // GET GLOBAL DATA
  const { competition, dbLeaguesData, handleClubBadge } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  const [items, setItems] = useState<FixturesProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (teamName !== "" && competition && dbLeaguesData) {
      const foundedLeague = dbLeaguesData.find(
        (league) => league._id === competition._id
      );
      if (foundedLeague) {
        const foundedGamesByClub = foundedLeague.games.filter(
          (game) => game.AwayTeam === teamName || game.HomeTeam === teamName
        );
        if (foundedGamesByClub.length > 0) {
          setItems(foundedGamesByClub);
          setLoading(false);
        } else {
          console.error(
            "Nenhuma partida encontrada variáveis [teamName] | [competition] | dbLeaguesData: ",
            teamName,
            competition,
            dbLeaguesData
          );
        }
      } else {
        setLoading(false);
        console.error(
          "Nenhuma partida encontrada variáveis [teamName] | [competition] | dbLeaguesData: ",
          teamName,
          competition,
          dbLeaguesData
        );
      }
    } else {
      setLoading(false);
      console.error(
        "Nenhuma partida encontrada variáveis [teamName] | [competition] | dbLeaguesData: ",
        teamName,
        competition,
        dbLeaguesData
      );
    }
  }, [teamName, competition, dbLeaguesData]);

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        setItems([]);
        setLoading(true);
      }}
      className="flex flex-col w-screen justify-start items-center"
    >
      <>
        {loading ? (
          <div className="-mt-20 flex h-screen w-full items-center justify-center">
            <RingLoader
              color={chooseLoadingColor(competition!.name)}
              size={150}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-52 flex w-full flex-1 items-center justify-center px-4">
            <p className={`${textColor} text-center`}>
              Nenhuma partida disponível para o time selecionado
            </p>
          </div>
        ) : (
          <>
            <div className="z-40 fixed top-0 flex w-full max-w-md flex-col items-center justify-center bg-white px-6">
              {/* SUBHEADER */}
              <div className="mt-6 flex w-full flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3">
                  {/* TEAM BADGE */}
                  <div className="flex flex-row items-center ml-2">
                    {competition!.name === "Nations League"
                      ? getCountryFlag(teamName)
                      : handleClubBadge(teamName)}
                  </div>
                  <div className="flex flex-col items-center">
                    <p
                      className={`${chooseTextCardColor(
                        teamName,
                        teamName
                      )} w-full text-left text-base font-bold leading-relaxed`}
                    >
                      {teamName}
                    </p>
                    <p
                      className={`${chooseTextCardColor(
                        teamName,
                        teamName
                      )} w-full text-left text-xs font-normal leading-relaxed`}
                    >
                      Jogos / Resultados
                    </p>
                    <p
                      className={`${chooseTextCardColor(
                        teamName,
                        teamName
                      )} w-full text-left text-xs font-normal leading-relaxed`}
                    >
                      {competition!.name} {competition!.season}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    handleClose();
                    setItems([]);
                    setLoading(true);
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
            <div className="flex flex-col w-full max-w-md bg-white p-6 pt-32 overflow-scroll no-scrollbar">
              {items
                .sort((a, b) => a.RoundNumber - b.RoundNumber)
                .map((item) => (
                  <>
                    {/* FORM */}
                    <form
                      className={`mb-3 flex w-full flex-col items-center justify-center rounded-md border-b-2 ${chooseBorderBgCardColor(
                        item!.HomeTeam,
                        item!.AwayTeam
                      )}`}
                      key={uuidV4()}
                    >
                      {/* FIXTURE DETAILS: TEAMS AND DATE */}
                      <div className="my-4 flex w-full flex-col">
                        <p
                          className={`w-full text-center text-sm font-bold ${chooseTextCardColor(
                            item!.HomeTeam,
                            item!.AwayTeam
                          )}`}
                        >
                          {item!.HomeTeam} vs {item!.AwayTeam}
                        </p>
                        <p
                          className={`w-full text-center text-xs ${chooseTextCardColor(
                            item!.HomeTeam,
                            item!.AwayTeam
                          )}`}
                        >
                          {`${item!.Location}, ${formatInTimeZone(
                            item!.DateUtc,
                            "America/Sao_Paulo",
                            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}`}
                        </p>
                      </div>
                      <div className="flex flex-row items-center justify-end mb-4">
                        {/* HOME TEAM BADGE */}
                        <div className="flex flex-row items-center mr-2">
                          {competition!.name === "Nations League"
                            ? getCountryFlag(item!.HomeTeam)
                            : handleClubBadge(item!.HomeTeam)}
                        </div>
                        {/* HIDDEN INPUT MATCH NUMBER */}
                        <input
                          type="number"
                          defaultValue={item!.MatchNumber}
                          hidden
                          name="MatchNumber"
                        />
                        {/* HIDDEN INPUT ROUND NUMBER */}
                        <input
                          type="number"
                          defaultValue={item!.RoundNumber}
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
                          defaultValue={item!.HomeTeamScore ?? ""}
                          readOnly={true}
                          className={`h-10 rounded text-center ${textColor} outline-none 
                      ${
                        item.HomeTeamScore !== null
                          ? `w-5 bg-transparent font-semibold`
                          : "bg-transparent hidden"
                      }
                    `}
                        />
                        {/* TEAM SEPARATOR: '-' or 'vs' */}
                        <p
                          className={`px-1 text-center ${textColor} font-semibold`}
                        >
                          {
                            new Date(item!.DateUtc) < new Date()
                              ? "-" // IF GAME WASN'T START YET
                              : "vs" // IF GAME WAS STARTED
                          }
                        </p>
                        {/* AWAY TEAM SCORE INPUT */}
                        <input
                          type="number"
                          name="AwayTeamScore"
                          pattern="^[+ 0-9]{5}$"
                          maxLength={2}
                          defaultValue={item!.AwayTeamScore ?? ""}
                          readOnly={true}
                          className={`h-10 rounded text-center ${textColor} outline-none 
                        ${
                          item.AwayTeamScore !== null
                            ? `w-5 bg-transparent font-semibold`
                            : "bg-transparent hidden"
                        }
                      `}
                        />
                        {/* AWAY TEAM BADGE */}
                        <div className="flex flex-row items-center ml-2">
                          {competition!.name === "Nations League"
                            ? getCountryFlag(item!.AwayTeam)
                            : handleClubBadge(item!.AwayTeam)}
                        </div>
                      </div>
                      {/* ACTION BUTTON (SEND GUESS / UPDATE RESULTS / SHOW POINTS-MESSAGE) */}
                      <div
                        className={`flex w-full items-center justify-center gap-2 rounded px-2 py-1 outline-none`}
                      >
                        <p
                          className={`text-xxs font-semibold uppercase ${chooseTextCardColor(
                            teamName,
                            teamName
                          )}`}
                        >
                          {item!.RoundNumber}ª Rodada
                        </p>
                      </div>
                    </form>
                  </>
                ))}
            </div>
          </>
        )}
      </>
    </Modal>
  );
}
