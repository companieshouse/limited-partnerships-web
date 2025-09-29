export enum TransactionKind {
  registration = "limited-partnership-registration",
  transition = "limited-partnership-transition",
  postTransition = "default"
}

export enum TransactionStatus {
  open = "open",
  closedPendingPayment = "closed pending payment"
}
