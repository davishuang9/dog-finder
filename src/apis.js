import dog_breeds from './dog_breeds.csv';

const _sanitize = (s) => {
  return s.replace(/\r/g, "").toLowerCase();
};

export const getAllDogData = async () => {
  const data = await fetch(dog_breeds);
  const text = await data.text();
  // read the csv line by line
  const lines = text.split("\n");
  // grab the header line and keep everything but the breed name
  const attributeNames = lines.shift().split(",").slice(1).map(_sanitize);
  const attributePossibleValues = {};
  for (const attributeName of attributeNames) {
    attributePossibleValues[attributeName] = new Set();
  }

  // dogs is a map of a dog breed's name to its attributes
  const dogBreeds = {};
  for (const line of lines) {
    // for every line, grab the values as a list and the breedName as a separate value; do a lot of sanitizing
    const attributeValues = line.split("\"").flatMap((el, i) => i % 2 === 0 ? el.split(",") : el).map(_sanitize).filter((el) => el.length > 0);
    const breedName = attributeValues.shift();

    // create a map of a breed's attribute names mapped to their values
    const dogBreedAttributes = {};
    for (let i = 0; i < attributeNames.length; i++) {
      const values = attributeValues[i].split(", ").map(_sanitize);
      dogBreedAttributes[attributeNames[i]] = values;

      // also add to possible attribute values
      const valueSet = attributePossibleValues[attributeNames[i]];
      for (const value of values) {
        valueSet.add(value);
      }
    }

    // insert the dog breed and its attributes into the resulting map
    dogBreeds[breedName] = dogBreedAttributes;
  }

  // return data structures
  return [dogBreeds, attributePossibleValues];
};