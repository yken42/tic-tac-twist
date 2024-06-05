const Tile = ({ value, onClick, playerTurn }) => {
    let colorClass = value === 'X' ? 'x-color' : 'o-color';
    let hoverClass = null;
    if(value == null){
        hoverClass = `${playerTurn.toLowerCase()}-hover`;
    }

    return ( 
        <div onClick={onClick} className={`tile ${hoverClass} ${colorClass} `}>{value}</div>
     );
}
 
export default Tile;