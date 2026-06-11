import { Worker } from '../../domain/entities/Worker';

/**
 * Strategy Pattern — define uma família de algoritmos de filtro
 * intercambiáveis sem alterar o código que os utiliza.
 */
export interface IWorkerFilterStrategy {
  filter(workers: Worker[]): Worker[];
}
