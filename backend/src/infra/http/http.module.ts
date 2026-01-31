import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CreateMaterialController } from "./controllers/create-material.controller";
import { RegisterMaterialUseCase } from "@/domain/application/use-cases/register-material";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateMaterialController
  ],
  providers: [
    RegisterMaterialUseCase
  ]
})
export class HttpModule { }