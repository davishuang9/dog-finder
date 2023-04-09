import { COMPARATOR, ExpressionTypes, OPERATOR } from './App';

const DEFAULT_ATTRIBUTE_NAME = "country of origin";
const DEFUALT_ATTRIBUTE_VALUE = "united states";

export const generateUUID = () => {
  let uuid = null;
  try {
    uuid = crypto.randomUUID();
  } catch (error) {
    console.error("Try over https or crypto is not supported by your browser");
    throw error;
  }
  return uuid;
};

// generate the initial statement, which is Group with one child clause
// returns 2 objects, a hash (object) of all the statements and a tree-like structure
export const generateInitialStatement = () => {
  const initialClause = {
    id: generateUUID(),
    type: ExpressionTypes.Clause,
    comparator: COMPARATOR.EQ,
    attributeName: DEFAULT_ATTRIBUTE_NAME,
    attributeValue: DEFUALT_ATTRIBUTE_VALUE,
  };
  const initialGroup = {
    id: generateUUID(),
    type: ExpressionTypes.Group,
    operator: OPERATOR.AND,
    children: [
      initialClause,
    ],
  };
  initialClause.parentId = initialGroup.id;
  const hash = {};
  hash[initialClause.id] = initialClause;
  hash[initialGroup.id] = initialGroup;
  return [
    hash,
    initialGroup,
  ];
};

export const createNewClause = () => {
  return {
    id: generateUUID(),
    type: ExpressionTypes.Clause,
    comparator: COMPARATOR.EQ,
    attributeName: DEFAULT_ATTRIBUTE_NAME,
    attributeValue: DEFUALT_ATTRIBUTE_VALUE,
  };
};

export const createNewGroup = () => {
  return {
    id: generateUUID(),
    type: ExpressionTypes.Group,
    parentId: null,
    operator: OPERATOR.AND,
    children: [],
  };
};

// simple dfs search to find the node with the relevant ID
export const findNode = (id, node) => {
  // base case -- shouldn't happen since no group's point to null children
  if (!node) return null;
  // if this is the node, return it
  if (node.id === id) return node;
  // recursive case with reduce -- just return the foundNode or continue to search if not yet found
  if (node.children && node.children.length > 0)
    return node.children.reduce((foundNode, child) => foundNode || findNode(id, child), null);
  // if no children, then we're at a leaf node, return null
  return null;
};
