/**
 * @file asyncHandler.js
 * @description Higher-order middleware function to wrap asynchronous route handlers.
 *
 * Eliminates repetitive try-catch blocks across controllers by catching
 * any rejected Promises and passing them directly to Express's next() error pipeline.
 *
 * @param {Function} fn Async controller/handler function (req, res, next)
 * @returns {import('express').RequestHandler}
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
