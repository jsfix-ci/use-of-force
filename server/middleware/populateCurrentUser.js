const logger = require('../../log')

module.exports = userService => async (req, res, next) => {
  res.locals = {
    ...res.locals,
    currentUrlPath: req.baseUrl + req.path,
    hostname: req.hostname,
  }
  try {
    const user = res.locals.user && (await userService.getSelf(res.locals.user.token))

    if (user) {
      res.locals.user = { ...user, ...res.locals.user }
    } else {
      logger.info('No user available')
    }
  } catch (error) {
    logger.error(error, `Failed to retrieve user for: ${res.locals.user}`)
  }
  next()
}
