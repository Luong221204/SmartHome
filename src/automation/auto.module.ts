import {Module} from '@nestjs/common';
import { AutoController } from "./auto.controller";
import { AutoRepo } from "./auto.repo";
import { AutoService } from "./auto.service";


@Module({
  imports: [],
  controllers: [AutoController],
  providers: [AutoRepo, AutoService],
  exports: [AutoService, AutoRepo],
})
export class AutoModule { }