import { QuoteItemService } from '@/domain/enterprise/entities/quote-item-service'

export class QuoteItemServicePresenter {
  static toHTTP(service: QuoteItemService) {
    return {
      id: service.id.toString(),
      serviceId: service.serviceId.toString(),
      serviceName: service.serviceName,
      unitLabel: service.unitLabel,
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      totalPrice: service.totalPrice,
    }
  }
}
