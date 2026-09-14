import {Routes, Route, Navigate} from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPage from "./pages/AdminPage";
import AdminCreate from "./components/AdminCreate";
import AdminUpdate from "./components/AdminUpdate";
import AdminDelete from "./components/AdminDelete";
import AdminAdd from "./components/AdminAdd";
import AdminUpdateProblem from "./components/AdminUpdateProblem";
import ProblemPage from "./pages/ProblemPage";

function App() {
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);
  
  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <>
        <Routes>
          <Route path="/" element={isAuthenticated ?<HomePage></HomePage>:<Navigate to="/signup" />}></Route>
          <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<LoginPage></LoginPage>}></Route>
          <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<SignupPage></SignupPage>}></Route>
          <Route path="/admin" element={isAuthenticated && user.role==="admin"?<AdminPage></AdminPage>:<Navigate to="/" />}></Route>
          <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminCreate /> : <Navigate to="/" />} />
          <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
          <Route path="/admin/update/problem/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdateProblem /> : <Navigate to="/" />} />
          <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
          <Route path="/admin/add" element={isAuthenticated && user?.role === 'admin' ? <AdminAdd /> : <Navigate to="/" />} />
          <Route path="/problem/:problemId" element={isAuthenticated ?<ProblemPage/>:<Navigate to="/signup" />}></Route>
        </Routes>
    </>
  )
}

export default App
