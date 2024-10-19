/* eslint-disable react-hooks/exhaustive-deps */
import { Container } from "../components/Container";
import { Separator } from "../components/Separator";
import { useContext, useEffect } from "react";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { GlobalDataContextType } from "../@types";
import Button from "../components/Button";
import { PageProps } from "../LandingPage";
import CopyrightFooter from "../components/CopyrightFooter";

export default function Settings({ userData }: PageProps) {
  // GET GLOBAL DATA
  const { /*userData, */ handleLogout, onHeaderCustomize, onFooterCustomize } =
    useContext(GlobalDataContext) as GlobalDataContextType;

  // const navigate = useNavigate();

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize("Configurações", false, true);
    onFooterCustomize(false, true);
  }, []);

  return (
    <Container>
      <div className="flex w-full max-w-md flex-col items-center justify-start bg-white">
        <div className="mb-3 mt-10 flex w-full flex-row items-center justify-between rounded-md border-b-2 border-gray-500 bg-gray-200/50 p-4">
          <div className="flex flex-row items-center gap-3">
            <div>
              <p className="text-left text-base font-bold leading-relaxed">
                {userData!.name}
              </p>
              <p className="text-left text-xs font-medium leading-relaxed">
                {userData!.email ?? ""}
              </p>
            </div>
          </div>
          <div className="">
            <img
              src={
                userData!.photo === null
                  ? "https://cdn-icons-png.flaticon.com/512/4389/4389644.png"
                  : userData!.photo
              }
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
        {/* LOGOUT BUTTON */}
        <Button
          buttonFunction={() => {
            handleLogout();
          }}
          type="logout"
          name="Logout"
        />
        <Separator />
        {/* SUBHEADER */}
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="text-2xl font-black uppercase text-red-600">
            Regras do Bolão
          </p>
        </div>
        <div className="py-4">
          <p className="text-center text-xs text-red-600">
            Entenda como funcionam os palpites e a pontuação dos bolões
          </p>
        </div>
        <div className="flex flex-col gap-2 py-4">
          <p className="text-center text-base text-red-600">
            Ao enviar o palpite <strong>não é possível modificá-lo</strong>,
            então pense bem antes de confirmar seu palpite.
          </p>
          <Separator />

          <p className="text-center text-base text-red-600">
            O palpite pode ser dado até o horário do início da partida,{" "}
            <strong>fique atento ao horário descrito nos jogos</strong>
          </p>
          <Separator />
          <p className="text-center text-base text-red-600">
            Acertou o placar exato da partida? <strong>3 pontos</strong>
          </p>
          <p className="text-center text-base text-red-600">
            Acertou apenas o vencedor, <strong>mas acertou</strong> quantos gols
            um dos dois times envolvidos fez? <strong>2 pontos</strong>
          </p>
          <p className="text-center text-base text-red-600">
            Acertou apenas o vencedor ou empate? <strong>1 ponto</strong>
          </p>
          <p className="text-center text-base text-red-600">
            Não acertou? <strong>adivinha...</strong>
          </p>
          <Separator />
          <p className="text-center text-base text-red-600">
            A atualização dos pontos e do ranking dos bolões são atualizados no
            máximo <strong>24hs após o fim da rodada</strong>
          </p>
          <Separator />
        </div>
      </div>
      <CopyrightFooter />
    </Container>
  );
}
