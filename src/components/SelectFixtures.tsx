import { useContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { GlobalDataContextType } from "../@types";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";

type DataProps = {
  label: string;
  value: string;
};

type SelectComponentProps = {
  listToShow: "guesses" | "results" | "ranking";
  rounds: number[];
  roundSelected: number | undefined;
  setRoundSelected: (round: number | undefined) => void;
};

export function SelectFixtures({
  listToShow,
  rounds,
  roundSelected,
  setRoundSelected,
}: SelectComponentProps) {
  // GET GLOBAL DATA
  const { competition } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;
  const [open, setOpen] = useState(false);

  const [data, setData] = useState<DataProps[]>([]);

  const handleChange = (event: SelectChangeEvent) => {
    setRoundSelected(Number(event.target.value) || undefined);
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const roundsAsc = rounds.sort(function (a, b) {
      return a - b;
    });
    const array: DataProps[] = [];
    roundsAsc.map((round) =>
      array.push({ label: round.toString(), value: round.toString() })
    );
    setData(array);
  }, [rounds]);

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

  function handleChangeRound(position: "left" | "right") {
    const firstRound = rounds[0];
    const lastRound = rounds[rounds.length - 1];
    if (roundSelected) {
      if (position === "left") {
        if (roundSelected === firstRound) {
          return toast.warning("Essa é a primeira rodada disponível");
        } else {
          setRoundSelected(roundSelected - 1);
        }
      } else {
        if (roundSelected === lastRound) {
          return toast.warning("Essa é a última rodada disponível");
        } else {
          setRoundSelected(roundSelected + 1);
        }
      }
    }
  }

  type HandleLeaguePhaseCustomProps = {
    competition: string;
    round: number | undefined;
    showLabel: boolean;
  };

  const handleLeaguePhaseCustom = ({
    competition,
    round,
    showLabel,
  }: HandleLeaguePhaseCustomProps) => {
    if (competition === "Carabao Cup" && round === 5) {
      return "Quartas de Final";
    } else if (competition === "Carabao Cup" && round === 6) {
      return "Semifinal (ida)";
    } else if (competition === "Carabao Cup" && round === 7) {
      return "Semifinal (volta)";
    } else if (competition === "Carabao Cup" && round === 8) {
      return "Final";
    } else if (competition === "Champions League" && round === 9) {
      return "Playoffs (ida)";
    } else if (competition === "Champions League" && round === 10) {
      return "Playoffs (volta)";
    } else if (competition === "Champions League" && round === 11) {
      return "Oitavas de Final (ida)";
    } else if (competition === "Champions League" && round === 12) {
      return "Oitavas de Final (volta)";
    } else if (competition === "Champions League" && round === 13) {
      return "Quartas de Final (ida)";
    } else if (competition === "Champions League" && round === 14) {
      return "Quartas de Final (volta)";
    } else if (competition === "Champions League" && round === 15) {
      return "Semifinal (ida)";
    } else if (competition === "Champions League" && round === 16) {
      return "Semifinal (volta)";
    } else if (competition === "Champions League" && round === 17) {
      return "Final";
    } else {
      return `${showLabel ? "Rodada " : ""}${round}`;
    }
  };

  if (listToShow === "ranking") {
    return;
  } else if (rounds.length > 0) {
    return (
      <div className="flex w-full flex-row items-center justify-evenly gap-2">
        <div
          className="px-6 cursor-pointer"
          onClick={() => {
            handleChangeRound("left");
          }}
        >
          <FaArrowLeft
            className={`${chooseTextCompetitionColor(competition!.name)}`}
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            className="m-0 flex items-center justify-center gap-2 p-0"
            onClick={handleClickOpen}
          >
            <p
              className={`text-right text-base font-bold uppercase ${chooseTextCompetitionColor(competition!.name)}`}
            >
              {handleLeaguePhaseCustom({
                competition: competition!.name,
                round: roundSelected,
                showLabel: true,
              })}
            </p>
          </button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Selecione a Rodada</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel htmlFor="demo-dialog-native">Rodada</InputLabel>
                  <Select
                    native
                    value={roundSelected ? roundSelected.toString() : ""}
                    onChange={handleChange}
                    input={
                      <OutlinedInput label="Rodada" id="demo-dialog-native" />
                    }
                  >
                    <option aria-label="None" value="" />
                    {data.map((data) => {
                      return (
                        <option key={uuidV4()} value={data.value}>
                          {handleLeaguePhaseCustom({
                            competition: competition!.name,
                            round: +data.label,
                            showLabel: false,
                          })}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
          </Dialog>
        </div>
        <div
          className="px-6 cursor-pointer"
          onClick={() => {
            handleChangeRound("right");
          }}
        >
          <FaArrowRight
            className={`${chooseTextCompetitionColor(competition!.name)}`}
          />
        </div>
      </div>
    );
  }
}
