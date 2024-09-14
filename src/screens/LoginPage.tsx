/* eslint-disable no-useless-escape */
import { useContext, useState } from "react";
import { Container } from "../components/Container";
import { CaminhantesIcon } from "../components/CaminhantesIcon";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  TwitterAuthProvider,
} from "firebase/auth";
import CopyrightFooter from "../components/CopyrightFooter";
import { Separator } from "../components/Separator";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { GlobalDataContextType } from "../@types";
import Button from "../components/Button";

export function LoginPage() {
  // GET GLOBAL DATA
  const {
    auth,
    login,
    setIsSubmitting,
    handleDbData,
    handleUser,
    setLogin,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  const [loginData, setLoginData] = useState({
    name: "",
    login: "",
    password: "",
    confirmPassword: "",
  });

  // const [login, setLogin] = useState(true);

  function clearFields() {
    setLoginData({
      name: "",
      login: "",
      password: "",
      confirmPassword: "",
    });
  }

  function toggleLoginRegister() {
    setLogin(!login);
    clearFields();
  }

  // CREATE USER CONVEX DB
  const createDbUser = useMutation(api.functions.createUser);

  // SIGN IN WITH SOCIAL FUNCTION
  const signInWithSocial = async (provider: "twitter" | "google") => {
    setIsSubmitting(true);
    const socialProviderFunction = () => {
      if (provider === "google") {
        return new GoogleAuthProvider();
      } else if (provider === "twitter") {
        return new TwitterAuthProvider();
      }
    };
    const socialProvider = socialProviderFunction();
    if (socialProvider !== undefined) {
      const result = await signInWithPopup(auth, socialProvider).catch(
        (error) => {
          console.log(error);
          toast.error(
            "Não foi possível logar com sua rede social? Tente com e-mail e senha..."
          );
          setIsSubmitting(false);
        }
      );
      if (result) {
        const user = result.user;
        await createDbUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          role: "user",
        })
          .then(async () => {
            await handleDbData().then((downloadedUsersData) => {
              if (downloadedUsersData) {
                handleUser(user, downloadedUsersData);
              } else {
                console.log(
                  "Erro ao obter os usuários do banco de dados (downloadedUsersData): ",
                  downloadedUsersData
                );
                toast.error(
                  "Erro ao verificar usuário no banco de dados. Tente com e-mail e senha..."
                );
                setIsSubmitting(false);
              }
            });
          })
          .catch((error) => {
            console.log(error);
            toast.error(
              "Erro ao verificar usuário no banco de dados. Tente com e-mail e senha..."
            );
            setIsSubmitting(false);
          });
        // setIsSubmitting(false);
      } else return;
    } else {
      console.log("Erro: Auth Provider não definido!");
    }
  };

  // SIGN UP WITH EMAIL AND PASSWORD
  async function handleSignUpWithEmailAndPassword() {
    setIsSubmitting(true);
    const errors: string[] = [];

    if (loginData.name == "") {
      errors.push("Preencha o campo Nome");
    }

    if (loginData.password == "") {
      errors.push("Preencha o campo Senha");
    }

    if (loginData.confirmPassword == "") {
      errors.push("Preencha o campo Confirme a Senha");
    }

    if (loginData.password !== loginData.confirmPassword) {
      errors.push("As senhas não são iguais");
    }

    if (loginData.login == "") {
      errors.push("Preencha o campo E-mail");
    }

    // VALIDATE E-MAIL TEST
    if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(loginData.login)
    ) {
      errors.push("Endereço de e-mail inválido");
    }
    if (errors.length > 0) {
      setIsSubmitting(false);
      errors.map((fieldError) => {
        toast.error(fieldError);
      });
      console.log(errors);
    } else {
      // SIGN UP FUNCTION
      await createUserWithEmailAndPassword(
        auth,
        loginData.login,
        loginData.password
      )
        .then(async (userCredential) => {
          const user = userCredential.user;
          await createDbUser({
            uid: user.uid,
            displayName: loginData.name,
            email: user.email,
            phoneNumber: null,
            photoURL: null,
            role: "user",
          })
            .then(async (res) => {
              if (res === "User Exists") {
                return toast.error("Usuário já cadastrado.");
              } else {
                await handleDbData().then((downloadedUsersData) => {
                  if (downloadedUsersData) {
                    handleUser(user, downloadedUsersData);
                  } else {
                    console.log(
                      "Erro ao obter os usuários do banco de dados (downloadedUsersData): ",
                      downloadedUsersData
                    );
                    toast.error(
                      "Erro ao verificar usuário no banco de dados. Tente com e-mail e senha..."
                    );
                    setIsSubmitting(false);
                  }
                });
              }
            })
            .catch((error) => {
              console.log(error);
              setIsSubmitting(false);
              return toast.error("Erro ao criar usuário no banco de dados.");
            });
          // return setIsSubmitting(false);
        })
        .catch((error) => {
          clearFields();
          setIsSubmitting(false);
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          if (errorCode === "auth/weak-password") {
            console.log(errorMessage);
            toast.error("A senha deve ter no mínimo 6 caracteres...");
          } else if (errorCode === "auth/email-already-in-use") {
            console.log(errorMessage);
            toast.error("E-mail já cadastrado...");
          } else {
            console.log(errorMessage);
            toast.error("Ocorreu um erro... 🤯");
            toast.error(`${errorMessage}... 🤯`);
          }
        });
    }
  }

  // SIGN IN WITH EMAIL AND PASSWORD
  async function handleSignInWithEmailAndPassword() {
    const errors: string[] = [];
    setIsSubmitting(true);

    if (loginData.password == "") {
      errors.push("Preencha o campo Senha");
    }
    if (loginData.login == "") {
      errors.push("Preencha o campo E-mail");
    }
    // VALIDATE E-MAIL TEST
    if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(loginData.login)
    ) {
      errors.push("Endereço de e-mail inválido");
    }
    if (errors.length > 0) {
      setIsSubmitting(false);
      errors.map((fieldError) => {
        toast.error(fieldError);
      });
      console.log(errors);
    } else {
      await signInWithEmailAndPassword(
        auth,
        loginData.login,
        loginData.password
      )
        .then(async (userCredential) => {
          const user = userCredential.user;
          await handleDbData().then((downloadedUsersData) => {
            if (downloadedUsersData) {
              handleUser(user, downloadedUsersData);
            } else {
              console.log(
                "Erro ao obter os usuários do banco de dados (downloadedUsersData): ",
                downloadedUsersData
              );
              toast.error(
                "Erro ao verificar usuário no banco de dados. Tente com e-mail e senha..."
              );
              setIsSubmitting(false);
            }
          });
          clearFields();
          // setIsSubmitting(false);
        })
        .catch((error) => {
          setIsSubmitting(false);
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorCode === "auth/user-not-found") {
            toast.error("Nome de usuário ou senha inválidos");
          } else if (errorCode === "auth/wrong-password") {
            toast.error("Nome de usuário ou senha inválidos");
          } else if (errorCode === "auth/invalid-credential") {
            toast.error("Nome de usuário ou senha inválidos");
          } else {
            toast.error(`${errorMessage}... 🤯`);
          }
        });
    }
  }

  return (
    <Container>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-6 py-5">
          <CaminhantesIcon />
          <p className="pb-6 text-center text-4xl font-black uppercase text-red-600">
            Bolão Caminhantes
          </p>
        </div>
        {!login && (
          <input
            className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
            id="name"
            type="name"
            autoCapitalize=""
            placeholder="Nome"
            value={loginData.name}
            onChange={(e) => {
              setLoginData({ ...loginData, name: e.target.value });
            }}
          />
        )}
        <input
          className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
          id="email"
          type="email"
          autoCapitalize="none"
          placeholder="E-mail"
          value={loginData.login}
          onChange={(e) => {
            setLoginData({ ...loginData, login: e.target.value });
          }}
        />
        <input
          className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
          id="password"
          type="password"
          placeholder="Senha"
          value={loginData.password}
          onChange={(e) => {
            setLoginData({ ...loginData, password: e.target.value });
          }}
        />
        {!login && (
          <input
            className="h-10 w-full max-w-md rounded-lg bg-gray-300 px-5 text-left text-gray-950"
            id="confirmPassword"
            type="password"
            placeholder="Confirme a Senha"
            value={loginData.confirmPassword}
            onChange={(e) => {
              setLoginData({ ...loginData, confirmPassword: e.target.value });
            }}
          />
        )}
        {/* LOGIN / REGISTER BUTTON */}
        <Button
          buttonFunction={() =>
            login
              ? handleSignInWithEmailAndPassword()
              : handleSignUpWithEmailAndPassword()
          }
          type="login"
          name={login ? "Login" : "Criar Conta"}
        />
        {/* TOGGLE LOGIN REGISTER */}
        <div className="flex flex-row gap-1 pt-3">
          <p className="text-center text-xs font-light text-red-600">
            {login ? "Não tem uma conta?" : "Já tem uma conta?"}
          </p>
          <button onClick={toggleLoginRegister}>
            <p className="text-center text-xs font-light text-red-600">
              {login ? "Crie uma agora mesmo" : "Faça Login"}
            </p>
          </button>
        </div>
        {login && (
          <>
            <Separator />
            <div className="flex w-full flex-col">
              {/* LOGIN / REGISTER WITH GOOGLE BUTTON */}
              <Button
                buttonFunction={() => signInWithSocial("google")}
                type="twitter"
                name="Login com conta Google"
              />
              {/* LOGIN / REGISTER WITH TWITTER BUTTON */}
              <Button
                buttonFunction={() => signInWithSocial("twitter")}
                type="twitter"
                name="Login com Twitter / X"
              />
            </div>
          </>
        )}
        {/* FOOTER */}
        <CopyrightFooter />
      </div>
    </Container>
  );
}
