export class PaymentUtil {
  static calculateNextPaymentDate(startDate: Date): Date {
    const today = new Date();
    const nextPaymentDate = new Date(startDate);
    while (nextPaymentDate <= today) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    return nextPaymentDate;
  }
}
