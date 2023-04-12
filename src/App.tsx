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

export const isGroup = (expression: Expression): expression is Group => {
  return expression.type === ExpressionTypes.Group;
};

// leaf node
export interface Clause extends Expression {
  comparator: COMPARATOR;
  attributeName: string;
  attributeValue: string;
};

export const isClause = (expression: Expression): expression is Clause => {
  return expression.type === ExpressionTypes.Clause;
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
    const allBreedNames = Object.keys(dogBreeds);

    // DFS to visit every node, filtering possible breeds when we visit a Clause
    const dfs = (expression: Expression | null): Set<string> => {
      if (!expression) return new Set();
      if (isClause(expression)) {
        // return a list of all the breeds that satisfy this clause from a list of all possible breeds
        // not the most optimal since ideally we should only check breeds that satisfy previously checked clauses
        return new Set(allBreedNames.filter(breedName => {
          const breedAttributes = dogBreeds[breedName];
          const breedAttributeValues = breedAttributes[expression.attributeName];
          console.log("breedAttributeValues", breedAttributeValues);
          const selectedValue = expression.attributeValue;
          const comparatorFunction = COMPARATOR_FUNCTIONS[expression.comparator];

          // compare all possible values of the given attribute (only have EQ and NEQ data types working)
          for (const value of breedAttributeValues) {
            if (comparatorFunction(value, selectedValue)) return true;
          }
          return false;
        }));
      }
      if (isGroup(expression)) {
        // need to handle OR statements
        const childrenPossibleBreeds = expression.children.map(child => dfs(child));
        if (expression.operator === OPERATOR.OR) {
          // essentially a set union; e.g. {} ∪ A ∪ B ∪ C ... etc.
          return childrenPossibleBreeds.reduce((allPossibleBreeds, possibleBreeds) => {
            for (const breed of Array.from(possibleBreeds)) {
              allPossibleBreeds.add(breed);
            }
            return allPossibleBreeds;
          }, new Set());
        } else if (expression.operator === OPERATOR.AND) {
          // essentially a set intersection; e.g. A is initial set, then (((A ∩ B) ∩ C) ∩ D ...) etc.
          const initialSet = childrenPossibleBreeds.shift() as Set<string>;
          return childrenPossibleBreeds.reduce((allPossibleBreeds, possibleBreeds) => {
            const intersection = new Set<string>();
            for (const breed of Array.from(possibleBreeds)) {
              if (allPossibleBreeds.has(breed)) intersection.add(breed);
            }
            return intersection;
          }, initialSet);
        }
        return new Set();
      }
      // should not happen, all expressions should be of type Group or Clause
      return new Set();
    };
    const possibleBreedNames = dfs(tree.current);
    setFilteredBreeds(Array.from(possibleBreedNames));
  };

  return <div>
    <div>
      <div>See the README at my <a href="https://github.com/davishuang9/dog-finder" target="_blank">GitHub</a>.</div><br />
      <div>Press + to add a clause to the group. Press G on any clause to put the clause in a new group.</div>
      <div>For ease of reading, if you need nested groups, 1st create clauses in the parent group equal to <br />
        the number of nested groups that you need, and then put each of those clauses in a new group.</div>
      <input type="button" value={"Evaluate the statement"} onClick={() => evaluateStatement()} />
    </div>
    <br />
    {tree.current && <Statement expression={tree.current} addClause={addClause} insertGroup={insertGroup} updateClause={updateClause} updateGroup={updateGroup} possibleValues={possibleValues} tabLevel={0} />}
    <br /><br />
    {filteredBreeds &&
      <>
        <div><strong>RESULTS:</strong></div>
        {filteredBreeds.map(breed => <div>{breed}</div>)}
      </>
    }
  </div>;
}

export default App;
