import './App.css';

import React, { useEffect, useRef, useState } from 'react';
import { getAllDogData } from './apis';

import { generateInitialStatement, createNewClause, createNewGroup } from './utils';
import Statement from './components/Statement';


// logical operators
export enum OPERATOR {
  AND = "AND",
  OR = "OR",
}

export enum COMPARATOR {
  EQ = "==",
  NEQ = "!=",
  GTE = ">=",
  GT = ">",
  LTE = "<=",
  LT = "<",
}

const COMPARATOR_FUNCTIONS = {
  [COMPARATOR.EQ]: (a, b) => (a === b),
  [COMPARATOR.NEQ]: (a, b) => (a !== b),
  [COMPARATOR.GTE]: (a, b) => (a >= b),
  [COMPARATOR.GT]: (a, b) => (a > b),
  [COMPARATOR.LTE]: (a, b) => (a <= b),
  [COMPARATOR.LT]: (a, b) => (a < b),
};

export enum ExpressionTypes {
  Group = "Group",
  Clause = "Clause",
}

// essentially the base node for our n-ary tree
// in the statement, an expression will represent a logical operator (AND, OR)
//   or a comparator (==, !=, >=, etc.)
export interface Expression {
  id: string;
  type: ExpressionTypes;
  parentId: string | null;
}

// branch node
export interface Group extends Expression {
  operator: OPERATOR;
  children: [Group | Clause];
};

// leaf node
export interface Clause extends Expression {
  comparator: COMPARATOR;
  attributeName: string;
  attributeValue: string;
};


function App() {
  const [dogBreeds, setDogBreeds] = useState<object | null>(null);
  const [possibleValues, setPossibleValues] = useState(null);
  const [filteredBreeds, setFilteredBreeds] = useState<any | null>(null);
  useEffect(() => {
    const _getAllDogData = async () => {
      const [breeds, possibleValues] = await getAllDogData();
      setDogBreeds(breeds);
      setPossibleValues(possibleValues);
    };

    _getAllDogData();
  }, []);

  const [hash, setHash] = useState({});
  const tree = useRef<Expression | null>(null);
  useEffect(() => {
    if (dogBreeds !== null && tree.current === null) {
      const [initialHash, initialTree] = generateInitialStatement();
      setHash(initialHash);
      tree.current = initialTree;
    }
  }, [dogBreeds]);

  const insertGroup = (childId) => {
    console.log("insert group");
    // find relevant nodes
    const child = hash[childId];
    const parent = hash[child.parentId];

    // create new group and insert into tree
    const newGroup = createNewGroup();

    // relink parent
    const index = parent.children.findIndex(c => c.id === child.id);
    parent.children[index] = newGroup;
    newGroup.parentId = parent.id;

    // relink child
    child.parentId = newGroup.id;
    newGroup.children = [child];

    // add new group to hash and rerender
    hash[newGroup.id] = newGroup;
    setHash({ ...hash });
  };

  const addClause = (parentId) => {
    console.log("add clause");
    // create the new clause and insert into tree
    const newClause = createNewClause();
    newClause.parentId = parentId;
    const parent = hash[parentId];
    parent.children.push(newClause);

    // add new claue to hash and rerender
    hash[newClause.id] = newClause;
    setHash({ ...hash });
  };

  const updateClause = (id, name, value, comparator) => {
    console.log('update clause', id, name, value, comparator);
    const clause = hash[id];
    clause.attributeName = name;
    clause.attributeValue = value;
    clause.comparator = comparator;
    setHash({ ...hash });
  };

  const updateGroup = (id, operator) => {
    console.log('update group', id, operator);
    const group = hash[id];
    group.operator = operator;
    setHash({ ...hash });
  };

  const evaluateStatement = () => {
    if (dogBreeds === null) return;
    let possibleBreedNames = Object.keys(dogBreeds);

    // DFS to visit every node, filtering possible breeds when we visit a Clause
    const dfs = (node) => {
      console.log(node);
      if (node.type === ExpressionTypes.Clause) {
        possibleBreedNames = possibleBreedNames.filter(breedName => {
          const breedAttributes = dogBreeds[breedName];
          const breedAttributeValues = breedAttributes[node.attributeName];
          const selectedValue = node.attributeValue;
          const comparatorFunction = COMPARATOR_FUNCTIONS[node.comparator];
          for (const value of breedAttributeValues) {
            if (comparatorFunction(value, selectedValue)) return true;
          }
          return false;
        });
      }
      if (node.type === ExpressionTypes.Group) {
        // need to handle OR statements
        node.children.forEach(child => dfs(child));
      }
    };
    dfs(tree.current);
    setFilteredBreeds(possibleBreedNames);
  };

  return <div>
    <div>
      Press + to add a clause to the group. Press G on any clause to put the clause in a new group.<br />
      <input type="button" value={"Evaluate the statement"} onClick={() => evaluateStatement()} />
    </div>
    <br />
    {tree.current && <Statement node={tree.current} addClause={addClause} insertGroup={insertGroup} updateClause={updateClause} updateGroup={updateGroup} possibleValues={possibleValues} tabLevel={0} />}
    <br /><br />
    {filteredBreeds && filteredBreeds.map(breed => <div>{breed}</div>)}
  </div>;
}

export default App;
