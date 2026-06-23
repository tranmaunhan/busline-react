export const PAYMENT_BANK_ID = '970432'
export const PAYMENT_ACCOUNT_NO = '0352789648'
export const PAYMENT_ACCOUNT_NAME = 'TRAN MAU NHAN'
export const PAYMENT_QR_TEMPLATE = 'compact2'

export const buildVietQrUrl = (amount: number, transferContent: string) =>
  `https://img.vietqr.io/image/${PAYMENT_BANK_ID}-${PAYMENT_ACCOUNT_NO}-${PAYMENT_QR_TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent,
  )}&accountName=${encodeURIComponent(PAYMENT_ACCOUNT_NAME)}`
