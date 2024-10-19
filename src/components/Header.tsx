import { CaminhantesIcon } from "./CaminhantesIcon";
import { AiOutlineLeft } from "react-icons/ai";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useContext } from "react";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { GlobalDataContextType } from "../@types";

interface ButtonProps {
  title: string;
  ignoreTopSpacing?: boolean;
  isModal?: boolean;
  showCaminhantesLeftIcon?: boolean;
  showCaminhantesRightIcon?: boolean;
  showLeftButton?: boolean;
  showRightButton?: boolean;
  onPressLeft?: () => void;
  onPressRight?: () => void;
}

export const Header = ({
  title,
  showLeftButton = false,
  showRightButton = true,
  showCaminhantesLeftIcon = false,
  showCaminhantesRightIcon = false,
}: ButtonProps) => {
  // GET GLOBAL DATA
  const { page, setPage, setOpenModal } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;
  const EmptyBoxSpace = () => <div className="flex h-6 w-6" />;

  return (
    <div className="fixed top-0 z-50 flex w-full flex-row items-end justify-center bg-gray-200 py-5">
      <div className="flex w-full max-w-md items-center justify-between px-6">
        {showLeftButton ? (
          <button onClick={() => setPage({ show: page.prev, prev: page.show })}>
            <AiOutlineLeft className="mt-1 text-red-600" size={20} />
          </button>
        ) : showCaminhantesLeftIcon ? (
          <CaminhantesIcon />
        ) : (
          <EmptyBoxSpace />
        )}
        <p className="text-center text-2xl font-black text-red-600">{title}</p>
        {showRightButton ? (
          <button onClick={() => setOpenModal(true)}>
            <BsFillInfoCircleFill className="mt-1 text-red-600" size={20} />
          </button>
        ) : showCaminhantesRightIcon ? (
          <CaminhantesIcon />
        ) : (
          <EmptyBoxSpace />
        )}
      </div>
    </div>
  );
};
