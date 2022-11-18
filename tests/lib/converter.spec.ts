import "jest";
import { toCamelCase, toSnakeCase } from "../../lib/internal/converter";

describe("Converters", () => {
  const simpleSnakeCase = {
    this: { is_a: "test" },
    snake_case_key: "snake_case_value",
  };
  const simpleCamelCase = {
    this: { isA: "test" },
    snakeCaseKey: "snake_case_value",
  };

  const deepSnakeCase = [
    { this_is: "the first object", with: { another_key: "nested" } },
    {
      this_is: "the_second_object",
      with: { another_array_key_nested: [{ some_thing: "here" }] },
    },
  ];
  const deepCamelCase = [
    { thisIs: "the first object", with: { anotherKey: "nested" } },
    {
      thisIs: "the_second_object",
      with: { anotherArrayKeyNested: [{ someThing: "here" }] },
    },
  ];

  describe("toCamelCase", () => {
    it("should convert snake case object to camel case", () => {
      expect(toCamelCase(simpleSnakeCase)).toEqual(simpleCamelCase);
    });

    it("should convert deep nested object array snake cased to camel case", () => {
      expect(toCamelCase(deepSnakeCase)).toEqual(deepCamelCase);
    });
  });

  describe("toSnakeCase", () => {
    it("should convert camel case object to snake case", () => {
      expect(toSnakeCase(simpleCamelCase)).toEqual(simpleSnakeCase);
    });

    it("should convert deep nested object array camel cased to snake case", () => {
      expect(toSnakeCase(deepCamelCase)).toEqual(deepSnakeCase);
    });
  });
});
