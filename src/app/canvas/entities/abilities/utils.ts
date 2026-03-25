export abstract class Ability {
  marshalSave() {
    return {};
  }

  restoreFromSave(data: any): void {}
}

export abstract class Passive extends Ability {
  constructor() {
    super();
  }
  abstract run(): void;
}
