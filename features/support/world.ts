import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export interface ScenarioContext {
  email?: string;
  senha?: string;
  nome?: string;
  cpf?: string;
  telefone?: string;
  response?: {
    status: number;
    data: any;
    error?: string;
  };
  token?: string;
}

export class CustomWorld extends World {
  context: ScenarioContext = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  reset() {
    this.context = {};
  }
}

setWorldConstructor(CustomWorld);
