import { Input, Spin } from "antd";
import useAuth from "../../hooks/useAuth";
import ButtonUI from "../../ui/button/Button";

const CreateLoginAndPassword = () => {
  const { auth, createUser, setAuth, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <span className="mb-3  w-full text-left">loginingizni kiriting</span>
        <Input
          className="mb-5 h-14 w-[328px] rounded-md border p-3 text-xl outline-none"
        placeholder="login"
          onChange={(e) => setAuth({ ...auth, login: e.target.value })}
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="mb-3 w-full text-left">parol kiriting</span>
        <Input
          className="mb-5 h-14 w-[328px] rounded-md border p-3 text-xl outline-none"
          placeholder="password"
          onChange={(e) => setAuth({ ...auth, password: e.target.value })}
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="mb-3 w-full text-left">parolni qayta kiriting</span>
        <Input
          className="mb-5 h-14 w-[328px] rounded-md p-3 text-xl outline-none"
          onChange={(e) => setAuth({ ...auth, rePassword: e.target.value })}
          placeholder="passwordni qayta kiriting"
        />
      </div>

      <ButtonUI
        onClick={createUser}
        disabled={
          auth.login != "" && auth.password != "" && auth.rePassword != ""
            ? false
            : true
        }
      >
        {isLoading ? <Spin /> : "yuborish"}
      </ButtonUI>
    </div>
  );
};

export default CreateLoginAndPassword;
