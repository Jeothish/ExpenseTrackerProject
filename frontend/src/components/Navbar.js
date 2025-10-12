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
      <Link to="/" className="nav-link">Dashboard</Link>
      <Link to="/finance" className="nav-link">Financial Management</Link>
      <Link to="/analysis" className="nav-link">Analysis</Link>
      <Link to="/AI" className="nav-link">AI Insights</Link>
      
    </div>
  )
}

export default Navbar
