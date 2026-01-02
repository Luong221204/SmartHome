import { Controller } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
@Controller()
@Roles('user')
export class SensorController {
    
}