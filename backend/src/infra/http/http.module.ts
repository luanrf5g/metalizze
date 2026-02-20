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
import { FetchMaterialsController } from "./controllers/fetch-materials.controller";
import { FetchMaterialsUseCase } from "@/domain/application/use-cases/fetch-materials";
import { GetMaterialByIdController } from "./controllers/get-material-by-id.controller";
import { GetMaterialByIdUseCase } from "@/domain/application/use-cases/get-material-by-id";
import { EditMaterialController } from "./controllers/edit-material.controller";
import { EditMaterialUseCase } from "@/domain/application/use-cases/edit-material";
import { DeleteMaterialController } from "./controllers/delete-material.controller";
import { DeleteMaterialUseCase } from "@/domain/application/use-cases/delete-material";
import { GetSheetByIdController } from "./controllers/get-sheet-by-id.controller";
import { GetSheetByIdUseCase } from "@/domain/application/use-cases/get-sheet-by-id";
import { FetchSheetsController } from "./controllers/fetch-sheets.controller";
import { EditSheetController } from "./controllers/edit-sheet.controller";
import { DeleteSheetUseCase } from "@/domain/application/use-cases/delete-sheet";
import { FetchSheetsUseCase } from "@/domain/application/use-cases/fetch-sheets";
import { EditSheetUseCase } from "@/domain/application/use-cases/edit-sheet";
import { DeleteSheetController } from "./controllers/delete-sheet.controller";
import { FetchInventoryMovementsController } from "./controllers/fetch-inventory-movements.controller";
import { FetchInventoryMovementsUseCase } from "@/domain/application/use-cases/fetch-inventory-movements";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateMaterialController,
    FetchMaterialsController,
    GetMaterialByIdController,
    EditMaterialController,
    DeleteMaterialController,
    CreateClientController,
    FetchClientsController,
    EditClientController,
    GetClientByDocumentController,
    DeleteClientController,
    CreateSheetController,
    GetSheetByIdController,
    ReduceSheetStockController,
    FetchSheetsController,
    EditSheetController,
    DeleteSheetController,
    FetchInventoryMovementsController
  ],
  providers: [
    RegisterMaterialUseCase,
    FetchMaterialsUseCase,
    GetMaterialByIdUseCase,
    EditMaterialUseCase,
    DeleteMaterialUseCase,
    RegisterClientUseCase,
    FetchClientsUseCase,
    GetClientByDocumentUseCase,
    EditClientUseCase,
    DeleteClientUseCase,
    RegisterSheetUseCase,
    GetSheetByIdUseCase,
    ReduceSheetStockUseCase,
    FetchSheetsUseCase,
    EditSheetUseCase,
    DeleteSheetUseCase,
    FetchInventoryMovementsUseCase
  ]
})
export class HttpModule { }