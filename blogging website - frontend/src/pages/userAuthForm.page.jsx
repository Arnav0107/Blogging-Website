  import AnimationWrapper from "../common/page-animation";
  import InputBox from "../components/input.component";
  import googleIcon from "../imgs/google.png";
  import { Link } from "react-router-dom";
  import { useContext, useRef } from "react";
  import { Toaster, toast } from "react-hot-toast";
  import axios from "axios";
  import { storeInSession } from "../common/session";
  import { UserContext } from "../App";
  import { Navigate } from "react-router-dom";
  import { authWithGoogle } from "../common/firebase";
  import { GoogleAuthProvider } from "firebase/auth";
  import { useNavigate } from "react-router-dom";

  
  const UserAuthForm = ({ type }) => {
    const authForm = useRef();
    const navigate = useNavigate();

    let { userAuth, setUserAuth } = useContext(UserContext);
    let access_token = userAuth?.access_token;

    console.log(access_token);

    const userAuthThroughServer = (serverRoute, formData) => {
      
      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}${serverRoute}`, formData)
        .then(({ data }) => {
          storeInSession("user", JSON.stringify(data));
          setUserAuth(data);
           navigate("/dashboard/blogs");
        })
        .catch(({ response }) => {
          toast.error(response.data.message);
        });
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      let serverRoute = type == "sign-in" ? "/signin" : "/signup";

      let emailRegex = /^bt\d{2}[a-z]{3}\d{3}@iiitn\.ac\.in$/; // for college mail id
      let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

      //form data
      let form = new FormData(authForm.current);
      let formData = {};

      for (let [key, value] of form.entries()) {
        formData[key] = value;
      }

      let { fullname, email, password } = formData;

      //form validation
      if (fullname) {
        if (fullname.length < 3) {
          return toast.error("Full name must be at least 3 characters");
        }
      }
      if (!email) {
        return toast.error("Enter email");
      }

      if (!emailRegex.test(email)) {
        return toast.error("LOGIN WITH BT ID");
      }

      if (!password) {
        return toast.error("Enter Password");
      }

      if (!passwordRegex.test(password)) {
        return toast.error(
          "Password should be 6-20 characters with 1 number, 1 lowercase and 1 uppercase letter",
        );
      }
      userAuthThroughServer(serverRoute, formData);
    };


    
  const handleGoogleAuth = async (e) => {
    e.preventDefault();

    try {

      const result = await authWithGoogle();
      

      const user = result.user;

      const idToken = await user.getIdToken(); // important

      let serverRoute = "/google-auth";

      let formData = {
        access_token: idToken
      };

      userAuthThroughServer(serverRoute, formData);

    } catch (err) {
      toast.error("Trouble logging in through Google");
      console.log(err);
    }
  };


    return access_token ? (
      <Navigate to="/" />
    ) : (
      <AnimationWrapper keyValue={type}>
        <section className="h-cover flex items-center justify-center">
          <Toaster />
          <form ref={authForm} className="w-[80%] max-w-[400px]">
            <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
              {type == "sign-in" ? "Welcome back" : "Join us today"}
            </h1>

            {type !== "sign-in" ? (
              <InputBox
                name="fullname"
                type="text"
                placeholder="Full Name"
                icon="fi-rr-user"
              />
            ) : (
              ""
            )}
            <InputBox
              name="email"
              type="email"
              placeholder="Email"
              icon="fi-rr-envelope"
            />
            <InputBox
              name="password"
              type="password"
              placeholder="Password "
              icon="fi-rr-key"
            />
            <button
              className="btn-dark center mt-14"
              type="submit"
              onClick={handleSubmit}
            >
              {type.replace("-", " ")}
            </button>

            <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
              <hr className="w-1/2 border-black" />
              <p>or</p>
              <hr className="w-1/2 border-black" />
            </div>

            <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center " onClick={handleGoogleAuth}>
              <img src={googleIcon} className="w-5 " />
              Continue with google
            </button>

            {type == "sign-in" ? (
              <p className="mt-6 text-dark-grey text-xl text-center ">
                Don't have an account ?
                <Link to="/signup" className="underline text-black text-xl ml-1">
                  Join us today
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-dark-grey text-xl text-center ">
                Already a member ?
                <Link to="/signin" className="underline text-black text-xl ml-1">
                  Sign in here
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    );
  };

  export default UserAuthForm;
