import { useState } from "react";
import Confirm from "../../pages/auth/confirm";
import CreateLoginAndPassword from "./createLoginAndPassword";
export default function OtpCodeConfirmComponent() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {open ? <CreateLoginAndPassword /> : <Confirm setOpen={setOpen} />}
    </div>
  );
}
// 907462987
