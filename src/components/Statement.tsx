// the node structure is an n-ary tree
// the Statement component will handle the rendering of the n-ary tree
//   Groups are branch nodes with n number of children
//   Clauses are leaf nodes
// we can insert a group on top of any clause; i.e. we insert a branch node
//   over the leaf node and the leaf node becomes the branch node's child
// we can append a clause to any group
// we will render the tree "recursively" with Groups/branch nodes recursively rendering
//   a Statement for every child of the Group

import { Expression, ExpressionTypes } from '../App';
import Group from './Group';
import Clause from './Clause';
import React from 'react';

const Statement = ({ node, addClause, insertGroup, updateClause, updateGroup, possibleValues, tabLevel }: {
  node: Expression;
  addClause: (id: string) => void;
  insertGroup: (id: string) => void;
  updateClause: (id: string, name: string, value: string, comparator: string) => void;
  updateGroup: (id: string, operator: string) => void;
  possibleValues: object | null;
  tabLevel: number;
}) => {
  let NodeElement;
  if (node && node.type === ExpressionTypes.Group) {
    NodeElement = <Group {...node} addClause={addClause} insertGroup={insertGroup} updateClause={updateClause} updateGroup={updateGroup} possibleValues={possibleValues} tabLevel={tabLevel} />;
  } else if (node && node.type === ExpressionTypes.Clause) {
    NodeElement = <Clause {...node} possibleValues={possibleValues} insertGroup={insertGroup} updateClause={updateClause} />;
  }
  return !!NodeElement ? NodeElement : null;
};

export default Statement;
