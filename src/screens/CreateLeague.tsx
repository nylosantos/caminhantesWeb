/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from 'react';
import { Container } from '../components/Container';
import { CreateLeagueProps, GlobalDataContextType } from '../@types';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storageDb } from '../utils/firebase';
import * as urlSlug from 'url-slug';
import { v4 as uuidV4 } from 'uuid';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { toast } from 'sonner';
import { api } from '../../convex/_generated/api';
import Button from '../components/Button';

export function CreateLeague() {
  // GET GLOBAL DATA
  const {
    convex,
    createLeague,
    /*compareAndUpdatePlFixtures,*/ setIsSubmitting,
    onHeaderCustomize,
    onFooterCustomize,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize('Criar Bolão', true, true);
    onFooterCustomize(true, true);
  }, []);

  const [leagueInfo, setLeagueInfo] = useState<CreateLeagueProps>({
    id: '',
    logoUrl: '',
    name: '',
    slug: '',
    season: '',
    code: '',
    createdBy: '',
  });
  const [logoImg, setLogoImg] = useState();
  const inputFile = useRef<HTMLInputElement>(null);

  function clearFields() {
    setLeagueInfo({
      id: '',
      logoUrl: '',
      name: '',
      slug: '',
      season: '',
      code: '',
      createdBy: '',
    });
    setLogoImg(undefined);
    if (inputFile.current) {
      inputFile.current.value = '';
      inputFile.current.type = 'text';
      inputFile.current.type = 'file';
    }
  }

  async function handleCreateLeague() {
    setIsSubmitting(true);
    const slug = urlSlug.convert(`${leagueInfo.name} ${leagueInfo.season}`);
    const findLeagueWithSlugAndCreator = await convex.query(
      api.functions.findLeagueWithSlugAndCreator,
      {
        leagueSlug: slug,
        leagueCreatedBy: leagueInfo.createdBy,
      }
    );
    if (
      leagueInfo.name !== '' &&
      leagueInfo.season !== '' &&
      leagueInfo.createdBy !== '' &&
      inputFile !== null
    ) {
      if (findLeagueWithSlugAndCreator === null) {
        const imgRef = ref(storageDb, `leagues/${slug}/${slug}-logo`);
        await uploadBytes(imgRef, logoImg!);
        await getDownloadURL(imgRef).then((res) => {
          const leagueInfoToCreate: CreateLeagueProps = {
            id: uuidV4(),
            code: Math.random().toString(36).slice(-5),
            slug: slug,
            logoUrl: res,
            name: leagueInfo.name,
            season: leagueInfo.season,
            createdBy: leagueInfo.createdBy,
          };
          createLeague(leagueInfoToCreate);
          clearFields();
          setIsSubmitting(false);
        });
      } else {
        setIsSubmitting(false);
        return toast.error('Liga já existe');
      }
    } else {
      setIsSubmitting(false);
      return toast.error('Preencha todas as informações');
    }
  }

  return (
    <Container>
      <div className="mt-8 flex h-full w-full flex-col items-center justify-center gap-4">
        <input
          className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
          id="name"
          type="text"
          placeholder="Nome"
          value={leagueInfo?.name}
          onChange={(e) => {
            setLeagueInfo({
              ...leagueInfo,
              name: e.target.value,
            });
          }}
        />
        <input
          className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
          id="season"
          type="text"
          placeholder="Season"
          value={leagueInfo?.season}
          onChange={(e) => {
            setLeagueInfo({
              ...leagueInfo,
              season: e.target.value,
            });
          }}
        />
        <div className="flex h-10 w-full max-w-md items-center justify-between gap-2 rounded-lg bg-gray-300 px-5">
          <label className="w-full cursor-pointer text-gray-400" htmlFor="imgInput">
            Logo
          </label>
          <input
            className="w-full cursor-pointer rounded-lg text-sm text-gray-400 file:hidden focus:outline-none dark:placeholder-gray-400"
            id="imgInput"
            ref={inputFile}
            type="file"
            onChange={(e) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              setLogoImg(e.currentTarget.files[0]);
            }}
          />
        </div>
        <input
          className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
          id="createdBy"
          type="text"
          placeholder="Liga criada por"
          value={leagueInfo?.createdBy}
          onChange={(e) => {
            setLeagueInfo({
              ...leagueInfo,
              createdBy: e.target.value,
            });
          }}
        />

        {/* LOGIN / REGISTER BUTTON */}
        <Button
          name={`Criar ${leagueInfo.name} ${leagueInfo.season}`}
          type="ball"
          buttonFunction={handleCreateLeague}
        />
      </div>
    </Container>
  );
}
