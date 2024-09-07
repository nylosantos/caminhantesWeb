import { useState, useEffect } from "react";
import { requestForToken, onMessageListener } from "../utils/firebase";
import { toast } from "sonner";
import { CaminhantesIcon } from "./CaminhantesIcon";

export default function Notification() {
  const [notification, setNotification] = useState({ title: "", body: "" });
  const notify = () => toast(<ToastDisplay />);

  function ToastDisplay() {
    return (
      <div className="flex w-full gap-2 items-center justify-center">
        <div className="flex w-auto">
          <CaminhantesIcon />
        </div>
        <div className="flex flex-col w-full">
          <p className="text-red-600 uppercase">
            <b>{notification?.title}</b>
          </p>
          <p>{notification?.body}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (notification?.title) {
      notify();
    }
  }, [notification]);

  requestForToken();

  onMessageListener()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((payload: any) => {
      setNotification({
        title: payload?.notification?.title,
        body: payload?.notification?.body,
      });
    })
    .catch((err) => console.log("failed: ", err));

  return <></>;
}
