import { BrowserRouter, Routes, Route ,Navigate  } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from 'react-hot-toast';
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import AddAccount from "./component/AddAcount";
import DeleteAccount from "./component/DeleteAcount";
import AddCoins from "./component/AddCoins";
import AddUnion from "./component/AddUnion";
import DeleteUnion from "./component/DeleteUnion";
import AddOffer from "./component/AddOffer";
import DeleteOffer from "./component/DeleteOffer";
import ProtectedRoute from "./routes/ProtectedRoute";
import Loading from "./component/Loading";
import './App.css'
import Welcomepage from "./pages/Welcomepage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UploadAd from "./component/UploadAd";
import Confirmpassword from "./pages/Confirmpassword";
import Dashboardunion from "./pages/Dashboardunion";
import DashboardLabTests from "./pages/DashboardLabTests";
import Addads from "./pages/Addads";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading/>}>
    <Toaster position="top-center" reverseOrder={false} />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcomepage/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/confirmpassword" element={<Confirmpassword/>} />

          {/* Protected Layout */}
          <Route path="/app" element={<Home/>}>
              {/* <Route index element={<Navigate to="add-account" replace />} />
            <Route path="add-account" element={<AddAccount/>} />
            <Route path="delete-account" element={<DeleteAccount />} />
            <Route path="add-coins" element={<AddCoins />} />
            <Route path="add-union" element={<AddUnion />} />
            <Route path="delete-union" element={<DeleteUnion />} />
            <Route path="add-offer" element={<AddOffer />} />
            <Route path="delete-offer" element={<DeleteOffer />} />
             <Route path="uploadad" element={<UploadAd/>} /> */}
           <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<Dashboard/>} />
            <Route path="labtests" element={<DashboardLabTests/>} />
            <Route path="unions" element={<Dashboardunion/>} />
            <Route path="ads" element={<Addads/>} />
            {/* <Route path="qq" element={<QuickLabUpload/>}/> */}
            
           

          </Route>
           {/* <Route path="addads" element={<Addads/>} />
            <Route path="dashboardlabtests" element={<DashboardLabTests/>} />
           <Route path="dashboardunion" element={<Dashboardunion/>} />
           <Route path="dashboard" element={<Dashboard/>} /> */}
           <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
