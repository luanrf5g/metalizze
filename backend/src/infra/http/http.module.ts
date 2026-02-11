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
import { EditClientController } from "./controllers/edit-client.controller";
import { EditClientUseCase } from "@/domain/application/use-cases/edit-client";
import { GetClientByDocumentController } from "./controllers/get-client-by-document.controller";
import { GetClientByDocumentUseCase } from "@/domain/application/use-cases/get-client-by-document";
import { FetchClientsController } from "./controllers/fetch-clients.controller";
import { FetchClientsUseCase } from "@/domain/application/use-cases/fetch-clients";
import { DeleteClientController } from "./controllers/delete-client.controller";
import { DeleteClientUseCase } from "@/domain/application/use-cases/delete-client";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateMaterialController,
    CreateSheetController,
    CreateClientController,
    ReduceSheetStockController,
    EditClientController,
    GetClientByDocumentController,
    FetchClientsController,
    DeleteClientController
  ],
  providers: [
    RegisterMaterialUseCase,
    RegisterSheetUseCase,
    RegisterClientUseCase,
    ReduceSheetStockUseCase,
    EditClientUseCase,
    GetClientByDocumentUseCase,
    FetchClientsUseCase,
    DeleteClientUseCase
  ]
})
export class HttpModule { }