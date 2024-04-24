"use client"
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import pplogo from "../../static/pplogo.png"
import { User } from "@/typing";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/userSlice";
import { RootState } from "../store";

export default function Login() {
  const [creds, setCreds] = useState<User>({uid:"", email:"", password:"", username:""});
  const {user, loading, error} = useSelector((state:RootState) => state.user);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(creds)
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };


  const router = useRouter();
  const dispatch = useDispatch();

  // Sign in function using firebase email and password
  const HandleSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      if (creds.email && creds.password.length >= 6) {
        // console.log(creds);
        signInWithEmailAndPassword(auth, creds.email, creds.password)
          .then((userCredential) => {
            // Success
            console.log(userCredential.user);
            const user = userCredential.user;
            toast.success("Logged in Successfully !", {
              position: toast.POSITION.BOTTOM_LEFT,
            });

            if(user.uid){
              const { email, displayName, uid } = user;
              dispatch(loginUser({ email, username: displayName, uid }));
            }

            user.getIdToken()
            .then((idToken) => {
              // Use the ID token for secure communication (refer to Firebase documentation)
              console.log("ID Token:", idToken);
              localStorage.setItem("idToken", idToken);
            })
            .catch((error) => {
              console.error("Error getting ID token:", error);
            });

            router.push('/posts');
          })
          .catch((error) => {
            const errorMessage = error.code.split("/")[1];
            toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_LEFT,
            });

          });
      } else {
        toast.warn("Invalid Credentials !", {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      }
  };



    
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-black dark:text-white min-h-screen w-screen flex flex-col items-center justify-center bg-light_tag_sky dark:bg-dark_bg_gray"
    >
      <Link href="/">
        <Image
          className="rounded-full"
          width={200}
          height={200}
          src={pplogo}
          alt="logo"
        />
      </Link>
      <div className="max-w-md w-full p-6 bg-light_bg dark:bg-dark_bg rounded-md shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        <form onSubmit={HandleSignup}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 w-full border rounded-md text-black bg-gray-200"
              value={creds.email}
              onChange={changeHandler}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 p-2 w-full border rounded-md text-black bg-gray-200"
              value={creds.password}
              onChange={changeHandler}
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 text-white rounded-md bg-light_bg_button dark:bg-dark_bg_button  hover:shadow-md"
            disabled={loading}
          >
            Login
          </button>
        </form>
        <div className="flex flex-row flex-nowrap justify-center items-center m-2 p-2">
          <button className="p-2 mx-2 text-white rounded-md bg-light_bg_button dark:bg-dark_bg_button hover:shadow-md">
            Google
          </button>
          <Link href="/signup">
            <button className="p-2 mx-2 text-white rounded-md bg-light_bg_button dark:bg-dark_bg_button hover:shadow-md">
              SignUp
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

