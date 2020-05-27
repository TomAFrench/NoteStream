const isExternal = (url: string): boolean => {
  return url.startsWith('https');
};

export default isExternal;
