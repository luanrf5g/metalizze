import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CreateMaterialController } from "./controllers/create-material.controller";
import { RegisterMaterialUseCase } from "@/domain/application/use-cases/register-material";
import { CreateSheetController } from "./controllers/create-sheet.controller";
import { RegisterSheetUseCase } from "@/domain/application/use-cases/register-sheet";
import { CreateClientController } from "./controllers/create-client.controller";
import { RegisterClientUseCase } from "@/domain/application/use-cases/register-client";
import { ReduceSheetStockController } from "./controllers/reduce-sheet-stock.controller";
import { ReduceSheetStockUseCase } from "@/domain/application/use-cases/reduce-sheet-stock";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateMaterialController,
    CreateSheetController,
    CreateClientController,
    ReduceSheetStockController
  ],
  providers: [
    RegisterMaterialUseCase,
    RegisterSheetUseCase,
    RegisterClientUseCase,
    ReduceSheetStockUseCase,
  ]
})
export class HttpModule { }