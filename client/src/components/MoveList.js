// MoveList.js
import React from 'react';
import './MoveList.css';

const MoveList = ({ moves }) => {
  return (
    <div className="move-list">
      <h5>Moves</h5>
      <div className="moves">
          {moves.map((move, index) => 
          <div key={index}
            data-number={Math.floor(index/2)+1}>{move.move}
          </div>
        )}

      </div>
       
      </div>
  );
};

export default MoveList;
