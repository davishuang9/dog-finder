// Clause will controls which attribute is being selected and the value it's being compared to
// comparators can be of [==, !=, >=, >, <=, <] for types that make sense
// Clauses have no children

import { useEffect, useState } from "react";
import { COMPARATOR } from "../App";
import Select from "./Select";

const Clause = ({ id, comparator, attributeName, attributeValue, possibleValues, insertGroup, updateClause }) => {
  console.log("comparator, attributeName, attributeValue", comparator, attributeName, attributeValue);
  const [selectedName, setSelectedName] = useState(attributeName);
  const [selectedValue, setSelectedValue] = useState(attributeValue);
  const [selectedComparator, setSelectedComparator] = useState(comparator);
  useEffect(() => {
    if (selectedName !== attributeName || selectedValue !== attributeValue || selectedComparator !== comparator) {
      updateClause(id, selectedName, selectedValue, selectedComparator);
    }
  }, [id, attributeName, attributeValue, comparator, selectedName, selectedValue, selectedComparator, updateClause]);
  return (
    <>
      <Select name="attributeName" selectedValue={selectedName} options={Object.keys(possibleValues)} updateValue={setSelectedName} />&nbsp;
      <Select name="comparator" selectedValue={selectedComparator} options={Object.values(COMPARATOR)} updateValue={setSelectedComparator} />&nbsp;
      <Select name="attributeValue" selectedValue={selectedValue} options={[...possibleValues[selectedName]]} updateValue={setSelectedValue} />&nbsp;
      <input type="button" value="G" onClick={() => insertGroup(id)} />
    </>
  );
};

export default Clause;