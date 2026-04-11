import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AuthModule } from "../auth/auth.module";

// Material
import { CreateMaterialController } from "./controllers/create-material.controller";
import { RegisterMaterialUseCase } from "@/domain/application/use-cases/register-material";
import { FetchMaterialsController } from "./controllers/fetch-materials.controller";
import { FetchMaterialsUseCase } from "@/domain/application/use-cases/fetch-materials";
import { GetMaterialByIdController } from "./controllers/get-material-by-id.controller";
import { GetMaterialByIdUseCase } from "@/domain/application/use-cases/get-material-by-id";
import { EditMaterialController } from "./controllers/edit-material.controller";
import { EditMaterialUseCase } from "@/domain/application/use-cases/edit-material";
import { DeleteMaterialController } from "./controllers/delete-material.controller";
import { DeleteMaterialUseCase } from "@/domain/application/use-cases/delete-material";

// Sheet
import { CreateSheetController } from "./controllers/create-sheet.controller";
import { RegisterSheetUseCase } from "@/domain/application/use-cases/register-sheet";
import { GetSheetByIdController } from "./controllers/get-sheet-by-id.controller";
import { GetSheetByIdUseCase } from "@/domain/application/use-cases/get-sheet-by-id";
import { ReduceSheetStockController } from "./controllers/reduce-sheet-stock.controller";
import { ReduceSheetStockUseCase } from "@/domain/application/use-cases/reduce-sheet-stock";
import { FetchSheetsController } from "./controllers/fetch-sheets.controller";
import { FetchSheetsUseCase } from "@/domain/application/use-cases/fetch-sheets";
import { FetchAllSheetsController } from "./controllers/fetch-all-sheets.controller";
import { FetchAllSheetsUseCase } from "@/domain/application/use-cases/fetch-all-sheets";
import { EditSheetController } from "./controllers/edit-sheet.controller";
import { EditSheetUseCase } from "@/domain/application/use-cases/edit-sheet";
import { DeleteSheetController } from "./controllers/delete-sheet.controller";
import { DeleteSheetUseCase } from "@/domain/application/use-cases/delete-sheet";
import { RegisterSheetCutController } from "./controllers/register-sheet-cut.controller";
import { RegisterSheetCutUseCase } from "@/domain/application/use-cases/register-sheet-cut";

// Profile
import { CreateProfileController } from "./controllers/create-profile.controller";
import { RegisterProfileUseCase } from "@/domain/application/use-cases/register-profile";
import { FetchProfilesController } from "./controllers/fetch-profiles.controller";
import { FetchProfilesUseCase } from "@/domain/application/use-cases/fetch-profiles";
import { FetchAllProfilesController } from "./controllers/fetch-all-profiles.controller";
import { FetchAllProfilesUseCase } from "@/domain/application/use-cases/fetch-all-profiles";
import { GetProfileByIdController } from "./controllers/get-profile-by-id.controller";
import { GetProfileByIdUseCase } from "@/domain/application/use-cases/get-profile-by-id";
import { EditProfileController } from "./controllers/edit-profile.controller";
import { EditProfileUseCase } from "@/domain/application/use-cases/edit-profile";
import { DeleteProfileController } from "./controllers/delete-profile.controller";
import { DeleteProfileUseCase } from "@/domain/application/use-cases/delete-profile";
import { ReduceProfileStockController } from "./controllers/reduce-profile-stock.controller";
import { ReduceProfileStockUseCase } from "@/domain/application/use-cases/reduce-profile-stock";
import { RegisterProfileCutController } from "./controllers/register-profile-cut.controller";
import { RegisterProfileCutUseCase } from "@/domain/application/use-cases/register-profile-cut";

// Client
import { CreateClientController } from "./controllers/create-client.controller";
import { RegisterClientUseCase } from "@/domain/application/use-cases/register-client";
import { FetchClientsController } from "./controllers/fetch-clients.controller";
import { FetchClientsUseCase } from "@/domain/application/use-cases/fetch-clients";
import { EditClientController } from "./controllers/edit-client.controller";
import { EditClientUseCase } from "@/domain/application/use-cases/edit-client";
import { GetClientByDocumentController } from "./controllers/get-client-by-document.controller";
import { GetClientByDocumentUseCase } from "@/domain/application/use-cases/get-client-by-document";
import { DeleteClientController } from "./controllers/delete-client.controller";
import { DeleteClientUseCase } from "@/domain/application/use-cases/delete-client";

// Inventory Movements
import { FetchInventoryMovementsController } from "./controllers/fetch-inventory-movements.controller";
import { FetchInventoryMovementsUseCase } from "@/domain/application/use-cases/fetch-inventory-movements";
import { RegisterInventoryMovementController } from "./controllers/register-inventory-movement.controller";
import { RegisterInventoryMovementUseCase } from "@/domain/application/use-cases/register-inventory-movements";

