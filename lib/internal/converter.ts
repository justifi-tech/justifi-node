export const toCamelCase = (obj: any, excluding_keys: string[] = []): any => {
  if (obj === Object(obj) && !Array.isArray(obj) && typeof obj !== "function") {
    const converted: any = {};
    Object.keys(obj).forEach((k) => {
      if(excluding_keys.includes(k)) {
        converted[convertCamelCase(k)] = obj[k];
      } else {
        converted[convertCamelCase(k)] = toCamelCase(obj[k], excluding_keys);
      }
    });

    return converted;
  } else if (Array.isArray(obj)) {
    return obj.map((i) => {
      return toCamelCase(i, excluding_keys);
    });
  }

  return obj;
};

const convertCamelCase = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

export const toSnakeCase = (obj: any): any => {
  if (obj === Object(obj) && !Array.isArray(obj) && typeof obj !== "function") {
    const converted: any = {};
    Object.keys(obj).forEach((k) => {
      converted[convertSnakeCase(k)] = toSnakeCase(obj[k]);
    });

    return converted;
  } else if (Array.isArray(obj)) {
    return obj.map((i) => {
      return toSnakeCase(i);
    });
  }

  return obj;
};

const convertSnakeCase = (s: string): string => {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};
