import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from './Schemas/role.schema';


@Controller('roles')
export class DictionaryController{
  constructor (private authService: AuthService){}
  @Get()
  async getAllRoles(): Promise<Role[]> {
     return this.authService.getAllRoles();
  } 

}