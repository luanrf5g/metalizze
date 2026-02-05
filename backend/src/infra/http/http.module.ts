import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CreateMaterialController } from "./controllers/create-material.controller";
import { RegisterMaterialUseCase } from "@/domain/application/use-cases/register-material";
import { CreateSheetController } from "./controllers/create-sheet.controller";
import { RegisterSheetUseCase } from "@/domain/application/use-cases/register-sheet";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateMaterialController,
    CreateSheetController
  ],
  providers: [
    RegisterMaterialUseCase,
    RegisterSheetUseCase
  ]
})
export class HttpModule { }