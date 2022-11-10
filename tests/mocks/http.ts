export const mockFetch = (status: number, body: any) => {
  return jest.spyOn(global, "fetch").mockResolvedValueOnce({
    status,
    statusText: status.toString(),
    headers: new Headers(),
    url: "",
    redirected: status >= 300 && status < 400,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValueOnce(body),
    text: jest.fn(),
    body: new ReadableStream(),
    bodyUsed: false,
    clone: jest.fn(),
    arrayBuffer: jest.fn(),
    formData: jest.fn(),
    blob: jest.fn(),
    type: "basic",
  });
};
