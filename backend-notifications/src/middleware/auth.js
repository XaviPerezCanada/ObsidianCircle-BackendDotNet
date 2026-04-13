'use strict';
const jwt = require('jsonwebtoken');

const JWT_SECRET   = process.env.JWT_SECRET;
const JWT_ISSUER   = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

/**
 * Middleware que valida el JWT emitido por .NET.
 * Rechaza con 401 si falta el token o no es válido.
 * Si es válido, añade `req.user` con los claims del token.
 */
function requireAuth(req, res, next) {
  // Sin JWT_SECRET configurado → modo desarrollo sin auth
  if (!JWT_SECRET) {
    console.warn('⚠️  [Auth] JWT_SECRET no configurado — modo sin autenticación');
    req.user = { sub: 'anonymous', email: 'dev@local' };
    return next();
  }

  // Extraer el Bearer token del header Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      detail: 'Se requiere Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const options = { algorithms: ['HS256'] };
    if (JWT_ISSUER)   options.issuer   = JWT_ISSUER;
    if (JWT_AUDIENCE) options.audience = JWT_AUDIENCE;

    const decoded = jwt.verify(token, JWT_SECRET, options);

    // Normalizar claims — .NET puede usar "sub" o "nameid" para el ID
    req.user = {
      sub:   decoded.sub   || decoded.nameid || decoded.id || 'unknown',
      email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      name:  decoded.name  || decoded.unique_name || '',
      raw:   decoded,
    };

    console.log(`🔑 [Auth] Usuario autenticado: ${req.user.email || req.user.sub}`);
    next();
  } catch (err) {
    const detail = err.name === 'TokenExpiredError'
      ? 'El token ha expirado'
      : err.name === 'JsonWebTokenError'
      ? 'Token inválido o firmado con secret incorrecto'
      : err.message;

    console.warn(`⚠️  [Auth] JWT rechazado: ${detail}`);
    return res.status(401).json({ error: 'No autorizado', detail });
  }
}

module.exports = { requireAuth };
