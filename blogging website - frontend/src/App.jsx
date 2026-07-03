// import Navbar from "./components/navbar.component";
// import { Route, Routes } from "react-router-dom";
// import UserAuthForm from "./pages/userAuthForm.page";
// import { createContext, useEffect, useState } from "react";
// import { lookInSession } from "./common/session";
// import Editor from "./pages/editor.pages";
// import Dashboard from "./pages/dashboard.page";
// export const UserContext = createContext({});

// const App = () => {
//   const [userAuth, setUserAuth] = useState();

//   useEffect(() => {
//     let userInSession = lookInSession("user");
//     userInSession
//       ? setUserAuth(JSON.parse(userInSession))
//       : setUserAuth({ access_token: null });
//   }, []);

//   return (
//     <UserContext.Provider value={{ userAuth, setUserAuth }}>
//       <Routes>
//         <Route path="/editor" element={<Editor />} />
//         <Route path="/" element={<Navbar />}>
//           <Route path="/signin" element={<UserAuthForm type="sign-in" />} />
//           <Route path="/signup" element={<UserAuthForm type="sign-up" />} />

//           <Route path="/dashboard" element={<Dashboard />}>
//             <Route
//               index
//               element={
//                 <div className="text-2xl font-medium text-dark-grey">
//                   Welcome to Dashboard
//                 </div>
//               }
//             />
//           </Route>
//         </Route>
//       </Routes>
//     </UserContext.Provider>
//   );
// };

// export default App;

import Navbar from "./components/navbar.component";
import { Route, Routes } from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import Dashboard from "./pages/dashboard.page";
import ManageBlogs from "./pages/manage-blogs.page";
import EditProfile from "./pages/edit-profile.page";
import Profile from "./pages/profile.page";
import Notifications from "./pages/notifications.page";
import Home from "./pages/home.page";
import BlogPage from "./pages/blog.page";
export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState();

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />

          <Route path="/signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="/signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/blog/:id" element={<BlogPage />} />

          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="blogs" element={<ManageBlogs />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="edit-profile" element={<EditProfile />} />
          </Route>
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
