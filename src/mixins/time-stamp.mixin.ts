import {MixinTarget} from '@loopback/core';
import moment from 'moment';

export function TimeStampMixin<T extends MixinTarget<object>>(baseClass: T) {
  return class extends baseClass {
    createdOn: string;
    updatedOn: string;
    constructor(...args: any[]) {
      super(args);
      this.createdOn = moment().toISOString();
      this.updatedOn = moment().toISOString();
    }
  };
}
