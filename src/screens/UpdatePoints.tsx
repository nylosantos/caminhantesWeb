/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import { Container } from '../components/Container';
import { GlobalDataContextType } from '../@types';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { api } from '../../convex/_generated/api';
import Button from '../components/Button';
import Select from 'react-select';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { Doc, Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { MdBrowserUpdated } from 'react-icons/md';
import { Separator } from '../components/Separator';

export type DataProps = {
  label: string;
  value: Id<'leagues'>;
};

export function UpdatePoints() {
  // GET GLOBAL DATA
  const {
    convex,
    isSubmitting,
    setIsSubmitting,
    onHeaderCustomize,
    onFooterCustomize,
    updatePoints,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize('Atualizar Pontos', true, true);
    onFooterCustomize(true, true);
  }, []);

  const [data, setData] = useState<DataProps[]>([]);
  const [dbLeagues, setDbLeagues] = useState<Doc<'leagues'>[]>([]);
  const [leagueDetails, setLeagueDetails] = useState<Doc<'leagues'> | undefined>();

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
        array.push({ label: `${league.name} ${league.season}`, value: league._id })
      );
      setData(array);
    }
  }

  // PUT DATA ON SELECT
  useEffect(() => {
    handleSelectData();
  }, [dbLeagues]);

  // GETTING LEAGUE DETAILS TO SHOW CONFIRMATION
  function handleLeagueDetail(id: Id<'leagues'>) {
    const leagueDetail = dbLeagues.find((league) => league._id === id);
    if (leagueDetail) {
      setLeagueDetails(leagueDetail);
    }
  }

  const ConfirmationAlert = withReactContent(Swal);

  function callUpdatePointsConfirmation() {
    ConfirmationAlert.fire({
      title: 'Você tem certeza?',
      text: 'Uma ação gigantesca no banco está prestes a começar!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, atualizar os pontos!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        updatePoints();
      }
    });
  }

  function callUpdateOneLeaguePointsConfirmation(name: string) {
    ConfirmationAlert.fire({
      title: 'Você tem certeza?',
      text: `Vamos atualizar toda a pontuação de ${name}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, atualizar!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleUpdateLeaguePoints();
        clearFields();
      }
    });
  }

  async function handleUpdateLeaguePoints() {
    setIsSubmitting(true);
    if (leagueDetails) {
      if (dbLeagues && dbLeagues.length > 0) {
        const foundedLeagueToUpdatePointsIndex = dbLeagues.findIndex(
          (league) => league._id === leagueDetails._id
        );

        if (foundedLeagueToUpdatePointsIndex !== -1) {
          const dbLeagueData = dbLeagues[foundedLeagueToUpdatePointsIndex];

          const leagueParticipants = dbLeagueData.participants;

          if (leagueParticipants.length > 0) {
            leagueParticipants.map(async (participant) => {
              const userData = await convex.query(api.functions.findUser, {
                id: participant!,
                type: '_idDb',
              });

              if (userData && userData.leagues) {
                // FINDING LEAGUE INDEX
                const foundedLeagueIndex = userData.leagues.findIndex(
                  (userLeague) => userLeague.id === dbLeagueData._id
                );

                if (foundedLeagueIndex !== -1) {
                  const userCompetitionGuesses = userData.leagues[foundedLeagueIndex];

                  userCompetitionGuesses.guesses.forEach((guess) => {
                    if (guess.HomeTeamScore !== null && guess.AwayTeamScore !== null) {
                      const foundedCompetitionGameIndex = dbLeagueData.games.findIndex(
                        (game) =>
                          game.MatchNumber === guess.MatchNumber &&
                          new Date(game.DateUtc) < new Date()
                      );
                      if (foundedCompetitionGameIndex !== -1) {
                        const officialHomeResult =
                          dbLeagueData.games[foundedCompetitionGameIndex].HomeTeamScore;
                        const officialAwayResult =
                          dbLeagueData.games[foundedCompetitionGameIndex].AwayTeamScore;
                        const userGuessHomeResult = guess.HomeTeamScore;
                        const userGuessAwayResult = guess.AwayTeamScore;
                        if (officialHomeResult !== null && officialAwayResult !== null) {
                          if (userGuessHomeResult !== null && userGuessAwayResult !== null) {
                            if (
                              officialHomeResult === userGuessHomeResult &&
                              officialAwayResult === userGuessAwayResult
                            ) {
                              guess.points = 3;
                            } else {
                              const officialResultSum = officialHomeResult - officialAwayResult;
                              const userGuessSum = userGuessHomeResult - userGuessAwayResult;

                              if (officialResultSum > 0 && userGuessSum > 0) {
                                if (
                                  officialHomeResult === userGuessHomeResult ||
                                  officialAwayResult === userGuessAwayResult
                                ) {
                                  guess.points = 2;
                                } else {
                                  guess.points = 1;
                                }
                              } else if (officialResultSum < 0 && userGuessSum < 0) {
                                if (
                                  officialHomeResult === userGuessHomeResult ||
                                  officialAwayResult === userGuessAwayResult
                                ) {
                                  guess.points = 2;
                                } else {
                                  guess.points = 1;
                                }
                              } else if (officialResultSum === 0 && userGuessSum === 0) {
                                if (
                                  officialHomeResult === userGuessHomeResult ||
                                  officialAwayResult === userGuessAwayResult
                                ) {
                                  guess.points = 2;
                                } else {
                                  guess.points = 1;
                                }
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
                        id: dbLeagueData._id,
                        guesses: userCompetitionGuesses.guesses,
                        totalPoints: totalPointsSum,
                      },
                      userId: userData!._id,
                    })
                    .catch((error) => {
                      setIsSubmitting(false);
                      console.log('Erro ao atualizar os pontos no banco de dados: ', error);
                      return toast.error('Ocorreu um erro... 🤯');
                    });
                }
              } else {
                setIsSubmitting(false);
                console.log(
                  'Algum erro com ao encontrar o usuário, ou as ligas do usuário, no banco de dados (userData && userData.leagues): ',
                  userData
                );
                return toast.error('Usuário não encontrado no banco de dados... 🤯');
              }
            });
            setIsSubmitting(false);
            return toast.success(
              `Resultados de ${leagueDetails.name} atualizados, confira os pontos! 👌`
            );
          } else {
            setIsSubmitting(false);
            console.log(
              'Não consta nenhum participante na liga (leagueParticipants): ',
              leagueParticipants
            );
            return toast.warning('Liga não tem nenhum participante... 🤔');
          }
        } else {
          setIsSubmitting(false);
          console.log(
            'Algum erro com ao encontrar o index da liga procurando no banco de dados (foundedLeagueToUpdatePointsIndex): ',
            foundedLeagueToUpdatePointsIndex
          );
          return toast.error('Liga não encontrada no banco de dados... 🤯');
        }
      } else {
        setIsSubmitting(false);
        console.log(
          'Algum erro com o estado que contém os detalhes da liga vindos do banco de dados (dbLeagues): ',
          dbLeagues
        );
        return toast.error('Erro ao obter os detalhes da liga no banco de dados... 🤯');
      }
    } else {
      setIsSubmitting(false);
      console.log(
        'Algum erro com o estado que contém os detalhes da liga (leagueDetails): ',
        leagueDetails
      );
      return toast.error('Erro ao obter os detalhes da liga... 🤯');
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
        {leagueDetails && leagueDetails._id !== '' && (
          <>
            {leagueDetails.logoUrl === '' ? (
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
        {leagueDetails ? (
          <Button
            name={`Atualizar os pontos de  ${leagueDetails.name} ${leagueDetails.season}?`}
            type="ball"
            buttonFunction={() =>
              callUpdateOneLeaguePointsConfirmation(`${leagueDetails.name} ${leagueDetails.season}`)
            }
          />
        ) : (
          <button
            className="flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
            disabled={isSubmitting}
            onClick={callUpdatePointsConfirmation}>
            <MdBrowserUpdated size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />
            <p className="text-center text-sm font-bold uppercase text-gray-100">
              {isSubmitting ? 'Aguarde...' : 'Atualizar todos os bolões cadastrados?'}
            </p>
          </button>
        )}
      </div>
    </Container>
  );
}
