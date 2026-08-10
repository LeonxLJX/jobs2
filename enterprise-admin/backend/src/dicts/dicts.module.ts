import { Module } from '@nestjs/common';
import { DictsService } from './dicts.service';
import { DictTypesController, DictItemsController } from './dicts.controller';

@Module({
  controllers: [DictTypesController, DictItemsController],
  providers: [DictsService],
  exports: [DictsService],
})
export class DictsModule {}
