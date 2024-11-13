import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";

const TransactionType = { ...TransactionRegistrationType };

type TransactionType = typeof TransactionType;

export default TransactionType;
