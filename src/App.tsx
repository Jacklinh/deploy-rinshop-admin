// import react router dom
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import pages
import LayoutAdmin from "./components/layouts/LayoutAdmin";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NoPage from "./pages/NoPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import './App.css'
import ProductPage from "./pages/Products";
import EditProduct from "./pages/Products/EditProduct";
import AddProduct from "./pages/Products/AddProduct";
import Staffs from "./pages/Staffs";
import Categories from "./pages/Categories";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Carousel from "./pages/Carousel";
const queryClient = new QueryClient();
function App() {


  return (
    <>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
            <Routes>
                <Route path="/" element={<LayoutAdmin />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductPage />} />
                    <Route path="products/:id" element={<EditProduct />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="staffs" element={<Staffs />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="/profile" element={<Profile />} />

                    <Route path="/carousel" element={<Carousel />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="*" element={<NoPage />} />
            </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </>
  )
}

export default App