// Metrics
import { GetDashboardMetricsController } from "./controllers/get-dashboard-metrics.controller";
import { GetDashboardCardsMetricsUseCase } from "@/domain/application/use-cases/get-dashboard-cards-metrics";
import { GetInventoryMovementsMetricsController } from "./controllers/get-inventory-movements-metrics.controller";
import { GetInventoryMovementsMetricsUseCase } from "@/domain/application/use-cases/get-inventory-movements-metrics";
import { GetReportsMetricsController } from "./controllers/get-reports-metrics.controller";
import { GetReportsMetricsUseCase } from "@/domain/application/use-cases/get-reports-metrics";
import { AnalyticsService } from "@/domain/application/services/analytics.service";

// Additional Services
import { CreateAdditionalServiceController } from "./controllers/create-additional-service.controller";
import { CreateAdditionalServiceUseCase } from "@/domain/application/use-cases/create-additional-service";
import { FetchAdditionalServicesController } from "./controllers/fetch-additional-services.controller";
import { FetchAdditionalServicesUseCase } from "@/domain/application/use-cases/fetch-additional-services";
import { EditAdditionalServiceController } from "./controllers/edit-additional-service.controller";
import { EditAdditionalServiceUseCase } from "@/domain/application/use-cases/edit-additional-service";
import { ToggleAdditionalServiceActiveController } from "./controllers/toggle-additional-service-active.controller";
import { ToggleAdditionalServiceActiveUseCase } from "@/domain/application/use-cases/toggle-additional-service-active";

// Setup Rate
import { CreateSetupRateController } from "./controllers/create-setup-rate.controller";
import { CreateSetupRateUseCase } from "@/domain/application/use-cases/create-setup-rate";
import { FetchSetupRatesController } from "./controllers/fetch-setup-rates.controller";
import { FetchSetupRatesUseCase } from "@/domain/application/use-cases/fetch-setup-rates";
import { EditSetupRateController } from "./controllers/edit-setup-rate.controller";
import { EditSetupRateUseCase } from "@/domain/application/use-cases/edit-setup-rate";
import { ToggleSetupRateActiveController } from "./controllers/toggle-setup-rate-active.controller";
import { ToggleSetupRateActiveUseCase } from "@/domain/application/use-cases/toggle-setup-rate-active";

// Quote
import { CreateQuoteUseCase } from "@/domain/application/use-cases/create-quote";
import { AddQuoteItemUseCase } from "@/domain/application/use-cases/add-quote-item";
import { CalculateQuoteTotalsUseCase } from "@/domain/application/use-cases/calculate-quote-totals";
import { FetchQuotesUseCase } from "@/domain/application/use-cases/fetch-quotes";
import { GetQuoteByIdUseCase } from "@/domain/application/use-cases/get-quote-by-id";
import { UpdateQuoteUseCase } from "@/domain/application/use-cases/update-quote";
import { UpdateQuoteItemUseCase } from "@/domain/application/use-cases/update-quote-item";
import { RemoveQuoteItemUseCase } from "@/domain/application/use-cases/remove-quote-item";
import { ReplaceQuoteItemServicesUseCase } from "@/domain/application/use-cases/replace-quote-item-services";
import { TransitionQuoteStatusUseCase } from "@/domain/application/use-cases/transition-quote-status";

// Cutting Gas
import { CreateCuttingGasController } from "./controllers/create-cutting-gas.controller";
import { RegisterCuttingGasUseCase } from "@/domain/application/use-cases/register-cutting-gas";
import { FetchCuttingGasesController } from "./controllers/fetch-cutting-gases.controller";
import { FetchCuttingGasesUseCase } from "@/domain/application/use-cases/fetch-cutting-gases";
import { EditCuttingGasController } from "./controllers/edit-cutting-gas.controller";
import { EditCuttingGasUseCase } from "@/domain/application/use-cases/edit-cutting-gas";
import { ToggleCuttingGasActiveController } from "./controllers/toggle-cutting-gas-active.controller";
import { ToggleCuttingGasActiveUseCase } from "@/domain/application/use-cases/toggle-cutting-gas-active";
import { GetCuttingGasByIdController } from "./controllers/get-cutting-gas-by-id.controller";
import { GetCuttingGasByIdUseCase } from "@/domain/application/use-cases/get-cutting-gas-by-id";

