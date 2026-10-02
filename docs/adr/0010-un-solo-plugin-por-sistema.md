---
status: accepted
---

# Un solo plugin por sistema, con Setup, uso y documentación

El toolkit se instala completo: no hay que elegir partes. Cada sistema es un único plugin con tres partes (Setup, uso y documentación) y un código común que es una carpeta normal del plugin, sin paquete compartido ni compilación por plugin. Sustituye al ADR 0006 (código compartido compilado en cada plugin) y a la parte del ADR 0004 que permitía consultar la documentación sin el plugin de uso. Se mantiene del ADR 0004 que hay una sola documentación por sistema y que la Versión de B1 se declara en el Setup. Se descartó mantener tres plugins que se instalan juntos porque conservaría el problema de compartir código sin importar entre plugins y la excepción de que la documentación no necesita el uso, a cambio de nada. El coste asumido es que no se puede instalar solo la documentación. El TypeScript sigue compilándose desde la fábrica a JavaScript (ADR 0005); el compilado no se edita a mano.
