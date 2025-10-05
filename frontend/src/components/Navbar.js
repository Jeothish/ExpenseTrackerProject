import { Link } from "react-router-dom"
import "../Styles/Navbar.css"

/**
 * Creates a navigation bar to allow the user to switch between pages
 */

/**
 * @returns A navigation bar with custom styling
 */
const Navbar = () => {
  return (
    <div className='navbar'>
      <Link to="/" className="nav-link">Expenses</Link>
      <Link to="/dashboard" className="nav-link">Dashboard</Link>
      <Link to="/budget" className="nav-link">Budgets</Link>
      <Link to="/analysis" className="nav-link">Analysis</Link>
      <Link to="/AI" className="nav-link">AI Insights</Link>
      <Link to="/finance" className="nav-link">Financial Management</Link>  
    </div>
  )
}

export default Navbar
