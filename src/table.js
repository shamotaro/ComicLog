import React from 'react'
import ReactFlexyTable from "react-flexy-table"
import "react-flexy-table/dist/index.css"
 
const Table = () => {
  const data = [
    { label: "Grapes 🍇", value: "grapes" },
    { label: "Mango 🥭", value: "mango" },
    { label: "Strawberry 🍓", value: "strawberry" },
  ];
  return (    
    <div>
      <ReactFlexyTable data={data} />   
    </div>
  );
}
 
export default Table;