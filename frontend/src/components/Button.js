import "../Styles/button.css"

/**
 * Creates a button which contains functionality when triggered
 */


/**
 * @param {String} props.className - CSS class for styling the button
 * @param {String} props.text - Text shown inside the button
 * @param {function} props.onClick - Callback function triggered when a button is clicked
 * 
 * @returns {JSX.Element} - A button with functionality when clicked
 */

const Button = ({className,text,onClick}) => {
  return (
    <button 
    onClick={onClick}  className={`btn ${className}`}>
      
      {text}
    </button>
  )
}
export default Button
