export enum TransactionKind {
  registration = "limited-partnership-registration",
  transition = "limited-partnership-transition",
  postTransition = "limited-partnership-post-transition"
}

export enum TransactionStatus {
  open = "open",
  closedPendingPayment = "closed pending payment"
}
