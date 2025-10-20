export const toCamelCase = (obj: any, including_keys: string[] = []): any => {
  const excluding_keys = ["metadata"].filter(item => !including_keys.includes(item));

  if (obj === Object(obj) && !Array.isArray(obj) && typeof obj !== "function") {
    const converted: any = {};

    Object.keys(obj).forEach((k) => {
      if(excluding_keys.includes(k)) {
        converted[k] = obj[k]
      } else {
        converted[convertCamelCase(k)] = toCamelCase(obj[k], including_keys);
      }
    });

    return converted;
  } else if (Array.isArray(obj)) {
    return obj.map((i) => {
      return toCamelCase(i, including_keys);
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
