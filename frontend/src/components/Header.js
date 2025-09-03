
import "../Styles/header.css"

/**
 * Creates a heaer which displays the title of the page
 */

/**
 * @param {String} props.title - CSS class for styling the button
 * 
 * @returns {JSX.Element} - A Header
 */

const Header = ({title}) => {
  return (
    <div className="header">
        {title}
    </div>
  )
}

export default Header
