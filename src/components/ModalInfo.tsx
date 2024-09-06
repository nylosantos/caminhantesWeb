import { TfiYoutube } from "react-icons/tfi";
import {
  FaDiscord,
  FaInstagram,
  FaTiktok,
  FaTwitch,
  FaWhatsapp,
} from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import SocialMediaCard from "./SocialMediaCard";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { ReactNode, useContext } from "react";
import { GlobalDataContextType } from "../@types";
import { v4 as uuidV4 } from "uuid";
import { AiOutlineClose } from "react-icons/ai";
import { CaminhantesIcon } from "./CaminhantesIcon";
import CopyrightFooter from "./CopyrightFooter";
import { FaBluesky } from "react-icons/fa6";

export interface SocialMediaArrayProps {
  name: string;
  url: string;
  icon: ReactNode;
}

export default function ModalInfo() {
  // GET GLOBAL DATA
  const { setOpenModal } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  const socialMediaArray: SocialMediaArrayProps[] = [
    {
      name: "Youtube",
      url: "https://youtube.com/caminhantesvermelhos?sub_confirmation=1",
      icon: <TfiYoutube className="text-red-600" size={24} />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com/caminhantesLfc",
      icon: <FaInstagram className="text-red-600" size={24} />,
    },
    {
      name: "Twitter / X",
      url: "https://twitter.com/caminhantesLfc",
      icon: <BsTwitterX className="text-red-600" size={24} />,
    },
    {
      name: "BlueSky",
      url: "https://bsky.app/profile/caminhantes.bsky.social",
      icon: <FaBluesky className="text-red-600" size={24} />,
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@caminhanteslfc",
      icon: <FaTiktok className="text-red-600" size={24} />,
    },
    {
      name: "Twitch",
      url: "http://twitch.tv/CaminhantesLFC",
      icon: <FaTwitch className="text-red-600" size={24} />,
    },
    {
      name: "Discord",
      url: "https://discord.gg/4RTYbC7E66",
      icon: <FaDiscord className="text-red-600" size={24} />,
    },
    {
      name: "Grupo no WhatsApp",
      url: "https://chat.whatsapp.com/EsRqxO9GlgTBiCsoZim1wi",
      icon: <FaWhatsapp className="text-red-600" size={24} />,
    },
  ];

  return (
    <div className="flex max-w-xl flex-col overflow-auto bg-white">
      {/* MODAL HEADER */}
      <div className="flex w-full flex-row items-end justify-center bg-gray-200 px-6 py-5">
        <div className="flex w-full max-w-md items-center justify-between">
          <button onClick={() => setOpenModal(false)}>
            <AiOutlineClose className="mt-1 text-red-600" size={20} />
          </button>
          <p className="text-center text-2xl font-black text-red-600">
            Fala Caminhante!
          </p>
          <CaminhantesIcon />
        </div>
      </div>
      {/* MODAL BODY */}
      <div className="flex w-full flex-1 items-start justify-center">
        <div className="mb-5 flex w-full max-w-md flex-col items-center justify-center px-6">
          <div className="mb-8 flex flex-col items-center justify-center">
            <div className="py-4">
              <div className="flex flex-col justify-center gap-2">
                <p className="text-center text-base text-red-600">
                  Siga os <strong>Caminhantes</strong> em todas as redes e fique
                  por dentro de tudo relacionado ao <strong>Liverpool!</strong>
                </p>
                <p className="text-center text-xs italic text-red-600">
                  You'll Never Walk Alone
                </p>
              </div>
            </div>
            {socialMediaArray.map((item) => (
              <SocialMediaCard
                icon={item.icon}
                name={item.name}
                url={item.url}
                key={uuidV4()}
              />
            ))}
          </div>
          {/* MODAL FOOTER */}
          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
}
