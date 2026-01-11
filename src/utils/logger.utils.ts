export const errorLogger = (err: any) => {
  console.log('\x1b[31m%s\x1b[0m', "\n--->>> START OF ERROR LOGGER ...." + new Date())
  const calledFunction = () => {
    const callStack = new Error().stack?.split('at ');
    return callStack?.[3].replace("\n", "");
  };

  console.log('\x1b[31m%s\x1b[0m', "CALLED FUNCTION:")
  console.log(calledFunction());
  console.log("Error:", err);
  console.log('\x1b[31m%s\x1b[0m', `END OF ERROR LOGGER\n`)
};