// Auth & Users
import { AuthenticateController } from "./controllers/authenticate.controller";
import { AuthenticateUserUseCase } from "@/domain/application/use-cases/authenticate-user";
import { GetMeController } from "./controllers/get-me.controller";
import { GetCurrentUserUseCase } from "@/domain/application/use-cases/get-current-user";
import { CreateUserController } from "./controllers/create-user.controller";
import { RegisterUserUseCase } from "@/domain/application/use-cases/register-user";
import { FetchUsersController } from "./controllers/fetch-users.controller";
import { FetchUsersUseCase } from "@/domain/application/use-cases/fetch-users";
import { EditUserController } from "./controllers/edit-user.controller";
import { EditUserUseCase } from "@/domain/application/use-cases/edit-user";
import { DeleteUserController } from "./controllers/delete-user.controller";
import { DeleteUserUseCase } from "@/domain/application/use-cases/delete-user";
import { HealthController } from "./controllers/health.controller";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    HealthController,
    // Material
    CreateMaterialController,
    FetchMaterialsController,
    GetMaterialByIdController,
    EditMaterialController,
    DeleteMaterialController,
    // Client
    CreateClientController,
    FetchClientsController,
    EditClientController,
    GetClientByDocumentController,
    DeleteClientController,
    // Sheet
    CreateSheetController,
    GetSheetByIdController,
    ReduceSheetStockController,
    FetchSheetsController,
    FetchAllSheetsController,
    EditSheetController,
    DeleteSheetController,
    RegisterSheetCutController,
    // Profile
    CreateProfileController,
    FetchProfilesController,
    FetchAllProfilesController,
    GetProfileByIdController,
    EditProfileController,
    DeleteProfileController,
    ReduceProfileStockController,
    RegisterProfileCutController,
    // Inventory Movements
    FetchInventoryMovementsController,
    RegisterInventoryMovementController,
    // Metrics
    GetDashboardMetricsController,
    GetInventoryMovementsMetricsController,
    GetReportsMetricsController,
    // Auth & Users
    AuthenticateController,
    GetMeController,
    CreateUserController,
    FetchUsersController,
    EditUserController,
    DeleteUserController,
    // Cutting Gas
    CreateCuttingGasController,
    FetchCuttingGasesController,
    EditCuttingGasController,
    ToggleCuttingGasActiveController,
    GetCuttingGasByIdController,
    // Additional Services
    CreateAdditionalServiceController,
    FetchAdditionalServicesController,
    EditAdditionalServiceController,
    ToggleAdditionalServiceActiveController,
    // Setup Rate
    CreateSetupRateController,
    FetchSetupRatesController,
    EditSetupRateController,
    ToggleSetupRateActiveController,
  ],
  providers: [
    // Material
    RegisterMaterialUseCase,
    FetchMaterialsUseCase,
    GetMaterialByIdUseCase,
    EditMaterialUseCase,
    DeleteMaterialUseCase,
    // Client
    RegisterClientUseCase,
    FetchClientsUseCase,
    GetClientByDocumentUseCase,
    EditClientUseCase,
    DeleteClientUseCase,
    // Sheet
    RegisterSheetUseCase,
    GetSheetByIdUseCase,
    ReduceSheetStockUseCase,
    FetchSheetsUseCase,
    FetchAllSheetsUseCase,
    EditSheetUseCase,
    DeleteSheetUseCase,
    RegisterSheetCutUseCase,
    // Profile
    RegisterProfileUseCase,
    FetchProfilesUseCase,
    FetchAllProfilesUseCase,
    GetProfileByIdUseCase,
    EditProfileUseCase,
    DeleteProfileUseCase,
    ReduceProfileStockUseCase,
    RegisterProfileCutUseCase,
    // Inventory Movements
    FetchInventoryMovementsUseCase,
    RegisterInventoryMovementUseCase,
    // Metrics
    AnalyticsService,
    GetDashboardCardsMetricsUseCase,
    GetInventoryMovementsMetricsUseCase,
    GetReportsMetricsUseCase,
    // Auth & Users
    AuthenticateUserUseCase,
    GetCurrentUserUseCase,
    RegisterUserUseCase,
    FetchUsersUseCase,
    EditUserUseCase,
    DeleteUserUseCase,
    // Cutting Gas
    RegisterCuttingGasUseCase,
    FetchCuttingGasesUseCase,
    EditCuttingGasUseCase,
    ToggleCuttingGasActiveUseCase,
    GetCuttingGasByIdUseCase,
    // Additional Services
    CreateAdditionalServiceUseCase,
    FetchAdditionalServicesUseCase,
    EditAdditionalServiceUseCase,
    ToggleAdditionalServiceActiveUseCase,
    // Setup Rate
    CreateSetupRateUseCase,
    FetchSetupRatesUseCase,
    EditSetupRateUseCase,
    ToggleSetupRateActiveUseCase,
    // Quote
    CalculateQuoteTotalsUseCase,
    CreateQuoteUseCase,
    AddQuoteItemUseCase,
    FetchQuotesUseCase,
    GetQuoteByIdUseCase,
    UpdateQuoteUseCase,
    UpdateQuoteItemUseCase,
    RemoveQuoteItemUseCase,
    ReplaceQuoteItemServicesUseCase,
    TransitionQuoteStatusUseCase,
  ]
})
export class HttpModule { }