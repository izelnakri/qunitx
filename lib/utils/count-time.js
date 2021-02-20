export default function() {
  const startTime = new Date();

  return {
    startTime: startTime,
    stop: () => +(new Date()) - (+startTime)
  };
}
