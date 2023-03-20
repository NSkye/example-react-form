export const toSubscribtionName = <T extends string>(name: T): `name:${T}` => `name:${name}`;
