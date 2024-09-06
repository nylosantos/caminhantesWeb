import { SocialMediaArrayProps } from './ModalInfo';

export default function SocialMediaCard({ name, icon, url }: SocialMediaArrayProps) {
  return (
    <a
      href={url}
      target="_blank"
      className="mb-4 flex w-full flex-row items-center justify-between gap-4 rounded-md border-b-2 border-gray-500 bg-gray-200/50 p-6">
      <p className="text-center text-base font-semibold text-red-600">{name}</p>
      {icon}
    </a>
  );
}
