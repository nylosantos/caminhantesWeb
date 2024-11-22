import { useContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { GlobalDataContextType } from "../@types";
import { GlobalDataContext } from "../context/GlobalDataContext";
// import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { ParticipantsWithPoints } from "../screens/PoolPage";

interface ParticipantsProps {
  league: Doc<"leagues">;
}

export const Participants = ({ league }: ParticipantsProps) => {
  // GET GLOBAL DATA
  const { dbUsersData, userPools } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;
  const [usersData, setUsersData] = useState<ParticipantsWithPoints[] | null>(
    []
  );
  const [imgSrc, setImgSrc] = useState<(string | null)[]>([]);

  async function getLeagueParticipants() {
    const leagueParticipants: ParticipantsWithPoints[] = [];
    if (league) {
      for (let index = 0; index < league.participants.length; index++) {
        if (league.participants[index]) {
          const participantId = league.participants[index];
          if (participantId && dbUsersData) {
            const participant = dbUsersData.find(
              (dbUserData) => dbUserData._id === participantId
            );
            if (participant) {
              const userLeagueGuesses = participant.leagues.find(
                (userLeague) => userLeague.id === league._id
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
      setUsersData(leagueParticipants);
    }
  }

  useEffect(() => {
    if (usersData) {
      const usersPhotoArray = [];
      for (let index = 0; index < usersData.length; index++) {
        usersPhotoArray.push(usersData[index].participant.photo);
      }
      setImgSrc(usersPhotoArray);
    }
  }, [usersData]);

  useEffect(() => {
    getLeagueParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPools, dbUsersData]);

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

  const sliceArray =
    imgSrc.length > 4
      ? imgSrc.slice(0, 4)
      : imgSrc.length <= 4 && imgSrc.length > 1
        ? imgSrc.slice(0, imgSrc.length - 1)
        : imgSrc;

  return (
    <div className="flex flex-row">
      {sliceArray.map((imgUrl) => (
        <img
          key={uuidV4()}
          src={
            imgUrl === null
              ? "https://cdn-icons-png.flaticon.com/512/4389/4389644.png"
              : imgUrl
          }
          className={`${imgSrc.length > 1 ? "-mr-3" : ""} h-7 w-7 rounded-full border-2 border-gray-100`}
        />
      ))}
      {imgSrc ? (
        imgSrc.length === 1 ? null : (
          <div
            className={`flex h-7 w-7 flex-row items-center justify-center rounded-full border-2 border-gray-100 ${chooseBgCompetitionColor(league.name)}`}
          >
            <p className="text-center text-xxs font-light text-gray-100">
              {imgSrc.length > 4
                ? `+${imgSrc.length - 4}`
                : imgSrc.length <= 4 && imgSrc.length > 1
                  ? `+${imgSrc.length - (imgSrc.length - 1)}`
                  : 0}
            </p>
          </div>
        )
      ) : (
        "erro"
      )}
    </div>
  );
};
