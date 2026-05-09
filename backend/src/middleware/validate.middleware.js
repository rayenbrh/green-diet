import { validationResult } from 'express-validator'

export function validate(req, res, next) {
  const errs = validationResult(req)
  if (!errs.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation échouée',
      errors: errs.array().map((e) => ({ field: e.path || e.param, message: e.msg })),
    })
  }
  next()
}
