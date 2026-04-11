import { QuoteItemService } from '@/domain/enterprise/entities/quote-item-service'

export class QuoteItemServicePresenter {
  static toHTTP(service: QuoteItemService) {
    return {
      id: service.id.toString(),
      serviceId: service.serviceId.toString(),
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      totalPrice: service.totalPrice,
    }
  }
}
