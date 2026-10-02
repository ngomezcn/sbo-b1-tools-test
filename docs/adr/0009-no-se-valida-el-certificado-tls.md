---
status: accepted
---

# El plugin de uso y el Setup nunca validan el certificado TLS

Los Service Layer de B1 usan casi siempre certificados autofirmados, también en producción, y el desarrollador lo da por habitual. Por eso el Setup y el plugin de uso se conectan sin validar el certificado en ningún entorno, y no hay opción para activarlo. Se descartó un campo por entorno y exigir instalar el certificado en Node porque añaden fricción a todos los desarrolladores para un riesgo que ya asumen. El coste asumido es que la conexión es vulnerable a un intermediario en la red; la protección de las credenciales depende de que el desarrollador opere desde una red de confianza.
