import { Public } from '@/infra/auth/decorators/public.decorator'
import { Controller, Get } from '@nestjs/common'

@Controller('/health')
export class HealthController {
  @Get()
  @Public()
  handle() {
    return {
      ok: true,
    }
  }
}