// Group controls the operator between all its children
// we can only have "and" groups and "or" groups as a single group object cannot
//   handle both "and" and "or" logical operators -- will need 2 separate groups for that
// the main action responsibilities of the Group:
//   - render child components (recursively render Statement)
//   - add clauses to self

import Statement from "./Statement";
import Select from "./Select";
import { OPERATOR } from "../App";

const Group = ({ id, operator, children, addClause, insertGroup, updateClause, updateGroup, possibleValues, tabLevel }) => {
  return (
    <div style={{ marginLeft: tabLevel * 10 }}>
      <Select name="operator" selectedValue={operator} options={Object.keys(OPERATOR)} updateValue={(value) => updateGroup(id, value)} />&#40;&nbsp;&nbsp;
      {children.map((child, i, array) => (
        <>
          <Statement expression={child} addClause={addClause} insertGroup={insertGroup} updateClause={updateClause} possibleValues={possibleValues} tabLevel={tabLevel + 1} />,
          &nbsp;&nbsp;{/* {(i !== array.length - 1) ? <>&nbsp;&nbsp;{operator}&nbsp;&nbsp;</> : <>&nbsp;&nbsp;&nbsp;</>} */}
        </>
      ))}
      <input type="button" value="+" onClick={() => addClause(id)} />
      &nbsp;&nbsp;&#41;
    </div>
  );
};

export default Group;