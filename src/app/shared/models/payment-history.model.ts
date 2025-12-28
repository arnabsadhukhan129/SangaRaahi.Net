interface Time {
  from: string,
  to: string
}

export interface PaymentHistory {
  id: string,
  userId: string,
  email: string,
  phoneCode: string,
  phone: string,
  memberType: string,
  createdAt: string,
  amount: any,
  currency: string,
  noOfAttendees: string,
  paymentMode: string,
  rsvpStatus: string,
  paymentDetails: any,
  name: string
}

export interface SinglePaymentDetails {
  id: string,
  amount: any,
  paymentMode: string,
  currency: string,
  paymentStatus: string,
  transactionId: string,
  cardNo: string,
  accountNo: string
}