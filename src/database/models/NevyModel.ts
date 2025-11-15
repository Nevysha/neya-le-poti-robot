import { Logger } from '#nlpr/Logger.ts';
import { Model } from 'sequelize';

export type TIgnoreTimestamps = {
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Check if all given models are NevyModels
 *
 * @param modelsToCheck
 */
function assertNevyModels(
  modelsToCheck: unknown[],
): asserts modelsToCheck is NevyModel[] {
  const errors: string[] = [];
  for (const model of modelsToCheck) {
    if (!model) {
      errors.push('model is null');
      continue;
    }
    if (!NevyModel.isModel(model)) {
      errors.push(model.toString());
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid given NevyModels: ${errors.join(', ')}`);
  }
}

export abstract class NevyModel extends Model {
  /**
   * Check if the given model is a NevyModel
   *
   * @param model
   */
  static isModel = (model: unknown): boolean => model instanceof NevyModel;

  associate(models: unknown[]) {
    assertNevyModels(models);
    this.defineAssociation(models);
  }

  defineAssociation(models: Model[]): void {
    Logger.error(
      `Cannot define association for ${this.constructor.name} for models: ${models.map((model) => model.constructor.name).join(', ')}`,
    );
  }
}
