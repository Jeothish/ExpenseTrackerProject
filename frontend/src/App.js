import "./Styles/List.css"
import "./Styles/index.css"
import Navbar from "./components/Navbar"
import {Routes, Route} from "react-router-dom"

import { DataProvider } from "./Context/DataContext"
import Analysis from "./Pages/Analysis"

import AI from "./Pages/AI"
import FinancialManagement from "./Pages/FinancialManagement"
import Dashboard from "./Pages/Dashboard"
const App = () => {

  return (
    <>
    <DataProvider>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path="/analysis" element={<Analysis/>} />
      <Route path="/AI" element={<AI/>} />
      <Route path="/finance" element={<FinancialManagement/>} />
      
    </Routes>
    </DataProvider>    
    </>
  )
}



export default App