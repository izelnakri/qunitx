import kleur from 'kleur';

export default async function runUserModule(modulePath, params, scriptPosition) {
  try {
    let func = await import(modulePath);
    if (func) {
      func.default ?
        await func.default(params) :
        typeof func === 'function' ? await func(params) : null;
    }
  } catch (error) {
    console.log('#', kleur.red(`QUnitX ${scriptPosition} script failed:`));
    console.trace(error);
    console.error(error);

    return process.exit(1);
  }
}
