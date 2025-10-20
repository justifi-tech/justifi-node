import "jest";
import { toCamelCase, toSnakeCase } from "../../lib/internal/converter";

describe("Converters", () => {
  const simpleSnakeCase = {
    this: { is_a: "test" },
    snake_case_key: "snake_case_value",
    metadata: { metadata_key: "metadata_value" },
  };
  const simpleCamelCase = {
    this: { isA: "test" },
    snakeCaseKey: "snake_case_value",
    metadata: { metadata_key: "metadata_value" },
  };

  const deepSnakeCase = [
    { this_is: "the first object", with: { another_key: "nested" } },
    {
      this_is: "the_second_object",
      with: { another_array_key_nested: [{ some_thing: "here" }] },
      metadata: { nested_metadata_key: [{ medatada_key: "metadata_value" }] },
    },
  ];
  const deepCamelCase = [
    { thisIs: "the first object", with: { anotherKey: "nested" } },
    {
      thisIs: "the_second_object",
      with: { anotherArrayKeyNested: [{ someThing: "here" }] },
      metadata: { nested_metadata_key: [{ medatada_key: "metadata_value" }] },
    },
  ];

  describe("toCamelCase", () => {
    it("should convert snake case object to camel case", () => {
      expect(toCamelCase(simpleSnakeCase)).toEqual(simpleCamelCase);
    });

    it("should convert deep nested object array snake cased to camel case", () => {
      expect(toCamelCase(deepSnakeCase)).toEqual(deepCamelCase);
    });

    it("should convert snake case objects to camel case including metadata keys", () => {
      const expected = {
        this: { isA: "test" },
        snakeCaseKey: "snake_case_value",
        metadata: { metadataKey: "metadata_value" },
      };
      expect(toCamelCase(simpleSnakeCase, ["metadata"])).toEqual(expected);
    });

    it("should convert deep nested object array snake cased to camel case including metadata keys", () => {
      const expected = [
        { thisIs: "the first object", with: { anotherKey: "nested" } },
        {
          thisIs: "the_second_object",
          with: { anotherArrayKeyNested: [{ someThing: "here" }] },
          metadata: { nestedMetadataKey: [{ medatadaKey: "metadata_value" }] },
        },
      ];
      expect(toCamelCase(deepSnakeCase, ["metadata"])).toEqual(expected);
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
